const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');

const { mongoose, dbConnect } = require('./db/mongoose');

// Load Middleware

const bodyParser = require('body-parser');
app.use(bodyParser.json());

// CORS headers middleware

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  res.header("Access-Control-Expose-Headers", 
  "x-access-token, x-refresh-token");

  next();
});

// Checa se a request tem um token JWT valido

const authenticate = (req, res, next) => {

  const token = req.header('x-access-token');
  
  jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
    if (err) {
      // JWT inválido
      res.status(401).send(err);
    } else {
      req.user_id = decoded._id;
      next();
    }
  })
}

// Verify Refresh Token Middleware

const verifySession = (req, res, next) => {
  let refreshToken = req.header('x-refresh-token');

  let _id = req.header('_id');

  User.findByIdAndToken(_id, refreshToken).then(user => {
    if (!user) {
      // Usuário não encontrado
      return Promise.reject({
        'error': 'User not found. Make sure that the refresh token and user id are correct.'
      });
    }

    // Usuário encontrado

    req.user_id = user._id;
    req.userObject = user;
    req.refreshToken = refreshToken;

    let isSessionValid = false;

    user.sessions.forEach(session => {
      if (session.token === refreshToken) {
        // Verificando se a seção expirou
        if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
          // Refresh token não expirado
          isSessionValid = true;
        }
      }
    });

    if (isSessionValid) {
      next();
    } else {
      return Promise.reject({
        'error': 'Refresh token has expired or the session is invalid'
      });
    }
  }).catch(err => {
    res.status(401).send(err);
  })
}

// mongoose models

const { List, Task, User } = require('./db/models/index');

// List Handlers

// List Routes

app.get('/lists', authenticate, (req, res) => {
  // retorna um array de todas as listas do usuário no BD
  List.find({
    _userId: req.user_id
  })
    .then(lists => {
      res.send(lists);
    })
    .catch(err => console.log(err));
});

app.post('/lists', authenticate, (req, res) => {
  // cria uma nova lista e retorna ao usuário
  let title = req.body.title;

  let newList = new List({
    title,
    _userId: req.user_id
  });

  newList.save()
    .then(result => res.send(result));
});

app.patch('/lists/:id', authenticate, (req, res) => {
  // atualiza uma lista especificada por id com novos valores
  List.findOneAndUpdate({ 
    _id: req.params.id,
    _userId: req.user_id 
  }, {
    $set: req.body
  }).then(() => res.send({ message: 'Updated' }))
    .catch(err => console.log(err));
});

app.delete('/lists/:id', authenticate, (req, res) => {
  // remove uma lista especificada por id
  List.findOneAndRemove({ 
    _id: req.params.id,
    _userId: req.user_id 
  })
    .then(result =>  {
      res.send(result);

      // remove todas as tarefas da lista
      deleteTasksFromList(result['_id']);
    })
    .catch(err => console.log(err));

  
});

// Task Routes

app.get('/lists/:listId/tasks', authenticate, (req, res) => {
  // retorna um array de todas as tarefas em uma lista
  Task.find({ _listId: req.params.listId })
    .then(tasks => {
      res.send(tasks);
    })
    .catch(err => console.log(err));
});

app.get('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {
  // retorna um array de todas as tarefas em uma lista
  Task.findOne({ 
    _listId: req.params.listId,
    _id: req.params.taskId
  })
    .then(task => {
      res.send(task);
    })
    .catch(err => console.log(err));
});

app.post('/lists/:listId/tasks', authenticate, (req, res) => {
  // cria uma nova tarefa em uma lista e retorna ao usuário

  List.findOne({
    _id: req.params.listId,
    _userId: req.user_id
  }).then(list => {
    if (list) {
      let newTask = new Task({
        title: req.body.title,
        _listId: req.params.listId
      });

      newTask.save()
        .then(result => res.send(result));
    } else {
      res.sendStatus(404);
    }
  });
});

app.patch('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {
  // atualiza uma tarefa de uma lista especificada por id com novos valores

  List.findOne({
    _id: req.params.listId,
    _userId: req.user_id
  }).then(list => {
    if (list) {
      Task.findOneAndUpdate({
        _listId: req.params.listId,
        _id: req.params.taskId
        }, {
        $set: req.body
      }).then(() => res.send({ message: 'Updated' }))
        .catch(err => console.log(err));
    } else {
      res.sendStatus(404);
    }
  });
});

app.delete('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {
  // remove uma tarefa de uma lista especificada por id

  List.findOne({
    _id: req.params.listId,
    _userId: req.user_id
  }).then(list => {
    if (list) {
      Task.findOneAndRemove({ 
        _listId: req.params.listId,
        _id: req.params.taskId 
      })
        .then(result => res.send(result))
        .catch(err => console.log(err));
    } else {
      res.sendStatus(404);
    }
  });
});

// USER Routes

app.post('/users', (req, res) => {
  // cadastra um novo usuário

  let body = req.body;
  let newUser = new User(body);

  newUser.save().then(() => {
    return newUser.createSession();
  }).then(refreshToken => {
    // Sessão criada com sucesso - refreshToken retornado
    // gera uma auth access token para o usuário
    return newUser.generateAccessAuthToken().then(accessToken => {
      // auth access token gerado e retornando os tokens
      
      return { accessToken, refreshToken };
    });
  }).then(authTokens => {
    // envia resposta ao usuário com os auth tokes no HEADER e o user object no BODY
    res 
      .header('x-refresh-token', authTokens.refreshToken)
      .header('x-access-token', authTokens.accessToken)
      .send(newUser);
  }).catch(err => {
    res.status(400).send(err);
  });
});

app.post('/users/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  User.findByCredentials(email, password).then(user => {
    return user.createSession().then(refreshToken => {
      // Sessão criada com sucesso - refreshToken retornado
      // gera uma auth access token para o usuário

      return user.generateAccessAuthToken().then(accessToken => {
        // auth access token gerado e retornando os tokens
        return { accessToken, refreshToken };
      });
    }).then(authTokens => {
      // envia resposta ao usuário com os auth tokes no HEADER e o user object no BODY
        res 
        .header('x-refresh-token', authTokens.refreshToken)
        .header('x-access-token', authTokens.accessToken)
        .send(user);
        }).catch(err => {
          res.status(400).send(err);
        });
  });
});

app.get('/users/me/access-token', verifySession, (req, res) => {
  req.userObject.generateAccessAuthToken().then(accessToken => {
    res.header('x-access-token', accessToken).send({ accessToken });
  }).catch(err => {
    res.status(400).send(err);
  })
});

// HELPER Methods

const deleteTasksFromList = _listId => {
  Task.deleteMany({
    _listId
  }).then(() => {
    console.log(`Tasks from ${_listId} were deleted!`);
  })
}

// connecting mongoose and app Listen

dbConnect().then(result => {
    app.listen(3000, () => console.log('Listening to port 3000'));
});


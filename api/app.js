const express = require('express');
const app = express();

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

app.get('/lists', (req, res) => {
  // retorna um array de todas as listas no BD
  List.find()
    .then(lists => {
      res.send(lists);
    })
    .catch(err => console.log(err));
});

app.post('/lists', (req, res) => {
  // cria uma nova lista e retorna ao usuário
  let title = req.body.title;

  let newList = new List({
    title
  });

  newList.save()
    .then(result => res.send(result));
});

app.patch('/lists/:id', (req, res) => {
  // atualiza uma lista especificada por id com novos valores
  List.findOneAndUpdate({ _id: req.params.id }, {
    $set: req.body
  }).then(() => res.send({ message: 'Updated' }))
    .catch(err => console.log(err));
});

app.delete('/lists/:id', (req, res) => {
  // deleta uma lista especificada por id
  List.findOneAndRemove({ _id: req.params.id })
    .then(result => res.send(result))
    .catch(err => console.log(err));
});

// Task Routes

app.get('/lists/:listId/tasks', (req, res) => {
  // retorna um array de todas as tarefas em uma lista
  Task.find({ _listId: req.params.listId })
    .then(tasks => {
      res.send(tasks);
    })
    .catch(err => console.log(err));
});

app.get('/lists/:listId/tasks/:taskId', (req, res) => {
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

app.post('/lists/:listId/tasks', (req, res) => {
  // cria uma nova tarefa em uma lista e retorna ao usuário
  let title = req.body.title;
  let listId = req.params.listId;

  let newTask = new Task({
    title,
    _listId: listId
  });

  newTask.save()
    .then(result => res.send(result));
});

app.patch('/lists/:listId/tasks/:taskId', (req, res) => {
  // atualiza uma tarefa de uma lista especificada por id com novos valores
  Task.findOneAndUpdate({
    _listId: req.params.listId,
    _id: req.params.taskId
    }, {
    $set: req.body
  }).then(() => res.send({ message: 'Updated' }))
    .catch(err => console.log(err));
});

app.delete('/lists/:listId/tasks/:taskId', (req, res) => {
  // deleta uma tarefa de uma lista especificada por id
  Task.findOneAndRemove({ 
    _listId: req.params.listId,
    _id: req.params.taskId 
  })
    .then(result => res.send(result))
    .catch(err => console.log(err));
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

// connecting mongoose and app Listen

dbConnect().then(result => {
    app.listen(3000, () => console.log('Listening to port 3000'));
});


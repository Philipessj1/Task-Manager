const express = require('express');
const app = express();

const { mongoose, dbConnect } = require('./db/mongoose');

const bodyParser = require('body-parser');
app.use(bodyParser.json());

// CORS headers middleware

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// mongoose models

const { List, Task } = require('./db/models/models');

// connecting mongoose

dbConnect()
  .then(result => {
    app.listen(3000, () => console.log('Listening to port 3000'));
  });

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
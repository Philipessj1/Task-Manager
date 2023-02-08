// conexão com mongodb

const mongoose = require('mongoose');

const dbURI = 'mongodb+srv://netninja:test123@nodetutorial.k7she4t.mongodb.net/task-manager?retryWrites=true&w=majority';

mongoose.set('strictQuery', true);

const dbConnect = async () => {
  await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => console.log('connected to db'))
    .catch(err => console.log(err));
}

module.exports = {
  mongoose, dbConnect
};

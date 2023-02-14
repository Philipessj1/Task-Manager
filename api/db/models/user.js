const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const _ = require('lodash');
const jwt = require('jsonwebtoken');

const crypto = require('crypto');

const bcrypt = require('bcryptjs');

// JWT Secret

const jwtSecret = '739ab66si34513nh95678679b77fi89gdr0763hjuy918vd1';

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  sessions: [{
    token: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Number,
      required: true
    }
  }]
});

// Instance Methods

UserSchema.methods.toJSON = function() {
  // retorna o documento omitindo senha e seções

  const user = this;
  const userObject = user.toObject();


  return _.omit(userObject, ['password', 'sessions']);
}

UserSchema.methods.generateAccessAuthToken = function() {
  // cria e retorna o JSON Web Token(JWT)

  const user = this;
  return new Promise((resolve, reject) => {
    jwt.sign({ _id: user._id.toHexString() }, jwtSecret, { expiresIn: '15m' }, (err, token) => {
      if(!err) {
        resolve(token);
      } else {
        reject();
      }
    });
  });
}

UserSchema.methods.generateRefreshAuthToken = function() {
  // gera um 64byte hex string

  return new Promise((resolve, reject) => {
    crypto.randomBytes(64, (err, buf) => {
      if (!err) {
        const token = buf.toString('hex');

        return resolve(token);
      } else {
        return reject();
      }
    })
  });
}

UserSchema.methods.createSession = function() {
  const user = this;

  return user.generateRefreshAuthToken()
    .then(refreshToken => {
    return saveSessionToDatabase(user, refreshToken);
  })
    .then(refreshToken => {
      // sessão salva no BD, retorna o token
      return refreshToken;
    }).catch(err => {
      return Promise.reject('Failed to save session to database. \n' + err);
    })
}

// MODEL Methods (métodos estáticos)

UserSchema.statics.getJWTSecret = () => {
  return jwtSecret;
}


UserSchema.statics.findByIdAndToken = function(_id, token) {
  // encontra usuário por id e token
  const User = this;

  return User.findOne({
    _id,
    'sessions.token': token
  });
}

UserSchema.statics.findByCredentials = function(email, password) {
  const user = this;

  return user.findOne({ email }).then(user => {
    if (!user) return Promise.reject();
    
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if(res) resolve(user);
        else reject();
      });   
    });
  });
}

UserSchema.statics.hasRefreshTokenExpired = expiresAt => {
  let secondsSinceEpoch = Date.now() / 1000;
  if (expiresAt > secondsSinceEpoch) {
    // não expirou
    return false;
  } else {
    // expirou
    return true;
  }
}

// MIDDLEWARE
// Antes de salvar o documento do usuário, roda este código.

UserSchema.pre('save', function(next) {
  const user = this;
  const costFactor = 10;

  if(user.isModified('password')) {
    // roda se o campo de senha foi editado
    // criptografa a senha
    bcrypt.genSalt(costFactor, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      })
    })
  } else {
    next();
  }
});

// HELPER Methods

const saveSessionToDatabase = (user, refreshToken) => {
  // salva sessão no BD

  return new Promise((resolve, reject) => {
    const expiresAt = generateRefreshTokenExpiryTime();

    user.sessions.push({ 'token': refreshToken, expiresAt })

    user.save().then(() => {
      // sucesso ao salvar sessão
      return resolve(refreshToken);
    }).catch(err => {
      reject(err);
    });
  });
}

const generateRefreshTokenExpiryTime = () => {
  // gera token de refresh da sessão

  const daysUntilExpire = '10';
  const secondsUntilExpire = ((daysUntilExpire * 24) * 60) * 60;
  return ((Date.now() / 1000) + secondsUntilExpire);
}

const User = mongoose.model('User', UserSchema);

module.exports = { User };
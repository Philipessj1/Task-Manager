const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ListSchema = new Schema({
  title: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  }
}, { timestamps: true });

const List = mongoose.model('List', ListSchema);

module.exports = { List };
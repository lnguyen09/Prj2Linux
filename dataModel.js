/* The data model for the schema, which stores the users' input and the result indicating stress or no stress. */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: mongoose.ObjectId,
  Input: String,
  Result: String
});

const record = mongoose.model('user-result', userSchema);
module.exports = {record}
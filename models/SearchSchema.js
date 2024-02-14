const mongoose = require('mongoose');

const SearchSchema = new mongoose.Schema({
  title: String,
  description: String,
  
});

const Search = mongoose.model('Search', searchSchema);

module.exports = Search;

const mongoose = require('mongoose'),
    express = require('express'),
    app = express();

var db = mongoose.connection; 

mongoose.connect("mongodb://localhost:27017/ytd", function(err, db) {
  if(!err) {
    console.log("DB is connected");
  }
});

module.exports = app  
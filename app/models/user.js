var db = require('../config');
//used to help encrypt and protect passwords. Can use 
//bcrypt.compare()
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');



var User = db.Model.extend({
  //username: ""
  //password: 
});

module.exports = User;
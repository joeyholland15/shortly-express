var db = require('../config');
//used to help encrypt and protect passwords. Can use 
//bcrypt.compare()
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users',
  defaults: {
    username: "",
    password: ""
  },

  initialize: function() {
    this.on('creating', function(model, attrs, options) {
      //want to create a hash and update model password
      //with hash. 
    }); 
  }
});

module.exports = User;
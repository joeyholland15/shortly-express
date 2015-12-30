var db = require('../config');
//used to help encrypt and protect passwords. Can use 
//bcrypt.compare()
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');


// app.post('/login', function(request, response) {
//   var username = request.body.username;
//   var password = request.body.password;
//   var salt = bcrypt.genSaltSync(10);
//   var hash = bcrypt.hashSync(password, salt);
//   var userObj = db.users.findOne({ username: username, password: hash });
//   if(userObj){
//       request.session.regenerate(function(){
//           request.session.user = userObj.username;
//           response.redirect('/restricted');
//       });
//   }
//   else {
//       res.redirect('login');
//   }
// });

var User = db.Model.extend({
  tableName: 'users',
  defaults: {
    username: "",
    password: "",
    salt: ""
  },

  initialize: function() {
    this.on('creating', function(model, attrs, options) {
      //want to create a hash and update model password
      //with hash. 
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(this.get('password'), salt);
      this.set('salt', salt);
      this.set('password', hash);
    }); 
  }
});

module.exports = User;


var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var session = require("express-session");


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');
// var bcrypt = require('bcrypt-nodejs');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(session({secret: "somesecret"}));
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

var checkUser = function(request, response, next) {
  if(request.session.user) {
    next(); 
  } else {
    response.redirect('/login'); 
  }
};

//this line makes it false
app.get('/', checkUser, 
function(req, res) {
  res.render('index');
});

app.get('/create', checkUser, 
function(req, res){  
  console.log("CREATED");
  res.render('create');
});

app.get('/links', checkUser, 
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.get('/signup', 
function(req, res) {
  res.render('signup');
});


app.get('/login', function(req, res) {
  res.render('login'); 
}); 


app.get('/logout', function( req, res ) {
  req.session.destroy(function() {
    res.redirect('/'); 
  }); 
}); 

app.post('/login', function(request, response) {
  console.log("Posting to Login");
  var username = request.body.username;
  var password = request.body.password; 
  new User ({username: username})
    .fetch()
    .then(function(user){
      var hash = bcrypt.hashSync(password, user.get('salt'));
      // console.log('THESE SHOULD BE THE SAME, :', hash, user.get('password'));
      if (user.get('password') === hash){
        // console.log("Password Matches Hash");
        request.session.user = username;
        response.redirect('/');
      } else {
        // console.log("Password doesn't Match");
        response.redirect('/login');
      }
    })
    .catch(function(err) {
      console.log("Username doesn't exist");
      response.redirect('/login');
    }); 

});

app.post('/signup', function(request, response) {
  var username = request.body.username;
  var password = request.body.password; 

  new User ({username: username, password: password})
    .save()
    .then(function(user){
      console.log("Logged: ", user);
      request.session.user = username;
      response.redirect('/');
    });
  
});



app.post('/links', 
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        Links.create({
          url: uri,
          title: title,
          base_url: req.headers.origin
        })
        .then(function(newLink) {
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/



/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits')+1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);

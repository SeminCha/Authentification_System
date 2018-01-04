var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var app = express();
app.locals.pretty=true;
app.use(bodyParser.urlencoded({ extended:false}));
app.use(session({
  secret: '1234abcd!@#$',
  resave: false,
  saveUninitialized: true,
  store: new MySQLStore({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '111111',
    database: 'o2'
  })
}))
app.use(passport.initialize());
app.use(passport.session());
app.set('views', './views');
app.set('view engine', 'jade');

app.listen(3000, function() {
  console.log('Connected, 3000 port');
})

app.get('/', function(req, res) {
  res.render('home');
});

// 회원가입 버튼 클릭 후
app.get('/create', function(req, res) {
  res.render('create');
})

//회원가입 버튼 완료 클릭 후
app.post('/create', function(req, res) {
  var id = req.body.id;
  var password = req.body.password;
  var name = req.body.name;
  res.redirect('/');
});
//로그인 버튼 클릭
app.get('/login', function(req, res) {
  res.render('login');
});
passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(id, done) {
  var user = {
    id:'cing',
    password:'111',
    name:'차세민'
  };
  User.findById(id, function(err, user) {
    if(id===user.id) {
      done(null, id);
    }
  });
});
passport.use(new LocalStrategy(
  function(username, password, done) {
      var user = {
        id:'cing',
        password:'111',
        name:'차세민'
      };
      var id = username;
      var password = password;
      if(id===user.id && password === user.password) {
        done(null, id);
      } else {
        done(null, false);
      }
  }
));
// 로그인 버튼클릭 후 유저인지 관리자인지 체크
app.post('/login',
  passport.authenticate(
    'local',
    {
      successRedirect:'/user',
      failureRedirect: '/login',
      failureFlash: false
    }
  )
);
// app.post('/login', function(req, res) {
//   var user = {
//     id:'cing',
//     password:'111',
//     name:'차세민'
//   };
//   var id = req.body.id;
//   var password = req.body.password;
//   if(id===user.id && password === user.password) {
//     req.session.displayName = user.name;
//     req.session.save(function(){
//       res.redirect('/user');
//     });
//   } else {
//     res.render('login');
//   }
// })

//---------------유저 관련 페이지
app.get('/user', function(req, res) {
  if(req.session.displayName) {
    res.render('user');
  } else {
    res.redirect('/');
  }
});

// 회원탈퇴
app.get('/drop', function(req, res) {
  delete req.session.displayName;
  req.session.save(function(){
    res.redirect('/');
  });
});


//---------------관리자 관련 페이지

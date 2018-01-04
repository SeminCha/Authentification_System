var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var passport = require('passport');
var bkfd2Password = require('pbkdf2-password');
var hasher = bkfd2Password();
var LocalStrategy = require('passport-local').Strategy;
var mysql = require('mysql');
var conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '111111',
  database: 'o2'
});
conn.connect;
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
  hasher({password:req.body.password}, function(err, pass, salt, hash) {
    var user = {
      authId:'local:'+req.body.username,
      username:req.body.username,
      password:hash,
      salt:salt,
      displayName:req.body.displayName
    };
    var sql = 'INSERT INTO users SET ?';
    conn.query(sql, user, function(err, results){
      if(err) {
        console.log(err);
        res.status(500);
      } else {
        res.redirect('/');
      }
    });
  });
});
//로그인 버튼 클릭
app.get('/login', function(req, res) {
  res.render('login');
});
passport.serializeUser(function(user, done) {
  console.log('serializeUser', user);
  done(null, user.authId);
});
passport.deserializeUser(function(id, done) {
  console.log('deserializeUser', id);
  var sql = 'SELECT * FROM users WHERE authId=?';
  conn.query(sql, [id], function(err, results) {
    console.log(sql, err, results);
    if(err) {
      done('There is no user.');
    } else {
      done(null, results[0]);
    }
  });
});
passport.use(new LocalStrategy(
  function(username, password, done) {
      var uname= username;
      var pwd = password;
      var sql = "SELECT * FROM users WHERE authId=?";
      conn.query(sql, ['local:'+uname], function(err, results) {
        if(err){
          return done('There is no user.');
        }
        var user = results[0];
        return hasher({password:password, salt:user.salt}, function(err, pass, salt, hash){
         if(hash === user.password) {
            done(null, user);
         } else {
            done(null, false);
         }
        });
      });
}));
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

//---------------유저 관련 페이지
app.get('/user', function(req, res) {
  if(req.user) {
    if(req.user.username === 'admin') {
      res.redirect('/admin');
    } else {
      res.render('user');
    }
  } else {
    res.redirect('/');
  }
});

// 회원탈퇴
app.get('/drop', function(req, res) {
  if(req.user && req.user.username !== 'admin') {
    var sql = "DELETE FROM users WHERE authId=?";
    conn.query(sql, ['local:'+req.user.username], function(err, results) {
      if(err) {
        console.log(err);
        res.status(500);
      } else {
        req.logout();
        req.session.save(function(){
          res.redirect('/');
        });
      }
    });
  } else {
    res.redirect('/');
  }
});


//---------------관리자 관련 페이지
app.get('/admin', function(req, res) {
  if(req.user) {
      res.render('admin');
  } else {
    res.redirect('/');
  }
});

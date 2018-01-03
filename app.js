var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.locals.pretty=true;
app.use(bodyParser.urlencoded({ extended:false}));
app.set('views', './views');
app.set('view engine', 'jade');

app.listen(3000, function() {
  console.log('Connected, 3000 port');
})

app.get('/', function(req, res) {
  res.render('login');
});
//회원가입 버튼 완료 클릭 후
app.post('/', function(req, res) {
  var id = req.body.id;
  var password = req.body.password;
  var name = req.body.name;
  console.log(id+','+password+','+name);
  res.render('login');
});
// 로그인 버튼클릭 후 유저인지 관리자인지 체크
app.post('/check', function(req, res) {
  var id = req.body.id;
  var password = req.body.password;
  res.send(id+','+password);
})
// 회원가입 버튼 클릭 후
app.get('/create', function(req, res) {
  res.render('create');
})

//---------------유저 관련 페이지
app.get('/user', function(req, res) {
  res.render('login');
});


//---------------관리자 관련 페이지

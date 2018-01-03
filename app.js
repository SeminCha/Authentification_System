var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.locals.pretty=true;
app.use(bodyParser.urlencoded({ extended:false}));
app.set('views', './views_file');
app.set('view engine', 'jade');

app.listen(3000, function() {
  console.log('Connected, 3000 port');
})

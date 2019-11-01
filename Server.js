var express = require('express');
const routes = require('./scr/routes');
var app = express();

// app.use(cors());
// app.use(express.static('public'));
app.use(express.json());
app.use(routes);


app.listen(3000, function () {
  console.log('On port 3000!');
});


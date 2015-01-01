var express = require('express'),
    cons = require('consolidate');
var app = express();
var http = require('http').Server(app);
io = require('./chat_server')(http);
var _ = require('underscore');


var root = __dirname + '/public';


app.engine('html', cons.handlebars);

// set .html as the default extension 
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use('/static', express.static(root));


app.get('/', function (req, res) {
    res.render('client1');
});


http.listen(3000, function () {
    console.log('listening on *:3000');
});

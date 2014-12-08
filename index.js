var express = require('express'),
    cons = require('consolidate');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('underscore');


var root = __dirname + '/public';
var rooms = {}, //temporary too
    users = {},
    userdata = {}; //temporary. Will use redis

app.engine('html', cons.handlebars);

// set .html as the default extension 
app.set('view engine', 'html');
app.set('views', __dirname + '\\views');

app.use('/static', express.static(root));


app.get('/', function (req, res) {
    res.render('client');
});

var chat = io.of('/chat');

chat.on('connection', function (socket) {
    console.log('A WILD CONNECTION APPEARS');

    socket.on('register', function (info) {
        //Some validations here
        var username = info.username;
        
        users[socket.id] = username;
        userdata[username] = info;
        
        socket.emit('registered', true);
        
        socket.join(username+'-private');
    });

    socket.on('join', function(data){
        var username = users[socket.id];
        var room = data.room;
        
        if(!(room in rooms)){
            rooms[room] = {
                users: [],
                name: room
            };
        }
        
        rooms[room].users.push(username);
        
        socket.emit('joined', {
            room: room,
            success: true
        });
        socket.emit('users', { room: room, users: rooms[room].users });
        socket.join(room);
        socket.to(room).emit('join', {
            username: username,
            room: room
        });

    });
    
    socket.on('private', function(msg){
        var target = msg.target;
        var username = users[socket.id];
        socket.to(target + '-private').emit('private', {
            sender: username,
            target: target,
            message: msg.message
        });
    });
    
    socket.on('message', function (msg) {
        var room = msg.room;
        var username = users[socket.id];
        socket.to(room).emit('message', {
            sender: username,
            room: room,
            message: msg.message
        });
    });

    socket.on('disconnect', function () {
        var username = users[socket.id];
        console.log('A user disconnected');
        for (var room in rooms){
            if(_.contains(rooms[room].users, username)){
                rooms[room].users = _.without(room.users, username);
                chat.to(room.name).emit('leave', {room: room.name, username: username});
            }
        }
        delete userdata[username];
        delete users[socket.id];
    });
    
    socket.on('directory', function(){
        var directory = _.map(rooms, function(room){
            return {
                room: room.name,
                users: room.users.length
            }
            
        });
        socket.emit('directory', directory)
    });
    
});


function get_rooms_by_username(username){
    return _.find(rooms, function(room){
        return _.contains(room.users, username);
    });
}


http.listen(80, function () {
    console.log('listening on *:80');
});
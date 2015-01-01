var express = require('express');
var app = express();
var http = require('http').Server(app);
var _ = require('underscore');



exports = module.exports = function StartChat(http) {
    var io = require('socket.io')(http);
    var redis = require('socket.io-redis');
    io.adapter(redis({
        host: 'localhost',
        port: 6379
    }));
    var storage = require("redis").createClient(6379, 'localhost');
    var chat = io.of('/chat');

    var users = {};

    function register_user(username, id, info) {
        if (_.find(users, function (value) {
            return value == username
        })) {
            return false
        }
        users[id] = username;
        console.log(info);
        storage.hmset('userdata:' + username, info, function(err, value) {
            console.log('Crap. Value: ' + value);
        });
        return true;
    }

    function join_room(room, username) {
        storage.sadd('rooms', room);
        storage.sadd('rooms:' + room + ':users', username)
        return true;
    }

    function get_users(room, callback) {
        storage.smembers('rooms:' + room + ':users', _.partial(function (room, callback, err, resp) {
            if (err) {
                callback(room, false, resp);
            } else {
                callback(room, true, resp);
            }

        }, room, callback));
        //console.log(storage.smembers('rooms:' + room + ':users'));
        return storage.smembers('rooms:' + room + ':users');
    }

    function get_rooms(callback) {
        storage.smembers('rooms', function (err, rooms) {
            //pre-processing here
            callback(err, rooms);
        });
    }

    function disconnect_user(id, callback) {
        get_username(id, function (err, username) {
            if (err) {
                console.log('Error getting username. Socket id: id. Error: ' + err);
                return;
            }
            
            console.log(username);
            
            get_rooms(function (err, rooms) { 
                if (err) {
                    console.log('An error occurred while trying to retrieve the list of rooms. Error: ' + err);
                    return;
                }
                
                _.each(rooms, function(room) {
                    storage.srem('rooms:' + room + ':users', username, function(err, removed){
                        console.log(room  + ' removed: ' + removed);
                        if(removed > 0) {
                            callback(room, username);
                        }
                    })
                });
                
                storage.del('userdata:' + username);
                //delete user
                delete users[id];
            });
            

        });
    }

    function user_registered(id) {
        return id in users;
    }

    function get_username(id, callback) {
        //some algorithim for determining server-specific username
        callback(false, users[id]);
    }

    chat.on('connection', function (socket) {
        console.log('A WILD CONNECTION APPEARS');
        socket = _.bindAll(socket, 'emit', 'join', 'to');

        socket.on('register', function (info) {
            
            var username = info.username.replace(/\s+/g, '');

            if (register_user(username, socket.id, info)) {
                socket.emit('registered', true);
                socket.join(username + '-private');
            } else {
                socket.emit('registered', false);
            }

        });

        socket.on('join', function (data) {
            if (!user_registered(socket.id))
                return;
            var username = users[socket.id];
            var room = data.room.replace(/[\s#]/g, '');

            if (join_room(room, username)) {

                get_users(room, _.partial(function (socket, room, success, users) {
                    socket.emit('joined', {
                        room: room,
                        success: true
                    });


                    socket.emit('users', {
                        room: room,
                        users: users
                    });

                    socket.join(room);

                    socket.to(room).emit('join', {
                        username: username,
                        room: room
                    });
                }, socket));




            }

        });

        socket.on('private', function (msg) {
            if (!user_registered(socket.id))
                return;
            var target = msg.target.replace(/\s+/, '');
            var username = users[socket.id];

            socket.to(target + '-private').emit('private', {
                sender: username,
                target: msg.target,
                message: msg.message
            });
        });

        socket.on('message', function (msg) {
            if (!user_registered(socket.id))
                return;
            var room = msg.room;
            var username = users[socket.id];

            socket.to(room).emit('message', {
                sender: username,
                room: room,
                message: msg.message
            });
        });

        socket.on('disconnect', function () {
            if (!user_registered(socket.id))
                return;
            //            var username = users[socket.id];
            console.log('A user disconnected');
            disconnect_user(socket.id, _.partial(function (socket, room, username) {
                socket.to(room).emit('leave', {
                    room: room,
                    username: username
                });
            }, socket));


        });

        socket.on('directory', function () {
            if (!user_registered(socket.id))
                return;
            var directory = _.map(rooms, function (room) {
                return {
                    room: room.name,
                    users: room.users.length
                }

            });
            socket.emit('directory', directory)
        });

    });


    return io;
}
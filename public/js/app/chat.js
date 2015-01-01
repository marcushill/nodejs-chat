define(['socketio', 'underscore', 'app/utils', 'augment', 'EventEmitter', 'app/chat-tabs'],
    function (io, _, utils, augment, ee, tabs) {

        var defclass = augment.defclass;

        var Room = augment(ee, function (uber) {
            this.constructor = function Room(name) {
                uber.constructor.call(this);
                this.name = name;
                this.cache = new utils.SizedCache(100);
                uber.defineEvents(['received', 'send', 'leave']);
                this.unread = 0;
            };

            this.addMessage = function (msg) {
                //some logic here
                var message = msg.sender + ": " + msg.message;
                this.cache.push(message);
                this.trigger('received', [message]);
            };

            this.sendMessage = function (msg) {
                //some logic goes here
                this.trigger('send', [this.name, msg]);
            };

            this.getCachedMessages = function () {
                return this.cache.getAll();
            };

            this.leave = function () {
                this.trigger('leave', this.name);
            }
        });


        var PublicRoom = augment(Room, function (uber) {
            this.constructor = function PublicRoom(name) {
                uber.constructor.call(this, name);
                this.users = [];
                uber.defineEvents(['userJoin', 'userLeave', 'usersUpdated', 'openPrivate']);
                //hack until I can figure out how to fix augment
                this._events = {};
            };

            this.addUser = function (user) {
                this.users.push(user);
                this.trigger('userJoin', [user.username]);
            };

            this.removeUser = function (username) {
                this.users = _.filter(this.users, function (user) {
                    return user.username !== username;
                });
                this.trigger('userLeave', [username]);
            };

            this.setUsers = function (users) {
                this.users = users;
                //Will fix users on server soon
                //this.trigger('usersUpdated', [_.pluck(this.users, 'username')]);
                this.trigger('usersUpdated', [this.users]);
            };

            this.openPrivate = function (username) {
                this.trigger('openPrivate', [username]);
            };
        });


        var PrivateRoom = augment(Room, function (uber) {
            this.constructor = function PrivateRoom(user) {
                this.user = user;
                uber.constructor.call(this, user);
                this._events = {};
            }
        });



        var SocketChat = defclass({
            constructor: function SocketChat(userdata, opts) {
                this.user = userdata;
                this.socket = io('/chat');
                this.manager = new tabs.ChatTabManager(opts.div);

                var callback = function (success) {
                    console.log(success);
                    if (success) {
                        if (_.isFunction(opts.success)) {
                            opts.success();
                        }
                    } else {
                        alert('Registration failed. Username in use.');
                    }
                };
                callback = _.bind(callback, this);
                this.socket.on('registered', callback);

                //Remember to handle a send and loop back a recieved with you as the sender

                this.rooms = {};
                this.init();
                //need to handle reconnect at some point
                this.connect(_.bind(function () {
                    this.joinRoom(opts.room);
                }, this));
            },

            connect: function (callback) {
                this.socket.emit('register', this.user);
                _.each(this.rooms, function (room) {
                    if (room instanceof PublicRoom) {
                        this.joinRoom(room.name);
                    }
                }, this);

                if (callback) {
                    callback();
                }
            },

            joinRoom: function (room) {
                this.socket.emit('join', {
                    room: room
                });
            },

            leaveRoom: function (room) {
                this.socket.emit('leave', {
                    room: room
                });
                var hash = utils.hashCode('pub-' + room);
                delete this.rooms[hash];
            },
            
            leavePrivate: function (username) {
                //add emit later
                var hash = utils.hashCode('priv-' + username);
                delete this.rooms[hash];
            },

            sendMessage: function (room, msg) {
                var data = {
                    message: msg,
                    room: room
                };
                this.socket.emit('message', data);
                data.sender = this.user.username;
                this.receiveMessage(data);
            },

            sendPrivate: function (target, msg) {
                var data = {
                    message: msg,
                    target: target
                };
                this.socket.emit('private', data);
                data.sender = this.user.username;
                this.receivePrivate(data);
            },

            receivePrivate: function (msg) {
                //correctly routes privates you sent
                var room = msg.sender === this.user.username ? this.getPrivateRoom(msg.target) : this.getPrivateRoom(msg.sender);
                room.addMessage(msg);
            },

            receiveMessage: function (msg) {
                var room = this.getPublicRoom(msg.room);
                if (room) {
                    room.addMessage(msg);
                }
            },

            receiveUsers: function (users) {
                var room = this.getPublicRoom(users.room);
                if (room) {
                    room.setUsers(users.users);
                }
            },

            receiveJoin: function (join) {
                var room = this.getPublicRoom(join.room);
                if (room) {
                    //temporary until I can fix the server (or client?)
                    var user = {
                        username: join.username
                    };
                    room.addUser(user);
                }
            },

            receiveJoined: function (join) {
                if (join.success) {
                    var room = this.getPublicRoom(join.room, true);
                    room.on('leave', this.leaveRoom);
                    room.on('openPrivate', _.bind(function (username) {
                        //opening is a side effect
                        var room = this.getPrivateRoom(username);
                        room.on('leave', this.leavePrivate);
                    }, this));
                }
            },

            receiveLeave: function (leave) {
                var room = this.getPublicRoom(leave.room);
                if (room) {
                    room.removeUser(leave.username);
                }
            },

            getPublicRoom: function (room, createNew) {
                createNew = createNew ? true : false;
                var hash = utils.hashCode('pub-' + room);
                if (_.has(this.rooms, hash)) {
                    return this.rooms[hash];
                } else if (createNew) {
                    var model = new PublicRoom(room);
                    model.on('send', this.sendMessage);
                    this.manager.addTab(new tabs.PublicRoomTabVM(model, room));
                    this.rooms[hash] = model;
                    return model;
                }

            },

            getPrivateRoom: function (username) {
                var hash = utils.hashCode('priv-' + username);
                if (_.has(this.rooms, hash)) {
                    return this.rooms[hash];
                } else {
                    var model = new PrivateRoom(username);
                    model.on('send', this.sendPrivate);
                    this.manager.addTab(new tabs.PrivateRoomTabVM(model, username));
                    this.rooms[hash] = model;
                    return model;
                }

            },

            init: _.once(function () {
                _.bindAll(this, 'joinRoom', 'leaveRoom', 'sendMessage', 'leavePrivate',
                    'sendPrivate', 'receivePrivate', 'receiveMessage', 'receiveUsers',
                    'connect', 'receiveLeave', 'receiveJoin', 'receiveJoined');
                this.manager.on('join', this.joinRoom);

                this.socket.on('message', this.receiveMessage);
                this.socket.on('private', this.receivePrivate);
                this.socket.on('users', this.receiveUsers);
                this.socket.on('leave', this.receiveLeave);
                this.socket.on('join', this.receiveJoin);
                this.socket.on('reconnect', this.connect);
                this.socket.on('joined', this.receiveJoined);

            })
        });

        return {
            SocketChat: SocketChat,
            Room: Room,
            PublicRoom: PublicRoom,
            PrivateRoom: PrivateRoom
        };
    }
);
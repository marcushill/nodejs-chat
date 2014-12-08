var SocketChat = (function (io, _) {
    'use strict';

    function Chat(userdata, opts) {
        this.socket = io('/chat');
        opts.div.html(Handlebars.templates.chat());
        this.manager = new TabManager(opts.div, this);
        this.rooms = [opts.room];
        this.user = userdata;
        
        _.bindAll(this.manager, 'route', 'routeJoin', 'routeUsers', 'joinedRoom', 'routeLeave');
        
        var callback = function (success) {
            if (success) {
                if (_.isFunction(opts.success)) {
                    opts.success();
                }
            }
        };
        callback = _.bind(callback, this, opts.success); 
        
        this.listen('message', this.manager.route);
        this.listen('private', this.manager.route);
        this.listen('join', this.manager.routeJoin);
        this.listen('users', this.manager.routeUsers);
        this.listen('leave', this.manager.routeLeave);
        this.listen('registered', callback);
        this.listen('joined', _.bind(function (join) {
            if (join.success) {
                this.manager.joinedRoom(join.room);
            }
        }, this));
        this.listen('reconnect', _.bind(this.connect, this));
        
        this.connect();

    }

    Chat.prototype.sendPrivate = function (target, msg) {
        this.socket.emit('private', {
            message: msg,
            target: target
        });
    };

    Chat.prototype.sendMessage = function (room, msg) {
        this.socket.emit('message', {
            message: msg,
            room: room
        });
    };

    Chat.prototype.joinRoom = function (room) {
        this.socket.emit('join', {
            room: room
        });
    }

    Chat.prototype.listen = function (event, event_handler) {
        this.socket.on(event, function (data) {
            event_handler(data);
        });
    }

    Chat.prototype.connect = function () {
        this.manager.closeAll();
        this.socket.emit('register', this.user);
        _.each(this.rooms, function(room){
            this.joinRoom(room);
        }, this);
    }

    return Chat;

}(io, _));
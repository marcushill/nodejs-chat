function TabManager(div, chat) {
    this.wrapper = $(div);
    this.content = this.wrapper.find("#tabs-content");
    this.list = this.wrapper.find("#tabslist");
    this.joinInput = this.wrapper.find("#join-room");
    
    this.wrapper.find("#join-btn").click(_.bind(function(){
        this.chat.joinRoom(this.joinInput.val());
        this.joinInput.val("");
    }, this));
    
    this.wrapper.find("#join-form").submit(_.bind(function(e){
        this.wrapper.find("#join-btn").click();
        e.preventDefault();
        return false;
    }, this));
    
    this.tabs = [];
    this.chat = chat;
}

TabManager.prototype = {
    addTab: function (tab) {
        tab.tab.find(".close-tab").click(tab, _.bind(function (e) {
            var tab = e.data;
            tab.close();
            this.tabs = _.without(this.tabs, tab);
        }, this));
        
        this.list.append(tab.tab);
        this.content.append(tab.content);

        this.tabs.push(tab);
        tab.show();
        return tab;
    },
    
    route: function(msg){
        var message = msg.sender + ": " + msg.message;
        if(_.has(msg, 'room')){
            _.chain(this.tabs).where({'room': msg.room}).each(function(tab){
                tab.addMessage(message);
            });
        } else if (_.has(msg, 'target')) {
            var tab = _.findWhere(this.tabs, {'user': msg.sender});
            if (tab){
                tab.addMessage(message);
            }else {
                tab = new PrivateTab(msg.sender, this);
                this.addTab(tab);
                tab.addMessage(message);
            }
        }
    },
    
    routeJoin : function(join){
        _.chain(this.tabs).where({'room': join.room}).forEach(function(tab){
            tab.addUser(join.username);
        });
    },
    
    routeLeave: function(leave){
        _.chain(this.tabs).where({'room': leave.room}).forEach(function(tab){
            tab.removeUser(leave.username);
        });
    },
    
    routeUsers: function(users){
        _.chain(this.tabs).where({'room': users.room}).forEach(function(tab){
            tab.setUsers(users.users);
        });
    },
    
    joinedRoom: function(room){
        this.addTab(new RoomTab(room, this));
    },
    
    closeAll :function(){
        _.invoke(this.tabs, 'close');
        this.tabs = [];
    }
}


function Tab(manager){
    this.stripe = true;
    this.manager = manager;
    this.chat = manager.chat;
}

Tab.prototype = {
    addMessage: function (msg) {
        var item = $('<li></li>', {
            'class': 'list-group-item list-group-item-' + ((this.stripe = !this.stripe) ? 'active' : 'danger'),
        });
        $('<p>', {
            text: msg
        }).appendTo(item);

        this.messages.append(item);
    },

    close: function () {
        this.content.remove();
        this.tab.remove();
    },
    
    show: function(){
        $(this.tab.find('a')).tab('show');
    }
}


function RoomTab (room, manager) {
    Tab.call(this, manager)
    this.room = room;
    
    var context = {
        target: room.replace(/\s*/g, ""),
        room: room
    };
    this.tab = $('<li></li>', {
        role: 'presentation'
    }).html(Handlebars.templates.tab(context));
    
    this.send = _.bind(this.chat.sendMessage, this.chat, room);
        
    this.content = $(Handlebars.templates.room(context));
    this.input = this.content.find('.sender');
    this.messages = this.content.find('.messages');
    this.users = this.content.find('.user-list');
        
    this.content.find('.send-form').submit(this, function(e){
        var tab = e.data;
        var msg = tab.input.val();
        tab.send(msg);
        tab.addMessage(tab.chat.user.username + ": " + msg);
        tab.input.val("");
        e.preventDefault();
    });
    
}

RoomTab.prototype = _.extend(Object.create(Tab.prototype), {

    addUser: function (username){
        var item = $('<li/>', {
            'class': 'list-group-item',
            'data-username': username
        });
        
        $('<p>', {
            text: username
        }).appendTo(item);
        
        $(item).hover(function () {
            $(this).toggleClass('active');
        });
        
        $(item).dblclick(this, function(e){
            var tab = e.data;
            var privateTab = _.findWhere(tab.manager.tabs, {user: $(this).data('username')});
            if (privateTab === undefined) {
                tab.manager.addTab(new PrivateTab($(this).data('username'), tab.manager))
            } else{
                privateTab.show();
            }
        });
        
        this.users.append(item);
        var users = $('#users').children("li").detach();
        users.sort(function (a, b) {
            a = $(a).data('username');
            b = $(b).data('username');
            if (a > b) return -1;
            if (a < b) return 1;
            return 0;
        });
        
        this.users.append(users);
    },
    
    setUsers: function (users) {
        this.users.empty();
        users.sort(function (a, b) {
            a = $(a).data('username');
            b = $(b).data('username');
            if (a > b) return -1;
            if (a < b) return 1;
            return 0;
        });
        
        _.each(users, function (username) {
            var item = $('<li/>', {
                'class': 'list-group-item',
                'data-username': username
            });
            
            $('<p>', {
                text: username
            }).appendTo(item);
            
            $(item).hover(function () {
                $(this).toggleClass('active');
            });
            
        $(item).dblclick(this, function(e){
            var tab = e.data;
            var privateTab = _.findWhere(tab.manager.tabs, {user: $(this).data('username')});
            if (privateTab === undefined) {
                tab.manager.addTab(new PrivateTab($(this).data('username'), tab.manager))
            } else{
                privateTab.show();
            }
        });
            
            this.users.append(item);
        }, this);
    },
    
    removeUser: function(username){
        var users = $('#users').children("li").remove('[data-username='+username+']');
    },
    
});

RoomTab.prototype.constructor = RoomTab;

function PrivateTab (user, manager) {
    Tab.call(this, manager);
    this.user = user;
    
    var context = {
        target: user.replace(/\s*/g, ""),
        room: user
    };
    this.tab = $('<li></li>', {
        role: 'presentation'
    }).html(Handlebars.templates.tab(context));
    
    this.send = _.bind(this.chat.sendPrivate, this.chat, user);
    
    this.content = $(Handlebars.templates.private(context));
    this.input = this.content.find('.sender');
    this.messages = this.content.find('.messages');
        this.content.find('.send-form').submit(this, function(e){
        var tab = e.data;
        var msg = tab.input.val();
        tab.send(msg);
        tab.addMessage(tab.chat.user.username + ": " + msg);
        tab.input.val("");
        e.preventDefault();
    });
};

PrivateTab.prototype = _.extend(Object.create(Tab.prototype), {
    
});

PrivateTab.prototype.constructor = PrivateTab;
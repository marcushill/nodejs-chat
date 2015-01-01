define(['jquery', 'underscore', 'augment', 'app/templates', 'app/tabs', 'bootstrap'],
    function ($, _, augment, templates, Tabs) {

        var ChatTabManager = augment(Tabs.TabManager, function (uber) {
            function setup_listeners() {
                //Great place to set up some event streams and properties
                $(this.wrapper).find('#join-btn').click(_.bind(function (e) {
                    this.trigger('join', [this.joinInput.val()]);
                    this.joinInput.val("");
                }, this));

                $(this.wrapper).find('#join-form').submit(_.bind(function (e) {
                    this.wrapper.find("#join-btn").click();
                    e.preventDefault();
                    return false;
                }, this))
            }

            this.constructor = function (div) {
                this.wrapper = div;
                this.wrapper.html(templates.chat());
                this.joinInput = this.wrapper.find('#join-room');
                
                uber.constructor.call(this,
                     this.wrapper.find("#tabslist"), this.wrapper.find("#tabs-content"));
                
                
                uber.defineEvents(['join']);

                _.bind(setup_listeners, this)();
            };
        });

        var RoomTabVM = augment(Tabs.TabVM, function (uber) {
            function setup_listeners() {
                _.bindAll(this, 'addMessage');

                this.content.find('.send-form').submit(this, function (e) {
                    e.preventDefault();
                    var tab = e.data; //this VM
                    var msg = tab.input.val();
                    tab.room.sendMessage(msg);
                    tab.input.val("");
                });

                this.room.on('received', this.addMessage);
            }

            this.constructor = function (room, display, id) {
                uber.constructor.call(this, display, id, 0);
                this.room = room;
                this.stripe = true;
                //Good place to use Bacon
                this.messages = this.content.find('.messages');
                this.input = this.content.find('.sender');
                _.bind(setup_listeners, this)();
            };

            this.addMessage = function (msg) {
                if(!this.active && parseInt(this.badge) < 100){
                    this.badge += 1;
                }
                var item = $('<li></li>', {
                    'class': 'list-group-item list-group-item-' + ((this.stripe = !this.stripe) ? 'active' : 'danger')
                });
                $('<p>', {
                    text: msg
                }).appendTo(item);

                this.messages.append(item);
            };

            this.close = function () {
                uber.close.call(this);
                this.content.remove();
                this.room.leave();
            };
        });

        var PublicRoomTabVM = augment(RoomTabVM, function (uber) {
            function setup_listeners() {
                _.bindAll(this, 'addUser', 'setUsers', 'removeUser');

                this.users.on('mouseenter mouseleave', '.user-item', function (e) {
                    $(this).toggleClass('active');
                });

                this.users.on('dblclick', '.user-item', this, function (e) {
                    var tab = e.data;
                    var username = $(this).data('username');
                    tab.room.openPrivate(username);
                });

                this.room.on('userJoin', this.addUser);
                this.room.on('userLeave', this.removeUser);
                this.room.on('usersUpdated', this.setUsers)
            }

            this.constructor = function (room, display) {
                this.content = $(templates.room({
                    display: display,
                    id: 'pub-' + display
                }));
                uber.constructor.call(this, room, display, 'pub-' + display);
                this.users = $(this.content.find('.user-list'));
                _.bind(setup_listeners, this)();
            };

            this.addUser = function addUser(username) {
                var item = $('<li/>', {
                    'class': 'list-group-item user-item',
                    'data-username': username
                });

                $('<p>', {
                    text: username
                }).appendTo(item);

                var users = $(this.users).children("li");

                var insertAt = _.sortedIndex(users, item, function (value) {
                    return $(value).data('username');
                });
                if (insertAt >= users.length) {
                    $(users[users.length - 1]).after(item);
                } else {
                    $(this.users[insertAt]).before(item);
                }
            };

            this.setUsers = function setUser(users) {
                this.users.empty();
                users.sort();

                _.each(users, function (username) {
                    var item = $('<li/>', {
                        'class': 'list-group-item user-item',
                        'data-username': username
                    });

                    $('<p>', {
                        text: username
                    }).appendTo(item);

                    this.users.append(item);
                }, this);
            };

            this.removeUser = function removeUsers(username) {
                var users = $(this.users).children("li").remove('[data-username=' + username + ']');
            };
        });

        var PrivateRoomTabVM = augment(RoomTabVM, function (uber) {
            this.constructor = function (room, display) {
                this.content = $(templates['private']({
                    display: display,
                    id: 'priv-' + display
                }));
                uber.constructor.call(this, room, display, 'priv-' + display);
            };
        });
    
        return {
            ChatTabManager: ChatTabManager,
            RoomTabVM: RoomTabVM,
            PublicRoomTabVM: PublicRoomTabVM, 
            PrivateRoomTabVM: PrivateRoomTabVM
        }

});

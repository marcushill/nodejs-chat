define(['jquery', 'underscore', 'augment', 'EventEmitter', 'app/templates', 'bootstrap'],
    function ($, _, augment, ee, templates) {
        var defclass = augment.defclass;

        var TabManager = augment(_.extend({}, ee.prototype), function (uber) {
            this.constructor = function (tablist, tabcontent) {
                uber.constructor.call(this);
                //params are elements
                this.content = $(tabcontent);
                this.list = $(tablist);
                this.tabs = {};
                this.tabOrder = [];
                this.list.on('click', '.close-tab', this, function (e) {
                    var id = $(this).data('id');
                    var manager = e.data;
                    manager.tabs[id].close();
                    var index = _.indexOf(manager.tabOrder, id);
                    if (index === 0) {
                        manager.tabOrder.shift();
                        manager.tabs[manager.tabOrder[0]].show();
                    } else if (manager.tabOrder.length > 1) {
                        manager.tabOrder.splice(index, 1);
                        manager[manager.tabOrder[index - 1]].show();
                    } else {
                        manager.tabOrder.pop();
                    }
                    delete manager.tabs[id];
                });
                this.list.on('show.bs.tab', 'a[data-toggle="tab"]', this, function (e) {
                    var id = $(this).data('id');
                    var manager = e.data;
                    manager.tabs[id].activate();
                });
                
                this.list.on('hide.bs.tab', 'a[data-toggle="tab"]', this, function (e) {
                    var id = $(this).data('id');
                    var manager = e.data;
                    manager.tabs[id].deactivate();
                });
            };

            this.addTab = function (tabvm) {
                this.tabs[tabvm.id] = tabvm;
                this.tabOrder.push(tabvm.id);
                this.content.append(tabvm.content);
                this.list.append(tabvm.tab);
                tabvm.show();
                return tabvm;
            };

            this.closeAll = function () {
                _.each(this.tabs, function (tab) {
                    tab.close();
                });
                this.tabs = {};
            };

        });

        var TabVM = defclass({
            constructor: function (display, id, badge) {
                this.display = display;
                this.id = id;
                this._badge = badge;
                this.active = false;
                this.tab = $('<li></li>', {
                    role: 'presentation',
                    'data-id': id
                }).html(templates.tab({
                    display: display,
                    id: id,
                    badge: badge
                }));
                this.$badge = $(this.tab.find('.badge'));
            },
            get badge() {
                return this._badge;
            },
            set badge(value) {
                this._badge = value;
                this.$badge.text(value);
            },
            activate: function () {
                this.active = true;
                //Some activation code here
            },
            close: function () {
                //subclasses are responsible for removing their own content
                this.tab.remove();
            },
            show: function () {
                $(this.tab.find('a')).tab('show');
                this.activate();
            },
            deactivate: function () {
                this.active = false;
                //some hide code here
            }
        });

        return {
            TabManager: TabManager,
            TabVM: TabVM
        };
    });
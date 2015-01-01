define(['underscore', 'augment'], function (_, augment) {
    var defclass = augment.defclass;

    var SizedCache = defclass({
        constructor: function SizedCache(size) {
            this.max = size;
            this.storage = [];
        },
        push: function (item) {
            //adds item to the Cache returning the removed item if there is one else undefined
            this.storage.push(item);
            return this.storage.length > this.max ? this.storage.shift() : undefined;
        },

        pop: function () {
            //removes the first item from the cache
            return this.storage.shift();
        },

        size: function () {
            return this.storage.length;
        },

        maxSize: function () {
            return this.max;
        },

        getAll: function () {
            return this.storage;
        }
    });

    function extend(base, additions) {
        return _.extend({}, base, additions);
    }

    function hashCode(string) {
        //gotten from here http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/

        return _.reduce(string, function (hash, char, index) {
            char = this.charCodeAt(index);
            hash = ((hash << 5) - hash) + char;
            return hash & hash;
        }, 0, string);
    }

    return {
        SizedCache: SizedCache,
        extend: extend,
        hashCode: hashCode
    };
});
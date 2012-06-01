var Class = require("nodeclass").Class;

// Copyright Joyent, Inc. and other Node contributors.
// Translated to class module by Johannes Ewald.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var isArray = Array.isArray?
    Array.isArray:
    function isArray(obj) {return Object.prototype.toString.call(obj) === '[object Array]';};

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;

var EventEmitter = new Class({
    "__events": {},
    "setMaxListeners": function setMaxListeners(n) {
        if (!this.__events) {
            this.__events = {};
        }
        this.__events.maxListeners = n;
    },
    "emit": function emit(type) {
        // If there is no 'error' event listener then throw.
        if (type === 'error') {
            if (!this.__events || !this.__events.error ||
                (isArray(this.__events.error) && !this.__events.error.length)) {
                if (arguments[1] instanceof Error) {
                    throw arguments[1]; // Unhandled 'error' event
                } else {
                    throw new Error("Uncaught, unspecified 'error' event.");
                }
                return false;
            }
        }

        if (!this.__events) {
            return false;
        }
        var handler = this.__events[type];
        if (!handler) {
            return false;
        }

        if (typeof handler === 'function') {
            switch (arguments.length) {
                // fast cases
                case 1:
                    handler.call(this);
                    break;
                case 2:
                    handler.call(this, arguments[1]);
                    break;
                case 3:
                    handler.call(this, arguments[1], arguments[2]);
                    break;
                // slower
                default:
                    var args = Array.prototype.slice.call(arguments, 1);
                    handler.apply(this, args);
            }
            return true;
        } else if (isArray(handler)) {
            var args = Array.prototype.slice.call(arguments, 1);
            var listeners = handler.slice();
            for (var i = 0, l = listeners.length; i < l; i++) {
                listeners[i].apply(this, args);
            }
            return true;
        } else {
            return false;
        }
    },
    "addListener": function addListener(type, listener) {
        if ('function' !== typeof listener) {
            throw new Error('addListener only takes instances of Function');
        }
        if (!this.__events) {
            this.__events = {};
        }

        // To avoid recursion in the case that type == "newListeners"! Before
        // adding it to the listeners, first emit "newListeners".
        this.emit('newListener', type, listener);

        if (!this.__events[type]) {
            // Optimize the case of one listener. Don't need the extra array object.
            this.__events[type] = listener;
        } else if (isArray(this.__events[type])) {

            // If we've already got an array, just append.
            this.__events[type].push(listener);

            // Check for listener leak
            if (!this.__events[type].warned) {
                var m;
                if (this.__events.maxListeners !== undefined) {
                    m = this.__events.maxListeners;
                } else {
                    m = defaultMaxListeners;
                }

                if (m && m > 0 && this.__events[type].length > m && console.error && console.trace) {
                    this.__events[type].warned = true;
                    console.error('(node) warning: possible EventEmitter memory ' +
                                  'leak detected. %d listeners added. ' +
                                  'Use emitter.setMaxListeners() to increase limit.',
                                  this.__events[type].length);
                    console.trace();
                }
            }
        } else {
            // Adding the second element, need to change to array.
            this.__events[type] = [this.__events[type], listener];
        }

        return this;
    },
    "once": function(type, listener) {
        if ('function' !== typeof listener) {
            throw new Error('.once only takes instances of Function');
        }

        var self = this;
        function g() {
            self.removeListener(type, g);
            listener.apply(this, arguments);
        }

        g.listener = listener;
        self.on(type, g);

        return this;
    },
    "removeListener": function removeListener(type, listener) {
        if ('function' !== typeof listener) {
            throw new Error('removeListener only takes instances of Function');
        }

        // does not use listeners(), so no side effect of creating __events[type]
        if (!this.__events || !this.__events[type]) {
            return this;
        }

        var list = this.__events[type];

        if (isArray(list)) {
            var position = -1;
            for (var i = 0, length = list.length; i < length; i++) {
                if (list[i] === listener ||
                    (list[i].listener && list[i].listener === listener)) {
                    position = i;
                    break;
                }
            }
            if (position < 0) {
                return this;
            }
            list.splice(position, 1);
            if (list.length == 0) {
                delete this.__events[type];
            }
        } else if (list === listener ||
                 (list.listener && list.listener === listener)) {
            delete this.__events[type];
        }

        return this;
    },
    "removeAllListeners": function removeAllListeners(type) {
        if (arguments.length === 0) {
            this.__events = {};
            return this;
        }

        // does not use listeners(), so no side effect of creating __events[type]
        if (type && this.__events && this.__events[type]) {
            this.__events[type] = null;
        }

        return this;
    },
    "listeners": function listeners(type) {
        if (!this.__events) {
            this.__events = {};
        }
        if (!this.__events[type]) {
            this.__events[type] = [];
        }
        if (!isArray(this.__events[type])) {
            this.__events[type] = [this.__events[type]];
        }

        return this.__events[type];
    }
});

EventEmitter.on = EventEmitter.addListener;

module.exports = EventEmitter;

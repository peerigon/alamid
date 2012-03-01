// Initializing modules
var domAdapter = require('./domAdapter.js'),
    templates = require('./templates.js'),
    appState = require('./appState.js'),
    services = require('./services.js'),
    validators = require('./validators.js'),
    settings = require('./settings.js');

// Function.prototype.bind polyfill
if (!Function.prototype.bind) {
    Function.prototype.bind = function(obj) {
        if(typeof this !== 'function') // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');

        var slice = [].slice,
            args = slice.call(arguments, 1),
            self = this,
            nop = function () {},
            bound = function () {
                return self.apply(
                    this instanceof nop? this: (obj||{}),
                    args.concat(slice.call(arguments))
                );
            };

        bound.prototype = this.prototype;

        return bound;
    };
}

domAdapter.onDOMReady(function onDOMReady() {
    var uri = location.href;

    if (uri.charAt(uri.length-1) === '/') {     // remove last slash if present
        uri = uri.substr(0, uri.length-1);
    }
    settings.baseURI = uri;
    settings.basePath = location.pathname;

    appState.init();
});

setTimeout(function() { // clearing callstack
    try {
        require('misc/init' + '.js');   // hack to disable dependency management
    } catch (err) {

    }
}, 0);
"use strict"; // run code in ES5 strict mode

var Class = require("alamid-class"),
    value = require("value"),
    _ = require("underscore");

var slice = Array.prototype.slice;

var Hooks = new Class("Hooks", {
    _knownHooks: {},
    addHook: function (name, hook) {
        var knownHooks = this._knownHooks;

        if (value(name).notTypeOf(String)) {
            throw new TypeError("(alamid) Cannot add hook: Expected a string as hook name, instead saw '" + name + "'");
        }
        if (value(hook).notTypeOf(Function)) {
            throw new TypeError("(alamid) Cannot add hook: Expected a function as hook, instead saw '" + hook + "'");
        }

        if (knownHooks[name] === undefined) {
            knownHooks[name] = [hook];
        } else {
            knownHooks[name].push(hook);
        }

        return this;
    },
    runHook: function (name) {
        var self = this,
            args,
            hooks;

        if (value(name).notTypeOf(String)) {
            throw new TypeError("(alamid) Cannot run hook: Expected a string as hook name, instead saw '" + name + "'");
        }

        args = slice(arguments, 1);

        hooks = this._knownHooks[name];
        if (hooks) {
            _(hooks).each(function runHook(hook) {
                hook.apply(self, args);
            });
        }

        return this;
    }
});

module.exports = Hooks;
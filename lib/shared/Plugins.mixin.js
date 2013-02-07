"use strict"; // run code in ES5 strict mode

var Class = require("alamid-class"),
    value = require("value"),
    _ = require("underscore");

var slice = Array.prototype.slice;

/**
 * Registers hooks and provides a function to call them
 *
 * Use this class as a mixin if you want to make your class easy extendable. You should not use this mixin as an
 * EventEmitter, because hooks can't be unregistered. Hooks are registered typically in the constructor and stay
 * registered the instance's lifetime.
 *
 * @class Plugins
 * @mixin Plugins
 */
var Plugins = new Class("Plugins", {
    /**
     * @type {Array}
     */
    _knownHooks: null,

    /**
     * Registers a hook under the specified name.
     *
     * @param {String} name
     * @param {Function} hook
     * @return {this}
     */
    hook: function (name, hook) {
        var knownHooks = this._knownHooks;

        if (value(name).notTypeOf(String)) {
            throw new TypeError("(alamid) Cannot add hook: Expected a string as hook name, instead saw '" + name + "'");
        }
        if (value(hook).notTypeOf(Function)) {
            throw new TypeError("(alamid) Cannot add hook: Expected a function as hook, instead saw '" + hook + "'");
        }

        if (knownHooks === null) {
            this._knownHooks = knownHooks = {};
        }
        if (knownHooks[name] === undefined) {
            knownHooks[name] = [hook];
        } else {
            knownHooks[name].push(hook);
        }

        return this;
    },

    /**
     * Runs all hooks under the given name in the order they were registered.
     *
     * @param {String} name
     * @return {this}
     */
    runHook: function (name) {
        var self = this,
            args;

        if (value(name).notTypeOf(String)) {
            throw new TypeError("(alamid) Cannot run hook: Expected a string as hook name, instead saw '" + name + "'");
        }

        args = slice.call(arguments, 1);

        if (this._knownHooks && this._knownHooks[name]) {
            _(this._knownHooks[name]).each(function runHook(hook) {
                hook.apply(self, args);
            });
        }

        return this;
    },

    /**
     * Adds all hooks specified by the plugin and binds them to the plugin.
     *
     * @param {Object} plugin
     * @return {this}
     */
    plugin: function (plugin) {
        var self = this;

        if (value(plugin).notTypeOf(Object)) {
            throw new TypeError("(alamid) Cannot add plugin: Expected an object as plugin, instead saw '" + plugin + "'");
        }

        _(plugin).each(function addEachHook(hook, name) {
            hook = hook.bind(plugin);
            self.hook(name, hook);
        });

        return this;
    }
});

module.exports = Plugins;
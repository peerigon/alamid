"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    $ = require("../../lib/client/helpers/jQuery");

var proto = expect.Assertion.prototype,
    be = proto.be,
    eql = proto.eql,
    a = proto.a,
    contain = proto.contain,
    empty = proto.empty;

// don't extend it when it's already extended
if (!expect.jQuery) {
    expect.jQuery = true;

    proto.be =
    proto.equal = function (obj) {
        this.obj = unwrap(this.obj);
        obj = unwrap(obj);
        be.call(this, obj);
    };

    proto.a =
    proto.an = function (obj) {
        if (obj !== $) {
            this.obj = unwrap(this.obj);
        }
        a.call(this, obj);

        return this;
    };

    proto.eql = function (template) {
        var obj = unwrap(this.obj),
            html;

        if (isNode(obj) && typeof template === "string") {
            html = obj.outerHTML;
            this.assert(
                html === template,
                "Expected '" + shorten(html) + "' to match '" + shorten(template) + "'",
                "Expected '" + shorten(html) + "' to not match '" + shorten(template) + "'"
            );
        } else {
            eql.apply(this, arguments);
        }

        return this;
    };

    proto.cssClass = function (classNames) {
        var obj = this.obj;

        this.assert(
            $(obj).hasClass(classNames),
            "Expected " + unwrap(obj) + " to have css class '" + classNames + "'",
            "Expected " + unwrap(obj) + " to not have css class '" + classNames + "'"
        );

        return this;
    };

    proto.contain = function (child) {
        var obj = unwrap(this.obj);

        child = unwrap(child);
        if (isNode(obj) && isNode(child)) {
            this.assert(
                $.contains(obj, child),
                "Expected " + obj + " to contain " + child,
                "Expected " + obj + " to not contain " + child
            );
        } else if (isNode(obj)) {
            this.assert(
                $(this.obj).children(child).length > 0,
                "Expected " + obj + " to contain children matching '" + child + "'",
                "Expected " + obj + " to not contain children matching '" + child + "'"
            );
        } else {
            contain.apply(this, arguments);
        }

        return this;
    };

    proto.empty = function () {
        var obj = unwrap(this.obj);

        if (isNode(obj)) {
            this.assert(
                $(this.obj).length === 0,
                "Expected " + obj + " to be empty",
                "Expected " + obj + " to not be empty"
            );
        } else {
            empty.apply(this, arguments);
        }

        return this;
    };
}

function unwrap(obj) {
    if (obj instanceof $ && obj.length === 1) {
        return obj[0];
    }
    return obj;
}

function isNode(obj) {
    return obj instanceof Node;
}

function shorten(str) {
    return str.replace(/(.{20})./, "$1[...]");
}

module.exports = expect;
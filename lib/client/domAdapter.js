"use strict";

/**
 * @see http://api.jquery.com/jQuery.ajax/
 *
 * @param {string} method (get|post|put|delete)
 * @param {string} url
 * @param {!Object} data
 * @param {function(error, success)} callback
 * @return {jQuery.Deferred}
 */
exports.request = function request(method, url, data, callback) {

    return jQuery.ajax({
        type: method,
        url: url,
        data: data,
        //dataType: "json", @TODO Is it true that request will always get a JSON-Response? If yes comment this out to get a better performance.
        //headers: {},
        //crossDomain: true,
        contentType: "application/json; charset=utf-8", //Default: 'application/x-www-form-urlencoded' @TODO Is this ok or should we use the default?
        success: function (data, textStatus, jqXHR) {
            callback(null, data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            callback(errorThrown, null);
        }
    });
};

/**
 * If parent is not given document will be used as parent element.
 *
 * @param {string} selector
 * @param {?string} parent
 * @return {jQuery}
 */
exports.find = function find(selector, parent) {
    parent = parent || jQuery(document);

    return jQuery(parent).find(selector);
};

/**
 * If dateNodeValue is set all data-nodes with given value will be return according to given parent.
 * @see {exports.find}
 *
 * @param {?string} dateNodeValue ("[data-node='" + dataNodeValue + "']")
 * @param {?jQuery} parent
 */
exports.findNodes = function findNodes(dataNodeValue, parent) {
    if (dataNodeValue) {
        return exports.find("[data-node='" + dataNodeValue + "']", parent);
    } else {
        return exports.find("[data-node]", parent);
    }

};

/**
 * You can pass either an event as string and a function as listener or an event-map as object.
 * @see http://api.jquery.com/on/
 *
 * @param {object} element
 * @param {string|Object} event ("click", "blur", etc.| events-map {"click": function, "blur": function})
 * @param {function} listener
 */
exports.on = function on(element, event, listener) {
    if(typeof event === "string") {
        jQuery(element).on(event, listener);
    } else {
        jQuery(element).on(event); //event is an events-map
    }
};

/**
 * The given function will be executed as soon as the DOM is ready.
 * This means that it is still possible that not all assets are loaded on ready.
 * Use "load"-event if you want to execute a function when all assets are loaded..
 *
 * @see http://api.jquery.com/ready/
 * @param {function} fn
 */
exports.onDOMReady = function onDOMReady(fn) {
    jQuery(fn);
};

/**
 * You can pass either an event as string and a function as listener or an event-map as object.
 * @see http://api.jquery.com/off/
 *
 * @param {object} element
 * @param {string|Object} event ("click", "blur", etc.| events-map {"click": function, "blur": function})
 * @param {function} listener
 */
exports.off = function off(element, event, listener) {
    if(typeof event === "string") {
        jQuery(element).off(event, listener);
    } else {
        jQuery(element).off(event); //event is an events-map
    }
};

/**
 * @param {object} element
 * @param {string} className
 */
exports.addClass = function addClass(element, className) {
    jQuery(element).addClass(className);
};

/**
 * @param {object} element
 * @param {string} className
 */
exports.removeClass = function removeClass(element, className) {
    jQuery(element).removeClass(className);
};

/**
 * @param {object} element
 * @param {string} className
 */
exports.hasClass = function hasClass(element, className) {
    jQuery(element).hasClass(element, className);
};

/**
 * Given element will be removed from DOM, but listeners are going to stay alive.
 * @see http://api.jquery.com/detach/
 *
 * @param {object} element
 */
exports.destroy = function destroy(element) {
    jQuery(element).detach();
};

/**
 * Given element and all it's listeners will be removed as well as all jQuery-Shizzle.
 * @see http://api.jquery.com/remove/
 *
 * @param {object} element
 */
exports.dispose = function dispose(element) {
    jQuery(element).remove();
};

/**
 * @param {object} obj
 * @return {string}
 */
exports.stringifyJSON = function stringifyJSON(obj) {
    return JSON.stringify(obj);
};

/**
 * @param {string} string
 * @return {Object}
 */
exports.parseJSON = function parseJSON(string) {
    return jQuery.parseJSON(string);
};

/**
 * @see http://api.jquery.com/jQuery.param/
 * @param obj
 * @return {string}
 */
exports.stringifyQuery = function stringifyQuery(obj) {
    return jQuery.param(obj);
};

/**
 * @param {string} string
 * @return {Object}
 */
exports.parseQuery = function parseQuery(string) {
    var obj = {},
        pair,
        key, value,
        arr = string.split('&'),
        i, l;

    for (i = 0, l = arr.length; i < l; i++) {
        pair = arr[i];
        if (pair === '') {
            continue;
        }
        pair = pair.split('=');
        if (pair.length === 1) {
            key = decodeURIComponent(pair);
            value = '';
        } else {
            key = decodeURIComponent(pair[0]);
            value = decodeURIComponent(pair[1]);
        }
        obj[key] = value;
    }

    return obj;
};
"use strict";

function url2ClassPath(url) {
    var classPath,
        urlArr,
        className;

    url = url.replace(/^https?:\/\/[^\/]+\//gi, '');     // remove host and protocol
    url = url.replace(/(^\/)|(\/$)/gi, ""); // remove preceding and trailing slashes
    urlArr = url.split('/');
    className = urlArr.pop();
    className = className.charAt(0).toUpperCase() + className.substr(1);   // capitalize
    className += '.class.js';
    urlArr.push(className);
    classPath = urlArr.join('/');

    return classPath;
}

module.exports = url2ClassPath;
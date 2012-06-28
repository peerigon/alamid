"use strict";

var blogPostAll = function blogPostAll(){};

var middleware = {
    "* /blogPost" : blogPostAll
};

module.exports = middleware;



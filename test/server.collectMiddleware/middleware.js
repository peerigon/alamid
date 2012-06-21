"use strict";


function myFirstMiddleware(req, res, next) {
    next();
}

function mySecondMiddleware(req, res, next) {
    next();
}

function auth(req, res, next) {
    next();
}

function adminOnly(req, res, next) {
    next();
}

function makeEverythingSneaky(req, res, next) {
    next();
}


var middleware = {
    "services" : {
        "* *" : auth,
        "* /blogPost" : myFirstMiddleware,
        "* /blogPost/comments" : myFirstMiddleware,
        "create put delete /blogPost": adminOnly,
        "create put /users": [adminOnly, makeEverythingSneaky],
        "get /users/whatever": adminOnly

    },
    "validators" : {}
};

module.exports = middleware;



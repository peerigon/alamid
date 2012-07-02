"use strict";

function resourceNotFound(req, res, next){

    res.writeHead(404, {"Content-Type": "text/html"});
    res.end("Not found. \n");
}

module.exports = resourceNotFound;

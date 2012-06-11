"use strict";

function pageNotFound(req, res, next){

    res.writeHead(404, {"Content-Type": "text/html"});
    res.end("Page not found. \n");
}

module.exports = pageNotFound;

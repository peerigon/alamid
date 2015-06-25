"use strict";

var alamid = require("../../lib/index");
var middleware = alamid.middleware;

var app = alamid.server();
var router = app.hybrid;

var schema = require("./schema");
var service = require("./service");

router.add("/services/panda/:pandaId?", alamid.service("panda", schema.panda, service.panda));

router.add("*", function(req, res) {
    res.send("Not found!");
});

app.listen(9000);
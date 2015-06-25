"use strict";

var alamid = require("../../lib/index");
var middleware = alamid.middleware;

var app = alamid.server();
var router = app.hybrid;

var PandaSchema = new alamid.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number
    }
});

var pandaService = {
    readCollection: function(req, res) {

        console.log(req.ids, req.body);
        res.success();
    },
    read: function(req, res, next) {
        console.log(req.ids, req.body);
        res.success();
    }
};

router.add("/services/panda/:pandaId?", middleware.schema(PandaSchema), middleware.validate(), middleware.parseIds(), middleware.service("panda", pandaService));

router.add("*", function(req, res) {
    res.send("Not found!");
});

router.on("error", function(err) {
   console.error(err);
});

app.listen(9000);
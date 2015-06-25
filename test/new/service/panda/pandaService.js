"use strict";

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

module.exports = pandaService;
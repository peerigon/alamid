"use strict";

var log = require("../../../shared/logger.js").get("server");

function loadModel(req, res, next) {

    log.debug("loading model for path: " + path);

    var ids = req.getIds();

    log.debug("Looking for models: ", ids);

    next();

    /*

    var DummyModel = function(ids, data) {

        this.data = {};
        this.ids = {};

        this.init = function(ids, data) {
            this.data = data;
            this.ids = ids;
        };

        this.getIds = function() {
            return this.ids;
        };

        this.getData = function() {
            return this.data;
        };

        this.init(ids, data);
    };

    return new DummyModel(ids, data);
    */
}
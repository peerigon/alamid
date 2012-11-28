"use strict";

var router = require("../server/router.js"),
    routes = require("../server/routes.js");

//middleware
var runService = require("../server/request/middleware/runService.js"),
    runValidator = require("../server/request/middleware/runValidator.js"),
    loadModel = require("../server/request/middleware/loadModel.js"),
    pushNotification = require("../server/request/middleware/pushNotification.js"),
    sanitizeData = require("../server/request/middleware/sanitizeData.js");

function attachAlamidMiddleware(server) {

    var routeHandler = router.get();

    if(routeHandler === null) {
        routeHandler = router.init();
    }

    //SERVICES
    server.addRoute(["create", "read", "update", "destroy"], routes.services + "/*", [sanitizeData, loadModel, runService, pushNotification]);

    //VALIDATORS
    server.addRoute("create", routes.validators + "/*", [sanitizeData, runValidator]);

    //Global Error handler
    routeHandler.on("error", function(err, req, res) {
        res.end({
            status : "error",
            message : "(alamid) Request failed on path '" + req.getPath() + "' with Error: '" + err.message + "'",
            data : {
                error : "request-error"
            }
        });
    });
}

module.exports = attachAlamidMiddleware;
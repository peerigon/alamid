"use strict";

var router = require("../server/router.js"),
    routes = require("../server/routes.js"),
    config = require("../shared/config"),
    logger = require("../shared/logger"),
    log = logger.get("server");

//middleware
var runService = require("../server/request/middleware/runService.js"),
    runValidator = require("../server/request/middleware/runValidator.js"),
    loadModel = require("../server/request/middleware/loadModel.js"),
    publishModel = require("../server/request/middleware/publishModel.js"),
    sanitizeData = require("../server/request/middleware/sanitizeData.js"),
    isValidRequest = require("../server/request/middleware/isValidRequest.js");

function attachAlamidMiddleware(server) {

    var routeHandler = router.get();

    if(routeHandler === null) {
        routeHandler = router.init();
    }

    //ALL REQUESTS
    server.addRoute(["create", "read", "update", "destroy"], "/*", [isValidRequest]);

    //SERVICES
    server.addRoute(["create", "read", "update", "destroy"], routes.services + "/*", [sanitizeData, loadModel, runService, publishModel]);

    //VALIDATORS
    server.addRoute("create", routes.validators + "/*", [sanitizeData, runValidator]);

    //Alamid-Pipeline Error handler
    routeHandler.on("error", function(err, req, res) {

        var errorMessage = "(alamid) Request-Error '" + req.getMethod().toUpperCase() + "' '"  + req.getRawPath() +  "' ("  + req.getTransportType() +  ") '" + err.message + "'";

        //log in any case
        log.error(errorMessage);

        //don't expose the message in production mode
        if(!config.isDev) {
            errorMessage = "Internal Server Error.";
        }

        res.end({
            status : "error",
            message : errorMessage,
            data : {
                error : "request-error"
            }
        });
    });
}

module.exports = attachAlamidMiddleware;
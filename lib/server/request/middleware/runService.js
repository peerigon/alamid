"use strict";

var config = require("../../../core/config"),
    paths = config.paths,
    logger = require("../../../shared/logger.js"),
    log = logger.get("server"),
    services = require("../../services.js");

/**
 * Convert a request-Path to the actual file-path of the Service
 * @param {!String} requestPath
 * @return {String}
 */
function resolveServicePath(requestPath) {

    var resPath,
        pathSplits,
        servicePath;

    pathSplits = requestPath.split("/");
    servicePath = pathSplits[pathSplits.length - 1];

    //first part
    resPath = requestPath.substr(0, requestPath.length - servicePath.length);
    resPath += servicePath + "/" + servicePath + "Service.server.class.js";

    return resPath;
}

function loadModel(path, ids, data) {

    //TODO implement model loading
    //check if model exists depending on path
    //return model instance

    log.debug("loading model for path: " + path);

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
}

function runService(req, res, next) {
    var service,
        path,
        model;

    function callService(path) {
        //get already loaded service from service registry
        service = services.getService(path);

        if(service[req.getMethod()] === undefined){
            onServiceCallFailed();
        }
        else{

            model = loadModel(path, req.getIds(), req.getData());

            switch(req.getMethod()) {
                case 'create':
                    service.create(model, onServiceCallback);
                    break;
                case 'read':
                    service.read(model, onServiceCallback);
                    break;
                case 'update':
                    service.update(model, onServiceCallback);
                    break;
                case 'delete':
                    service.delete(model, onServiceCallback);
                    break;
                default:
                    onServiceCallFailed();
            }
        }
    }

    function onServiceCallFailed() {
        var allowedMethods;

        allowedMethods = service.read? 'GET, ': '';
        allowedMethods += service.create? 'POST, ': '';
        allowedMethods += service.update? 'PUT, ': '';
        allowedMethods += service.delete? 'DELETE, ': '';
        allowedMethods = allowedMethods.substr(0, allowedMethods.length - 2);  // trim off the last comma
        if (allowedMethods === '') {
            res.setStatusCode(403);
        } else {
            res.setStatusCode(405);
            res.setHeader('Allow', allowedMethods);
        }

        //make next here and mark end
        next(new Error("Service-call failed"));
    }

    function onServiceCallback(statusCode, result) {
        res.setStatusCode(statusCode);
        if (result) {
            res.setData(result);
        }
        next(null);
    }

    //we need to find the right path based on conventions
    //this could also be a standalone middleware
    path = resolveServicePath(req.getPath());

    log.debug('looking for service ' + path);

    if (services.getService(path) !== null) {
        log.debug('found... running service');
        callService(path);
        return;
    }

    log.debug('no service found');
    res.setStatusCode(404);
    next(new Error("No service found for: " + path));
}

module.exports = runService;
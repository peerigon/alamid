"use strict"; // run code in ES5 strict mode

var config = require("./config"),
    async = require("async"),
    logger = require("../shared/logger.js"),
    log = logger.get("core"),
    collectServices = require("./collectServices.js"),
    browserifyModules = require("./browserifyModules.js"),
    services = require("../server/services.js"),
    startServer = require("../server/startServer.js");

function populateServices(callback) {
    collectServices(config.paths.services, function onCollectServicesCallback(err, collectedServices) {
        services.services = collectedServices;
        callback(err, collectedServices);
    });
}

module.exports = function bootstrap() {

    log.info("Bootstrap: START");

    //TODO sanitize if everything is there: important dirs/files etc.

    //check services
    log.info("Loading Services...");

    populateServices(function(err, services) {
        log.info("Services ready.");
    });

    //compile all pages
    /*
     function compilePages(callback) {
     var finder = new Finder();

     function doCompile(path, files) {
     async.forEach(files, function(item, callback) {
     var path = item.substring(
     paths.appHTML.length,
     item.length - '.html'.length
     );

     compilePage(path, callback);
     }, callback);
     }

     finder.on('end', doCompile);
     finder.walk(paths.appHTML + '/pages');
     }
     */

    //write init.html
    //write init.js (alamidClientBundle, bootstrap.client)


    //start server
    startServer(config.port);

};

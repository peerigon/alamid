"use strict"; // run code in ES5 strict mode

var async = require("async"),
    _ = require("underscore"),
    toSrc = require('toSrc'),
    fs = require("fs"),
    path = require("path");


var config = require("./config"),
    clientConfig = require("../client/config.client.js"),
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

function renderBootstrapClientTemplate() {

    var template,
        compileTemplate,
        bootstrapContent,
        renderData;

    renderData = {
        "clientConfig" : toSrc(generateClientConfig())
    };

    //read template file
    template = fs.readFileSync(path.resolve(__dirname, "../../templates/bootstrap.client.ejs"), "utf-8");
    compileTemplate = _.template(template);

    //do compile
    bootstrapContent = compileTemplate(renderData);

    //write back to file
    fs.writeFileSync(config.paths.bundle + "/bootstrap.js", bootstrapContent, "utf-8");
}

function generateClientConfig () {

    _.each(clientConfig, function(value, key){
        if(config[key] !== undefined) {
            //assign value of server-config
            clientConfig[key] = config[key];
        }
    });

    return clientConfig;
}

function bootstrap() {

    log.info("Bootstrap: START");

    //TODO sanitize if everything is there: important dirs/files etc.

    //check services
    log.info("Loading Services...");

    populateServices(function(err, services) {
        if(err) {
            log.error("Error loading Services: ", err);
        }
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
}

//module.exports = bootstrap;

exports.generateClientConfig = generateClientConfig;
exports.renderBootstrapClientTemplate = renderBootstrapClientTemplate;
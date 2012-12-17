"use strict";

var path = require("path"),
    fs = require("fs"),
    wrench = require('wrench'),
    ejs = require("ejs"),
    program = require('commander');

var appDir = path.join(process.cwd(), "./app");

program
    .version('0.0.1')
    .option('-i, --init', 'Create structure')
    //.option('-s, --service', 'Add service')
    //.option('-v, --view', 'Add view')
    //.option('-p, --page', 'Add page')
    .option('-m, --model', 'Add model')
    .parse(process.argv);

function appDirExists(expected) {

    if(fs.existsSync(appDir) !== expected) {
        console.log("App-Dir already exists");
        process.exit(1);
    }
}

function createStructure() {

    //we don't want it to exist
    appDirExists(false);

    wrench.copyDirSyncRecursive(path.join(__dirname, "structure/app"), appDir);
    fs.createReadStream(path.join(__dirname, "structure/init.server.js")).pipe(fs.createWriteStream(appDir + "/init.server.js"));
    fs.createReadStream(path.join(__dirname, "structure/init.client.js")).pipe(fs.createWriteStream(appDir + "/init.client.js"));
}

function addModel(modelName) {

    var modelTpl = fs.readFileSync(path.join(__dirname, "templates/model.tpl"), "utf-8");
    var schemaTpl = fs.readFileSync(path.join(__dirname, "templates/schema.tpl"), "utf-8");

    var renderedModel = ejs.render(modelTpl, {
        name: modelName
    });

    var renderedSchema = ejs.render(schemaTpl, {
        name: modelName
    });

    fs.mkdirSync("./app/models/" + modelName.toLowerCase());

    fs.writeFileSync("./app/models/" + modelName.toLowerCase() + "/" + modelName + "Model.class.js", renderedModel, "utf-8");
    fs.writeFileSync("./app/models/" + modelName.toLowerCase() + "/" + modelName + "Schema.js", renderedSchema, "utf-8");

    program.confirm('Add Server-Service? ', function(ok){

        if(ok) {
            addService(modelName);
        }

        program.confirm('Add Client-Service? ', function(ok){

            if(ok) {
                addService(modelName, "client");
            }

            process.exit(0);
        });
    });
}

function addService(serviceName, type) {

    type = type || "server";

    var servicePath = "./app/services/" + serviceName.toLowerCase();

    var serviceTpl = fs.readFileSync(path.join(__dirname, "templates/" + type + "-service.tpl"), "utf-8");

    var renderedService = ejs.render(serviceTpl, {
        name: serviceName
    });

    if(!fs.existsSync(servicePath)) {
        fs.mkdirSync(servicePath);
    }

    fs.writeFileSync(servicePath + "/" + serviceName + "Service."+ type +".class.js", renderedService, "utf-8");
}

if(program.init) {
    createStructure();
    process.exit(0);
}
else if(program.model) {
    program.prompt('Model-Name: ', function(name){
        addModel(name);
    });
}
else {
    program.help();
}



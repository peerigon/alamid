"use strict";

var nodeclass = require("nodeclass");
    nodeclass.registerExtension();

var startServer = require("../../../../../lib/server/startServer");
startServer(9090);
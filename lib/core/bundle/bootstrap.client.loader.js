"use strict";

var renderBootstrapClient = require("./renderer/renderBootstrapClient.js"),
    readConfig = require("../config/readConfig.js");

module.exports = function() {
    this.cacheable();

    var clientConfig = readConfig("client");
    return renderBootstrapClient(this.options.clientConfig);
};
"use strict"; // run code in ES5 strict mode

var alamid = require("alamid"),
    client = alamid.client,
    jQuery = alamid.util.jQuery;

client
    .addRoute("blog", "blog")
    .addRoute("*", "home");

jQuery(document).ready(function onDOMReady() {
    window.alamidClientConfig = alamid.config;
    //we don't have socket.io included in this test
    window.alamidClientConfig.use.websockets = false;
    client.start();
});

window.client = client;
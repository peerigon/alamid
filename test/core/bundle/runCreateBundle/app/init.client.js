"use strict"; // run code in ES5 strict mode

var alamid = require("alamid"),
    client = alamid.client,
    jQuery = require("alamid/lib/client/helpers/jQuery.js");

client
    .addRoute("blog", "blog")
    .addRoute("*", "home");

jQuery(document).ready(function onDOMReady() {
    window.alamidClientConfig = alamid.config;
    //we don't have socket.io included in this test
    alamid.config.use.websockets = false;
    client.start();
});

window.client = client;
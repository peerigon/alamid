"use strict"; // run code in ES5 strict mode

var alamid = require("alamid"),
    client = alamid.client,
    jQuery = alamid.util.jQuery;

client
    .addRoute("blog", "blog")
    .addRoute("*", "home");

jQuery(document).ready(function onDOMReady() {
    client.start();
    window.alamidClientConfig = alamid.config;
});

window.client = client;
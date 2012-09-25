"use strict"; // run code in ES5 strict mode

var alamid = require("alamid"),
    app = alamid.app,
    jQuery = alamid.util.jQuery;

app
    .addRoute("blog", "blog")
    .addRoute("*", "home");

jQuery(document).ready(function onDOMReady() {
    app.start();
});

window.app = app;
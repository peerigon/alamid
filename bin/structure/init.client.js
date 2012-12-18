"use strict";

var alamid = require("alamid"),
    app = alamid.app,
    jQuery = alamid.util.jQuery;

jQuery(document).ready(function onDomReady() {
    app.start();
});
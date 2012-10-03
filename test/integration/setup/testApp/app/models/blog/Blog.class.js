"use strict";

var Model = require('../../../../../../../lib/shared/Model.class.js');

var Blog = Model.define("Blog",{
    $url : "blog",
    init : function() {

    }
});

module.exports = Blog;
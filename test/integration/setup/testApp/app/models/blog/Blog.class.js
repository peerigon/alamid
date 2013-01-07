"use strict";

var Model = require('../../../../../../../lib/shared/Model.class.js');

var Blog = Model.extend("Blog",{
    url : "blog"
});

module.exports = Blog;
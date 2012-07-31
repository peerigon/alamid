"use strict";

//expose the alamid-API

//shared
exports.Model = require("./shared/Model.class.js");
exports.ModelCollection = require("./shared/ModelCollection.class.js");

//client
exports.App = require("./client/App.class.js");
exports.Page = require("./client/Page.class.js");
exports.PageLoader = require("./client/PageLoader.class.js");
exports.View = require("./client/View.class.js");
exports.ViewCollection = require("./client/ViewCollection.class.js");


//expose nodeclass
exports.Class = require("nodeclass").Class;

"use strict";

var middleware = require("./middleware");

module.exports = function(url, schema, service) {
    return [middleware.schema(schema), middleware.validate(), middleware.parseIds(), middleware.service(url, service)]
};
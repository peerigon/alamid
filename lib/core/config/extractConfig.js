"use strict";

var _ = require("underscore");

/**
 * extract the specific part "server"|"client" from the config
 * @param config
 * @param part
 * @return {*}
 */
function extractConfig(config, part) {

    var configRes = _(config).clone();

    //extend shared config with the part-config
    if(config[part] !== undefined) {

        _(config[part]).each(function copyConfigValue(value, key){
            configRes[key] = value;
        });
    }

    //delete part-specific config parts
    if(configRes.server !== undefined) {
        delete configRes.server;
    }

    if(configRes.client !== undefined) {
        delete configRes.client;
    }

    return configRes;
}

module.exports = extractConfig;

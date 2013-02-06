"use strict";

var _ = require("underscore");

/**
 * extract the specific part "server"|"client" from the config
 * @param config
 * @param part
 * @return {*}
 */
function extractConfig(config, part) {

    var globalConfig = _(config).clone(),
        partConfig = globalConfig[part];

    delete globalConfig.server;
    delete globalConfig.client;

    var configRes = _.clone(globalConfig);

    //basic extend on first level
    configRes = _(configRes).extend(partConfig);

    //deep copy on second level
    //need for "use"
    _(globalConfig).each(function extendSecondLevel(value, key) {
        configRes[key] = _(configRes[key]).extend(value);
    });

    return configRes;
}

module.exports = extractConfig;

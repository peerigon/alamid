var renderBootstrapClient = require("./renderer/renderBootstrapClient.js");

module.exports = function() {
    this.cacheable();
    return renderBootstrapClient(this.options.alamidConfig);
};
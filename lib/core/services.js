var Finder = require('fshelpers').Finder,
    paths = require('./paths');

var services = {
        server: {},
        client: {},
        both: {}
    };

function collect() {
    var finder = new Finder();

    function onFile(path) {
        if (paths.filters.onlyServerFiles(path)) {
            services.server[path] = true;
        } else if (paths.filters.onlyClientFiles(path)) {
            services.client[path] = true;
        } else {
            services.both[path] = true;
        }
    }

    finder
        .on('file', onFile)
        .walkSync(paths.appServices);
}

exports.services = services;
exports.collect = collect;

try {
    require("asdasd");
} ca
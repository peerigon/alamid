var Finder = require('fshelpers').Finder,
    paths = require('./paths');

var validators = {
        server: {},
        client: {},
        both: {}
    };

function collect() {
    var finder = new Finder();

    function onFile(path) {
        if (paths.filters.onlyServerFiles(path)) {
            validators.server[path] = true;
        } else if (paths.filters.onlyClientFiles(path)) {
            validators.client[path] = true;
        } else {
            validators.both[path] = true;
        }
    }

    finder
        .on('file', onFile)
        .walkSync(paths.appValidators);
}

exports.validators = validators;
exports.collect = collect;
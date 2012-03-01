var reporter = require('nodeunit').reporters.default;

reporter.run(
    [
        'Finder/Finder.js',
        'wrap/wrap.js',
        'collectErr/collectErr.js',
        'remove/remove.js',
        'makeDir/makeDir.js',
        'paths2obj/paths2obj.js',
        'write/write.js'
    ]
);
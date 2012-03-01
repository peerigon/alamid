var reporter = require('nodeunit').reporters.default;

reporter.run(
    [
        'normalizePath/normalizePath.js',
        'getLookUpPaths/getLookUpPaths.js',
        'Resolve/Resolve.js',
        'nodeResolve/nodeResolve.js',
        'setup/setup.js',
        'getDependencies/getDependencies.js',
        'translate/translate.js'
    ]
);
var testCase = require('nodeunit').testCase,
    nodeResolve = require('../../lib/nodeResolve');

///////////////////////////////////////////////////////////////////////////////////////

function config(test, expected) {
    var times = 0;

    test.expect(expected);

    return function done() {
        times++;
        if(times === expected) {
            test.done();
        }
    }
}

///////////////////////////////////////////////////////////////////////////////////////

var currentModuleDir = __dirname + '/node_modules/folder1';

module.exports = testCase({
    relativePath: function(test) {
        var done = config(test, 1);

        nodeResolve(currentModuleDir, './module1.js', function(err, result) {
            test.equal(result, __dirname + '/node_modules/folder1/module1.js');
            done();
        });
    },
    nodeModulesPath: function(test) {
        var done = config(test, 1);

        nodeResolve(currentModuleDir, 'folder1/module2.js', function(err, result) {
            test.equal(result, __dirname + '/node_modules/folder1/module2.js');
            done();
        });
    },
    packageJSON: function(test) {
        var done = config(test, 1);

        nodeResolve(currentModuleDir, 'someModule', function(err, result) {
            test.equal(result, __dirname + '/node_modules/someModule/package.json');
            done();
        });
    },
    indexJS: function(test) {
        var done = config(test, 1);

        nodeResolve(currentModuleDir, 'otherModule', function(err, result) {
            test.equal(result, __dirname + '/node_modules/otherModule/index.js');
            done();
        });
    }
});

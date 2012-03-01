var testCase = require('nodeunit').testCase,
    fs = require('fs'),
    getDependencies = require('../../lib/getDependencies');

///////////////////////////////////////////////////////////////////////////////////////

function load(path) {
    return fs.readFileSync(path, 'utf8');
}

///////////////////////////////////////////////////////////////////////////////////////

module.exports = testCase({
    noDependencies: function(test) {
        var path = __dirname + '/node_modules/noDependencies.js';

        test.expect(3);
        getDependencies(path, load(path), function(err, result) {
            test.strictEqual(err, null);
            test.equal(result instanceof Array, true);
            test.equal(result.length, 0);
            test.done();
        });
    },
    someDependencies: function(test) {
        var expected = [
                __dirname + '/node_modules/noDependencies.js',
                __dirname + '/node_modules/package.json',
                __dirname + '/getDependencies.js'
            ],
            path = __dirname + '/node_modules/someDependencies.js';

        test.expect(2);
        getDependencies(path, load(path), function(err, result) {
            test.strictEqual(err, null);
            test.deepEqual(expected.sort(), result.sort());
            test.done();
        });
    },
    packageDependencies: function(test) {
        var expected = [
                __dirname + '/node_modules/noDependencies.js'
            ],
            path = __dirname + '/node_modules/package.json';

        test.expect(3);
        getDependencies(path, load(path), function(err, result) {
            test.strictEqual(err, null);
            test.equal(result instanceof Array, true);
            test.deepEqual(expected, result);
            test.done();
        });
    },
    wrongRequire: function(test) {
        var path = __dirname + '/node_modules/errors/wrongRequire.js';

        test.expect(2);
        getDependencies(path, load(path), function(err, result) {
            test.equal(typeof err, 'object');
            test.equal(err.message, 'Cannot find module ./asdasdasdasds');
            test.done();
        });
    },
    wrongPackage: function(test) {
        var path = __dirname + '/node_modules/errors/package.json';

        test.expect(2);
        getDependencies(path, load(path), function(err, result) {
            test.equal(typeof err, 'object');
            test.equal(err.message, 'Unexpected end of input');
            test.done();
        });
    }
});
var testCase = require('nodeunit').testCase,
    Resolve = require('../../lib/Resolve'),
    modules,
    resolve;

///////////////////////////////////////////////////////////////////////////////////////

exports.relativePath = testCase({
    setUp: function(finished) {
        modules = {
            '/aaa/bbb/ccc.js': true,
            '/aaa/bbb/ccc/ddd.js': true,
            '/aaa/bbb/ccc/ddd/eee/index.js': true,
            '/aaa/bbb/ccc/eee.js': true,
            '/aaa/eee.js': true,
            '/aaa/bbb/eee.js': true,
            '/eee/index.js': true
        };

        resolve = new Resolve(modules, '/aaa/bbb/ccc');
        finished();
    },
    resolve: function(test) {
        test.equal(resolve('./ddd'), '/aaa/bbb/ccc/ddd.js');
        test.equal(resolve('./ddd/eee'), '/aaa/bbb/ccc/ddd/eee/index.js');
        test.equal(resolve('./ddd/./eee'), '/aaa/bbb/ccc/ddd/eee/index.js');
        test.equal(resolve('./ddd/../eee'), '/aaa/bbb/ccc/eee.js');
        test.equal(resolve('./../../eee.js'), '/aaa/eee.js');
        test.equal(resolve('././../eee'), '/aaa/bbb/eee.js');
        test.equal(resolve('../../../eee'), '/eee/index.js');
        test.done();
    },
    resolveFail: function(test) {
        test.throws(function() {
            resolve('/fff');
        });
        test.throws(function() {
            resolve('../../../../');
        });
        test.done();
    }
});


exports.outsideNodeModules = testCase({
    setUp: function(finished) {
        modules = {
            '/aaa/node_modules/testA.js': true,
            '/aaa/bbb/node_modules/testB.js': true,
            '/aaa/bbb/testB.js': true
        };
        finished();
    },
    resolve: function(test) {
        resolve = new Resolve(modules, '/aaa');
        test.equal(resolve('testA'), '/aaa/node_modules/testA.js');
        test.done();
    },
    resolveNested: function(test) {
        resolve = new Resolve(modules, '/aaa/bbb');
        test.equal(resolve('testB'), '/aaa/bbb/node_modules/testB.js');
        test.equal(resolve('./testB'), '/aaa/bbb/testB.js');
        test.equal(resolve('testA'), '/aaa/node_modules/testA.js');
        test.done();
    }
});



exports.withinNodeModules = testCase({
    setUp: function(finished) {
        modules = {
            '/aaa/node_modules/testA.js': true,
            '/aaa/node_modules/ccc/node_modules/testB.js': true,
            '/aaa/node_modules/ccc/testB.js': true
        }
        finished();
    },
    resolve: function(test) {
        resolve = new Resolve(modules, '/aaa/node_modules');
        test.equal(resolve('testA'), '/aaa/node_modules/testA.js');
        test.done();
    },
    resolveNested: function(test) {
        resolve = new Resolve(modules, '/aaa/node_modules/ccc/node_modules/ddd');
        test.equal(resolve('testB'), '/aaa/node_modules/ccc/node_modules/testB.js');
        test.equal(resolve('testA'), '/aaa/node_modules/testA.js');
        test.done();
    }
})
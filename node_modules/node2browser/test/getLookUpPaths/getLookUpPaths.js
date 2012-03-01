var testCase = require('nodeunit').testCase,
    getLookUpPaths = require('../../lib/getLookUpPaths');

///////////////////////////////////////////////////////////////////////////////////////


module.exports = testCase({
    withinNodeModules: function(test) {
        var currentModuleDir = '/aaa/node_modules/bbb/node_modules/ccc';

        test.deepEqual(
            getLookUpPaths(currentModuleDir, './ddd'),
            ['/aaa/node_modules/bbb/node_modules/ccc/ddd']
        );
        test.deepEqual(
            getLookUpPaths(currentModuleDir, '../ddd'),
            ['/aaa/node_modules/bbb/node_modules/ddd']
        );
        test.deepEqual(
            getLookUpPaths(currentModuleDir, '../.././ddd'),
            ['/aaa/node_modules/bbb/ddd']
        );
        test.deepEqual(
            getLookUpPaths(currentModuleDir, '/ddd'),
            ['/ddd']
        );
        test.deepEqual(
            getLookUpPaths(currentModuleDir, 'eee'),
            ['/aaa/node_modules/bbb/node_modules/eee', '/aaa/node_modules/eee']
        );
        test.deepEqual(
            getLookUpPaths(currentModuleDir, 'eee/fff'),
            ['/aaa/node_modules/bbb/node_modules/eee/fff', '/aaa/node_modules/eee/fff']
        );
        test.deepEqual(
            getLookUpPaths(currentModuleDir, 'eee/fff/../../ggg'),
            ['/aaa/node_modules/bbb/node_modules/ggg', '/aaa/node_modules/ggg']
        );
        test.done();
    },
    outsideNodeModules: function(test) {
        var currentModuleDir = '/aaa/bbb';

        test.deepEqual(
            getLookUpPaths(currentModuleDir, 'ccc'),
            ['/aaa/bbb/node_modules/ccc', '/aaa/node_modules/ccc', '/node_modules/ccc']
        );
        currentModuleDir = '/aaa/bbb/ccc';
        test.deepEqual(
            getLookUpPaths(currentModuleDir, 'ddd'),
            ['/aaa/bbb/ccc/node_modules/ddd', '/aaa/bbb/node_modules/ddd', '/aaa/node_modules/ddd', '/node_modules/ddd']
        );
        currentModuleDir = '/aaa/bbb';
        test.deepEqual(
            getLookUpPaths(currentModuleDir, 'ccc/../../ddd'),
            ['/aaa/bbb/ddd', '/aaa/ddd', '/ddd']
        );
        test.done();
    }
});
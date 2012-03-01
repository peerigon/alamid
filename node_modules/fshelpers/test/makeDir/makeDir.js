var testCase = require('nodeunit').testCase,
    pathUtil = require('path'),
    fs = require('fs'),
    makeDir = require('../../lib').makeDir,
    makeDirSync = require('../../lib').makeDirSync,
    makeDirs = require('../../lib').makeDirs,
    makeDirsSync = require('../../lib').makeDirsSync;

///////////////////////////////////////////////////////////////////////////////////////

function ignoreErr(fn, arg) {
    var args = Array.prototype.slice.call(arguments, 1);

    try {
        fn.apply(fs, args);
    } catch(err) {
        
    }
}

function setup(type) {
    ignoreErr(fs.mkdirSync, __dirname + '/' + type, 0755);
    ignoreErr(fs.rmdirSync, __dirname + '/' + type + '/folder/folder2/folder1');
    ignoreErr(fs.rmdirSync, __dirname + '/' + type + '/folder/folder2/folder2');
    ignoreErr(fs.rmdirSync, __dirname + '/' + type + '/folder/folder2/folder3');
    ignoreErr(fs.rmdirSync, __dirname + '/' + type + '/folder/folder1/folder1');
    ignoreErr(fs.rmdirSync, __dirname + '/' + type + '/folder/folder1/folder2');
    ignoreErr(fs.rmdirSync, __dirname + '/' + type + '/folder/folder1/folder3');
    ignoreErr(fs.rmdirSync, __dirname + '/' + type + '/folder/folder1');
    ignoreErr(fs.rmdirSync, __dirname + '/' + type + '/folder/folder2');
    ignoreErr(fs.rmdirSync, __dirname + '/' + type + '/folder');
}

///////////////////////////////////////////////////////////////////////////////////////

exports.makeDir = testCase({
    makeDir: function(test) {
        var times = 0;

        function finished(error) {
            times++;
            test.strictEqual(error, null);
            if(times === 2) {
                test.ok(pathUtil.existsSync(__dirname + '/async/folder'));
                test.ok(pathUtil.existsSync(__dirname + '/async/folder/folder1'));
                test.ok(pathUtil.existsSync(__dirname + '/async/folder/folder2'));
                test.ok(pathUtil.existsSync(__dirname + '/async/folder/folder2/folder3'));
                test.done();
            }
        }

        setup('async');
        test.expect(6);
        makeDir(__dirname + '/async/folder/folder2/folder3', finished);
        makeDir(__dirname + '/async/folder/folder1', 0755, finished);
    }
});

exports.makeDirSync = testCase({
    makeDir: function(test) {
        setup('sync');
        makeDirSync(__dirname + '/sync/folder/folder2/folder3');
        makeDirSync(__dirname + '/sync/folder/folder1', 0755);
        test.ok(pathUtil.existsSync(__dirname + '/sync/folder'));
        test.ok(pathUtil.existsSync(__dirname + '/sync/folder/folder1'));
        test.ok(pathUtil.existsSync(__dirname + '/sync/folder/folder2'));
        test.ok(pathUtil.existsSync(__dirname + '/sync/folder/folder2/folder3'));
        test.done();
    }
});

exports.makeDirs = testCase({
    makeDirs: function(test) {
        function finished(errors) {
            test.strictEqual(errors, null);
            test.ok(pathUtil.existsSync(__dirname + '/async/folder/folder1/folder1'));
            test.ok(pathUtil.existsSync(__dirname + '/async/folder/folder1/folder2'));
            test.ok(pathUtil.existsSync(__dirname + '/async/folder/folder1/folder3'));
            test.ok(pathUtil.existsSync(__dirname + '/async/folder/folder2/folder1'));
            test.ok(pathUtil.existsSync(__dirname + '/async/folder/folder2/folder2'));
            test.ok(pathUtil.existsSync(__dirname + '/async/folder/folder2/folder3'));
            test.done();
        }

        test.expect(7);
        setup('async');
        makeDirs(
            [
                'async/folder/folder2/folder1/',
                'async/folder/folder2/folder2',
                '/async/folder/folder2/folder3',
                'async/folder/folder1/folder1',
                '/async/folder/folder1/folder2',
                'async/folder/folder1/folder3',
                'async/folder/folder1/',
                'async/folder/folder2',
                '/async/folder'
            ],
            __dirname,
            finished
        );
    }
});

exports.makeDirsLessParams = testCase({
    makeDirsLessParams: function(test) {
        function finished(errors) {
            test.strictEqual(errors, null);
            test.ok(pathUtil.existsSync(__dirname + '/async/folder/folder1/folder1'));
            test.ok(pathUtil.existsSync(__dirname + '/async/folder/folder1/folder2'));
            test.ok(pathUtil.existsSync(__dirname + '/async/folder/folder1/folder3'));
            test.ok(pathUtil.existsSync(__dirname + '/async/folder/folder2/folder1'));
            test.ok(pathUtil.existsSync(__dirname + '/async/folder/folder2/folder2'));
            test.ok(pathUtil.existsSync(__dirname + '/async/folder/folder2/folder3'));
            test.done();
        }

        test.expect(7);
        setup('async');
        makeDirs(
            [
                __dirname + '/async/folder/folder2/folder1/',
                __dirname + '/async/folder/folder2/folder2',
                __dirname + '/async/folder/folder2/folder3',
                __dirname + '/async/folder/folder1/folder1',
                __dirname + '/async/folder/folder1/folder2',
                __dirname + '/async/folder/folder1/folder3',
                __dirname + '/async/folder/folder1/',
                __dirname + '/async/folder/folder2',
                __dirname + '/async/folder'
            ],
            finished
        );
    }
});

exports.makeDirsSync = testCase({
    makeDirsSync: function(test) {
        var errors;

        setup('sync');
        errors = makeDirsSync(
            [
                'sync/folder/folder2/folder1/',
                'sync/folder/folder2/folder2',
                'sync/folder/folder2/folder3',
                '/sync/folder/folder1/folder1',
                '/sync/folder/folder1/folder2',
                'sync/folder/folder1/folder3',
                'sync/folder/folder1/',
                '/sync/folder/folder2',
                'sync/folder'
            ],
            __dirname
        );
        test.strictEqual(errors, null);
        test.ok(pathUtil.existsSync(__dirname + '/sync/folder/folder1/folder1'));
        test.ok(pathUtil.existsSync(__dirname + '/sync/folder/folder1/folder2'));
        test.ok(pathUtil.existsSync(__dirname + '/sync/folder/folder1/folder3'));
        test.ok(pathUtil.existsSync(__dirname + '/sync/folder/folder2/folder1'));
        test.ok(pathUtil.existsSync(__dirname + '/sync/folder/folder2/folder2'));
        test.ok(pathUtil.existsSync(__dirname + '/sync/folder/folder2/folder3'));
        test.done();
    }
});

exports.makeDirsSyncLessParams = testCase({
    makeDirsSyncLessParams: function(test) {
        var errors;

        setup('sync');
        errors = makeDirsSync(
            [
                __dirname + '/sync/folder/folder2/folder1/',
                __dirname + '/sync/folder/folder2/folder2',
                __dirname + '/sync/folder/folder2/folder3',
                __dirname + '/sync/folder/folder1/folder1',
                __dirname + '/sync/folder/folder1/folder2',
                __dirname + '/sync/folder/folder1/folder3',
                __dirname + '/sync/folder/folder1/',
                __dirname + '/sync/folder/folder2',
                __dirname + '/sync/folder'
            ]
        );
        test.strictEqual(errors, null);
        test.ok(pathUtil.existsSync(__dirname + '/sync/folder/folder1/folder1'));
        test.ok(pathUtil.existsSync(__dirname + '/sync/folder/folder1/folder2'));
        test.ok(pathUtil.existsSync(__dirname + '/sync/folder/folder1/folder3'));
        test.ok(pathUtil.existsSync(__dirname + '/sync/folder/folder2/folder1'));
        test.ok(pathUtil.existsSync(__dirname + '/sync/folder/folder2/folder2'));
        test.ok(pathUtil.existsSync(__dirname + '/sync/folder/folder2/folder3'));
        test.done();
    }
});
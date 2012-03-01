var testCase = require('nodeunit').testCase,
    pathUtil = require('path'),
    fs = require('fs'),
    remove = require('../../lib').remove,
    removeSync = require('../../lib').removeSync;
    
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
    ignoreErr(fs.mkdirSync, __dirname + '/' + type + '/folder', 0755);
    ignoreErr(fs.mkdirSync, __dirname + '/' + type + '/folder/folder1', 0755);
    ignoreErr(fs.mkdirSync, __dirname + '/' + type + '/folder/folder2', 0755);
    ignoreErr(fs.mkdirSync, __dirname + '/' + type + '/folder/folder2/folder3', 0755);
    ignoreErr(fs.writeFileSync, __dirname + '/' + type + '/folder/file1.js', 'file1.js', 'utf8');
    ignoreErr(fs.writeFileSync, __dirname + '/' + type + '/folder/folder1/file2.txt', 'file2.txt', 'utf8');
    ignoreErr(fs.writeFileSync, __dirname + '/' + type + '/folder/folder2/file3.html', 'file3.html', 'utf8');    
}

///////////////////////////////////////////////////////////////////////////////////////

exports.remove = testCase({
    file: function(test) {
        function finished(errors) {
            test.strictEqual(errors, null);
            test.equals(pathUtil.existsSync(__dirname + '/async/folder/folder1/file2.txt'), false);
            test.done();
        }
        
        setup('async');
        test.expect(2);
        remove(__dirname + '/async/folder/folder1/file2.txt', finished);
    },
    dir: function(test) {
        function finished(errors) {
            test.strictEqual(errors, null);
            test.equals(pathUtil.existsSync(__dirname + '/async/folder'), false);
            test.done();
        }
        
        setup('async');
        test.expect(2);
        remove(__dirname + '/async/folder', finished);        
    },
    fileFail: function(test) {
        function finished(errors) {
            test.equals(errors.length, 1);
            test.equals(errors[0].code, 'ENOENT');
            test.equals(errors[0].path, __dirname + '/async/folder/folder1/file2.txt');
            test.done();
        }
        
        test.expect(3);
        remove(__dirname + '/async/folder/folder1/file2.txt', finished);
    },    
    dirFail: function(test) {
        function finished(errors) {
            test.equals(errors.length, 1);
            test.equals(errors[0].code, 'ENOENT');
            test.equals(errors[0].path, __dirname + '/async/folder');
            test.done();
        }
        
        test.expect(3);
        remove(__dirname + '/async/folder', finished);        
    }
});

exports.removeSync = testCase({
    file: function(test) {
        var errors;
        
        setup('sync');
        errors = removeSync(__dirname + '/sync/folder/folder1/file2.txt');
        test.equals(pathUtil.existsSync(__dirname + '/sync/folder/folder1/file2.txt'), false);
        test.strictEqual(errors, null);
        test.done();        
    },
    dir: function(test) {
        var errors;
        
        setup('sync');
        errors = removeSync(__dirname + '/sync/folder');
        test.equals(pathUtil.existsSync(__dirname + '/sync/folder'), false);
        test.strictEqual(errors, null);
        test.done();        
    },
    fileFail: function(test) {
        var errors;
        
        errors = removeSync(__dirname + '/sync/folder/folder1/file2.txt');
        test.equals(pathUtil.existsSync(__dirname + '/sync/folder/folder1/file2.txt'), false);
        test.equals(errors.length, 1);
        test.equals(errors[0].code, 'ENOENT');
        test.equals(errors[0].path, __dirname + '/sync/folder/folder1/file2.txt');
        test.done();        
    },
    dirFail: function(test) {
        var errors;
        
        errors = removeSync(__dirname + '/sync/folder');
        test.equals(pathUtil.existsSync(__dirname + '/sync/folder'), false);
        test.equals(errors.length, 1);
        test.equals(errors[0].code, 'ENOENT');
        test.equals(errors[0].path, __dirname + '/sync/folder');
        test.done();        
    }     
});
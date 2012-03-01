var testCase = require('nodeunit').testCase,
    pathUtil = require('path'),
    fs = require('fs'),
    write = require('../../lib').write,
    writeSync = require('../../lib').writeSync;
    
///////////////////////////////////////////////////////////////////////////////////////

function ignoreErr(fn, arg) {
    var args = Array.prototype.slice.call(arguments, 1);
    
    try {
        fn.apply(fs, args);
    } catch(err) {
    }
}

function setup(type) {
    ignoreErr(fs.unlinkSync, __dirname + '/' + type + '/folder/folder2/folder1/file1.txt');
    ignoreErr(fs.rmdirSync, __dirname + '/' + type + '/folder/folder2/folder1');
    ignoreErr(fs.unlinkSync, __dirname + '/' + type + '/folder/folder2/file1.txt');
    ignoreErr(fs.rmdirSync, __dirname + '/' + type + '/folder/folder2');
    ignoreErr(fs.unlinkSync, __dirname + '/' + type + '/folder/folder1/file1.txt');
    ignoreErr(fs.unlinkSync, __dirname + '/' + type + '/folder/folder1/file2.txt');
    ignoreErr(fs.rmdirSync, __dirname + '/' + type + '/folder/folder1');
    ignoreErr(fs.unlinkSync, __dirname + '/' + type + '/folder/file1.txt');
    ignoreErr(fs.rmdirSync, __dirname + '/' + type + '/folder');
}

///////////////////////////////////////////////////////////////////////////////////////

exports.write = testCase({
    setUp: function(callback) {
        setup('async');
        callback();
    },
    singleFile1: function(test) {
        var currentTime = new Date().getTime().toString(),
            file = {
                'folder/file1.txt': currentTime
            };
        
        function finished(err) {
            test.strictEqual(err, null);
            test.equals(fs.readFileSync(__dirname + '/async/folder/file1.txt', 'utf8'), currentTime);
            test.done();
        }
        
        test.expect(2);
        write(__dirname + '/async', file, finished);
    },
    singleFile2: function(test) {
        var currentTime = new Date().getTime().toString(),
            file = {
                'folder/file1.txt': currentTime
            };
        
        function finished(err) {
            test.strictEqual(err, null);
            test.equals(fs.readFileSync(__dirname + '/async/folder/file1.txt', 'utf8'), currentTime);
            test.done();
        }
        
        test.expect(2);
        write(__dirname + '/async', file, 'utf8', finished);
    },
    singleFile3: function(test) {
        var currentTime = new Date().getTime().toString(),
            file = {
                'folder/file1.txt': currentTime
            };
        
        function finished(err) {
            test.strictEqual(err, null);
            test.equals(fs.readFileSync(__dirname + '/async/folder/file1.txt', 'utf8'), currentTime);
            test.done();
        }
        
        test.expect(2);
        
        write(__dirname + '/async', file, 'utf8', 0755, finished);
    },
    bunchOfFiles: function(test) {
        var currentTime = new Date().getTime().toString(),
            files = {
                'folder/file1.txt': currentTime,
                'folder/folder1/file1.txt': currentTime,
                'folder/folder1/file2.txt': currentTime,
                'folder/folder2/file1.txt': currentTime,
                'folder/folder2/folder1/file1.txt': currentTime
            };
        
        function finished(err) {
            test.strictEqual(err, null);
            test.equals(fs.readFileSync(__dirname + '/async/folder/file1.txt', 'utf8'), currentTime);
            test.equals(fs.readFileSync(__dirname + '/async/folder/folder1/file1.txt', 'utf8'), currentTime);
            test.equals(fs.readFileSync(__dirname + '/async/folder/folder1/file2.txt', 'utf8'), currentTime);
            test.equals(fs.readFileSync(__dirname + '/async/folder/folder2/file1.txt', 'utf8'), currentTime);
            test.equals(fs.readFileSync(__dirname + '/async/folder/folder2/folder1/file1.txt', 'utf8'), currentTime);
            test.done();
        }
        
        test.expect(6);
        write(__dirname + '/async', files, finished);
    }
});

exports.writeSync = testCase({
    setUp: function(callback) {
        setup('sync');
        callback();
    },
    singleFile1: function(test) {
        var currentTime = new Date().getTime().toString(),
            file = {
                'folder/file1.txt': currentTime
            },
            errors;
        
        errors = writeSync(__dirname + '/sync', file);
        test.strictEqual(errors, null);
        test.equals(fs.readFileSync(__dirname + '/sync/folder/file1.txt', 'utf8'), currentTime);        
        test.done();
    },
    singleFile2: function(test) {
        var currentTime = new Date().getTime().toString(),
            file = {
                'folder/file1.txt': currentTime
            },
            errors;
        
        errors = writeSync(__dirname + '/sync', file, 'utf8');
        test.strictEqual(errors, null);
        test.equals(fs.readFileSync(__dirname + '/sync/folder/file1.txt', 'utf8'), currentTime);        
        test.done();
    },
    singleFile3: function(test) {
        var currentTime = new Date().getTime().toString(),
            file = {
                'folder/file1.txt': currentTime
            },
            errors;
        
        errors = writeSync(__dirname + '/sync', file, 'utf8', 0755);
        test.strictEqual(errors, null);
        test.equals(fs.readFileSync(__dirname + '/sync/folder/file1.txt', 'utf8'), currentTime);        
        test.done();
    },
    bunchOfFiles: function(test) {
        var currentTime = new Date().getTime().toString(),
            files = {
                'folder/file1.txt': currentTime,
                'folder/folder1/file1.txt': currentTime,
                'folder/folder1/file2.txt': currentTime,
                'folder/folder2/file1.txt': currentTime,
                'folder/folder2/folder1/file1.txt': currentTime
            },
            errors;

        errors = writeSync(__dirname + '/sync', files);
        test.strictEqual(errors, null);
        test.equals(fs.readFileSync(__dirname + '/sync/folder/file1.txt', 'utf8'), currentTime);
        test.equals(fs.readFileSync(__dirname + '/sync/folder/folder1/file1.txt', 'utf8'), currentTime);
        test.equals(fs.readFileSync(__dirname + '/sync/folder/folder1/file2.txt', 'utf8'), currentTime);
        test.equals(fs.readFileSync(__dirname + '/sync/folder/folder2/file1.txt', 'utf8'), currentTime);
        test.equals(fs.readFileSync(__dirname + '/sync/folder/folder2/folder1/file1.txt', 'utf8'), currentTime);
        test.done();        
    }    
});
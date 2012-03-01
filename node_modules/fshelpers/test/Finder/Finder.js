var testCase = require('nodeunit').testCase,
    Finder = require('../../').Finder,
    pathUtil = require('path');

var reader = new Finder(),
    folder1 = __dirname + '/folder1';

function resolve(path) {
    return pathUtil.resolve(__dirname, path);
}

function trimPath(path) {
    return path.substr(__dirname.length);
}

function finish(test) {
    reader.on('idle', function() {
        test.equal(reader.getNumOfWalks(), 0);
        test.done();
    });
}

///////////////////////////////////////////////////////////////////////////////////////

module.exports = testCase({
    setUp: function(callback) {
        reader.reset();
        itemsFound = {};
        callback();
    },
    hasAllItemsFound: function(test) {
        var expectedResult = {},
            result = {};

        expectedResult[__dirname + '/folder1'] = true;
        expectedResult[__dirname + '/folder1/folder2'] = true;
        expectedResult[__dirname + '/folder1/folder2/file1.js'] = true;
        expectedResult[__dirname + '/folder1/file1.js'] = true;
        expectedResult[__dirname + '/folder1/file2.txt'] = true;
        expectedResult[__dirname + '/folder1/folder1'] = true;
        expectedResult[__dirname + '/folder1/folder1/file1.js'] = true;
        expectedResult[__dirname + '/folder1/folder1/folder1'] = true;
        expectedResult[__dirname + '/folder1/folder1/folder1/file1.js'] = true;

        test.expect(3);
        reader
            .on('fileOrDir', function(path) {
                result[path] = true;
            })
            .on('end', function(path) {
                test.equal(path, __dirname + '/folder1');
                test.deepEqual(expectedResult, result);
            })
            .walk(folder1);
        finish(test);
    },
    checkCollection: function(test) {
        var expectedResult = [
            __dirname + '/folder1/file1.js',
            __dirname + '/folder1/file2.txt',
            __dirname + '/folder1/folder1/file1.js',
            __dirname + '/folder1/folder1/folder1/file1.js',
            __dirname + '/folder1/folder2/file1.js',
        ];

        test.expect(2);
        reader
            .on('end', function(path, collection) {
                test.deepEqual(collection.sort(), expectedResult.sort());
            })
            .walk(folder1);
        finish(test);
    },
    doesNotReadFiles: function(test) {
        test.expect(1);
        reader
            .on('fileRead', function() {
                throw new Error('This event should not be fired');
            })
            .walk(folder1);
        finish(test);
    },
    hasAllFilesRead: function(test) {
        var result = {};

        test.expect(6);
        reader
            .on('fileRead', function(path, data) {
                result[path] = data;
            })
            .on('end', function() {
                var key;
                
                for(key in result) {
                    test.equal(
                        trimPath(key),
                        result[key]
                    );
                }
            })
            .walk(folder1, Finder.RECURSIVE, 'utf8');
        finish(test);
    },
    idleStartingTest: function(test) {
        test.expect(1);
        reader
            .once('idle', function() {
                reader.walk(resolve('./folder1'));
                reader.once('idle', function() {
                    throw new Error('This event should not be fired');
                });
            })
            .once('end', function() {
                reader.removeAllListeners('idle');
                finish(test);
            });
    },
    stopTest: function(test) {
        test.expect(1);
        reader
            .on('fileOrDir', function() {
                throw new Error('This event should not be fired');
            })
            .walk(resolve('./folder1/folder1'));
        finish(test);
        reader.stop(resolve('./folder1/folder1'));
    },
    walkWhenIdleTest: function(test) {
        var times = 0;

        test.expect(2);
        reader
            .on('end', function(path) {
                times++;
                if(times === 2) {
                    finish(test);
                }
            })
            .walk(resolve('./folder1/folder1'));
        reader
            .once('idle', function() {
                test.ok(times === 1);
            })
            .walkWhenIdle(resolve('./folder1/folder2'));
    },
    dirFilterTest: function(test) {
        test.expect(4);
        reader.dirFilter = function(dirName) {
            return /1$/gi.test(dirName);
        };
        reader
            .on('dir', function(path) {
                path = trimPath(path);
                test.equal(path.match('folder2'), null);
            })
            .once('end', function() {
                finish(test);
            })
            .walk(resolve('./folder1'));
    },
    fileFilterTest: function(test) {
        test.expect(2);
        reader.fileFilter = function(fileName) {
            return /\.txt$/gi.test(fileName);
        };
        reader
            .on('file', function(path) {
                test.notEqual(path.match(/\.txt$/gi), null);
            })
            .once('end', function() {
                finish(test);
            })
            .walk(resolve('./folder1'));
    },
    independentInstanceTest: function(test) {
        var otherFinder = new Finder();

        reader
            .on('file', function() {});
        test.ok(reader.listeners('file').length !== otherFinder.listeners('file').length);
        test.done();
    },
    errorTest: function(test) {
        var error = false;

        test.expect(2);
        reader
            .on('error', function() {
                error = true;
            })
            .on('end', function() {
                test.ok(error);
                finish(test);
            })
            .walk('./asdasd/');
    },
    parallelTestRun: function(test) {
        var countedItems = 0;

        test.expect(2);
        reader
            .on('file', function(path) {
                countedItems++;
            })
            .on('end', function() {
                test.equal(countedItems, 10);
                finish(test);
            })
            .walk(resolve('./folder1'));
        reader
            .walk(resolve('./folder1'));
    },
    depthTest: function(test) {
        var countedItems = 0;

        test.expect(2);
        reader
            .on('file', function() {
                countedItems++;
            })
            .on('end', function() {
                test.equal(countedItems, 2);
                finish(test);
            })
            .walk(resolve('./folder1'), 1);
    },
    walkSyncVsWalk: function(test) {
        var times = 0,
            result = [];

        function finished(path, collection) {
            result[times] = collection;
            times++;
            if(times === 2) {
                test.deepEqual(result[0], result[1]);
            }
        }

        test.expect(2);
        reader
            .on('end', finished)
            .walkSync(resolve('./folder1'), Finder.RECURSIVE, 'utf8');
        reader
            .walk(resolve('./folder1'), Finder.RECURSIVE, 'utf8');
        finish(test);
    },
    walkSyncStop: function(test) {
        test.expect(1);
        reader
            .once('fileOrDir', function(path) {
                reader.on('fileOrDir', function() {
                    throw new Error('This event should not be fired');
                });
                finish(test);
                reader.stop();
            })
            .walkSync(resolve('./folder1'));
    },
    walkSyncError: function(test) {
        test.expect(2);
        reader
            .on('error', function() {
                finish(test);
            });

        test.doesNotThrow(function() {
            reader.walk('./asdasd');
        });
    }
});
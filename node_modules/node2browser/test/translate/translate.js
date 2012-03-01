var testCase = require('nodeunit').testCase,
    translate = require('../../lib/translate'),
    setup = require('../../lib/setup'),
    pathUtil = require('path'),
    http = require('http'),
    fs = require('fs'),
    vm = require('vm');

///////////////////////////////////////////////////////////////////////////////////////

var sandbox,
    consoleMsg,
    module1Path = __dirname + '/folder1/module1.js',
    module2Path = __dirname + '/folder1/module2.js',
    circular1Path = __dirname + '/folder1/circular1.js',
    folder1 = [
        module1Path,
        module2Path,
        circular1Path,
        __dirname + '/folder1/circular2.js',
        __dirname + '/folder1/main.js'
    ],
    otherModulePath = __dirname + '/folder2/otherModule1.js',
    folder3Index = __dirname + '/folder3/index.js',
    folder4 = [
        __dirname + '/node_modules/folder4/module1.js',
        __dirname + '/node_modules/folder4/module2.js'
    ],
    browserModules = [
        __dirname + '/browser/node_modules/folder1/module1.js',
        __dirname + '/browser/node_modules/folder1/package.json',
        __dirname + '/browser/node_modules/folder2/module2.js',
        __dirname + '/browser/node_modules/test.js'
    ];

function run(src, modulePath) {
    src = setup(src, modulePath);
    //console.log(src);
    vm.runInNewContext(src, sandbox);
}

function consoleWrapper(txt) {
    consoleMsg = txt;
    //console.log(txt);
}

module.exports = testCase({
    setUp: function(finished) {
        sandbox = {
            console: {
                warn: consoleWrapper,
                error: consoleWrapper,
                log: consoleWrapper
            }
        };

        sandbox.window = sandbox;
        consoleMsg = undefined;
        finished();
    },
    simpleModule: function(test) {
        test.expect(2);
        translate(
            module1Path,
            undefined,
            function result(err, src, files) {
                var module1;

                if(err) {throw err;}
                test.deepEqual(files, [module1Path]);
                run(src, module1Path);
                module1 = sandbox.modules[module1Path];
                test.equal(module1(), 2);
                test.done();
            }
        );
    },
    singleRequirement: function(test) {
        test.expect(2);
        translate(
            module2Path,
            undefined,
            function result(err, src, files) {
                var module2;

                if(err) {throw err;}
                test.deepEqual(files.sort(), [module1Path, module2Path].sort());
                run(src, module2Path);
                module2 = sandbox.modules[module2Path];
                test.equal(module2(), 3);
                test.done();
            }
        );
    },
    unknownInitModule: function(test) {
        test.expect(1);
        translate(
            folder1,
            undefined,
            function result(err, src) {
                if(err) {throw err;}
                run(src, __dirname + '/folder1');
                test.equal(consoleMsg, 'Cannot initialize unknown module ' + __dirname + '/folder1');
                test.done();
            }
        );
    },
    circularDependency: function(test) {
        test.expect(1);
        translate(
            folder1,
            undefined,
            function result(err, src) {
                if(err) {throw err;}
                run(src, circular1Path);
                test.equal(
                    consoleMsg,
                    'node2browser error: circular dependency detected.\n'
                        + 'module ' + __dirname + '/folder1/circular2.js is requiring '
                        + __dirname + '/folder1/circular1.js and vice versa.'
                    );
                test.done();
            }
        );
    },
    packageJSON: function(test) {
        test.expect(4);
        translate(
            otherModulePath,
            undefined,
            function result(err, src, files) {
                if(err) {throw err;}
                run(src, __dirname + '/folder2/package.json');
                test.deepEqual(
                    files.sort(),
                    [
                        __dirname + '/folder2/package.json',
                        __dirname + '/folder2/otherModule1.js',
                        __dirname + '/folder2/otherModule2.js',
                        __dirname + '/folder2/otherModule3.js',
                        __dirname + '/folder2/otherModule4.js'
                    ].sort()
                );
                // if package.json has been initialized, then otherModule2,
                // otherModule3 and otherModule4 must be objects
                test.equal(typeof sandbox.modules[__dirname + '/folder2/otherModule2.js'], 'object');
                test.equal(typeof sandbox.modules[__dirname + '/folder2/otherModule3.js'], 'object');
                test.equal(typeof sandbox.modules[__dirname + '/folder2/otherModule4.js'], 'object');
                test.done();
            }
        );
    },
    withPathModifier: function(test) {
        function finished(err ,src) {
            var module1 = 'node_modules/folder4/module1.js';

            if(err) {throw err;}
            run(src, module1);
            module1 = sandbox.modules[module1];
            test.equal(consoleMsg, undefined);
            test.equal(module1, 'module2');
            test.done();
        }

        function pathModifier(path) {
            if (/.*node_modules\//gi.test(path)) {
                return 'node_modules/' + path.replace(/.*node_modules\//gi, '');
            } else {
                return path;
            }
        }

        test.expect(2);
        translate(folder4, pathModifier, finished);
    },
    withFalsyPathModifier: function(test) {
        function finished(err, src) {
            if(err) {throw err;}
            test.strictEqual(src, '');
            test.done();
        }

        function pathModifier(path) {
            return false;
        }

        test.expect(1);
        translate(folder4, pathModifier, finished);
    },
    writingBrowserTest: function(test) {
        var nodeUnitPath = pathUtil.dirname(require.resolve('nodeunit')) + '/examples/browser/nodeunit.js',
            nodeUnit = fs.readFileSync(nodeUnitPath, 'utf8');

        function finished(err, src) {
            var testModule = 'node_modules/test.js';

            if(err) {throw err;}
            run(src, testModule);
            src = setup(src, testModule);
            src = nodeUnit + src;
            fs.writeFileSync(__dirname + '/browser/modules.js', src, 'utf8');
            test.done();
        }

        function pathModifier(path) {
            if (/.*node_modules\//gi.test(path)) {
                return 'node_modules/' + path.replace(/.*node_modules\//gi, '');
            } else {
                return path;
            }
        }

        translate(browserModules, pathModifier, finished);
    }
});
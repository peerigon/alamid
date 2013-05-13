"use strict";

var child_process = require('child_process'),
    exec = child_process.exec,
    spawn = child_process.spawn,
    path = require("path"),
    os = require("os");

var tests = __dirname + "/test",
    clientTests = tests + "/client",
    sharedTests = tests + "/shared",
    webpackDevServerBin = path.join(__dirname, "node_modules", "webpack-dev-server", "bin", "webpack-dev-server.js");

module.exports = function (grunt) {

    grunt.initConfig({
        simplemocha : {
            all : {
                src : ["test/server/**/*.test.js", "test/shared/**/*.test.js", "test/core/**/*.test.js"],
                options : {
                    globals : ['should'],
                    timeout : 3000,
                    ignoreLeaks : false,
                    ui : 'bdd',
                    reporter : 'spec'
                }
            },
            nyan : {
                src : ["test/server/**/*.test.js", "test/shared/**/*.test.js", "test/core/**/*.test.js"],
                options : {
                    globals : ['should'],
                    timeout : 3000,
                    ignoreLeaks : false,
                    ui : 'bdd',
                    reporter : 'nyan'
                }
            },
            shared : {
                src : 'test/shared/**/*.test.js',
                options : {
                    globals : ['should'],
                    timeout : 3000,
                    ignoreLeaks : false,
                    ui : 'bdd',
                    reporter : 'spec'
                }
            },
            server : {
                src : 'test/server/**/*.test.js',
                options : {
                    globals : ['should'],
                    timeout : 3000,
                    ignoreLeaks : false,
                    ui : 'bdd',
                    reporter : 'spec'
                }
            },
            core : {
                src : 'test/core/**/*.test.js',
                options : {
                    globals : ['should'],
                    timeout : 3000,
                    ignoreLeaks : false,
                    ui : 'bdd',
                    reporter : 'spec'
                }
            },
            jenkins : {
                src : ["test/server/**/*.test.js", "test/shared/**/*.test.js", "test/core/**/*.test.js"],
                options : {
                    globals : ['should'],
                    timeout : 3000,
                    ignoreLeaks : false,
                    ui : 'bdd',
                    reporter : 'xunit-file'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-simple-mocha');

    grunt.registerTask("enable-testing-mode", "sets env to testing to keep the console quiet", function () {
        var env = process.env;
        env.env = "testing"; //logger be quiet!
    });

    grunt.registerTask("freshNpmInstall", "deletes the node_modules folder and does npm install afterwards", function () {

        var done = this.async();

        var rmNodeModulesProcess = exec("rm -r -f " + __dirname + "/node_modules  ",
            function (error, stdout, stderr) {

                if (error !== null) {
                    done(error);
                    return;
                }

                var npmInstall = spawn("npm", ["install"]);

                //awesome pipeing!
                npmInstall.stdout.pipe(process.stdout);
                npmInstall.stderr.pipe(process.stderr);

                npmInstall.on('exit', function (code) {
                    if (code === 0) {
                        done(null);
                    }
                    else {
                        done(new Error("NPM Install error!"));
                    }
                });
            });
    });

    grunt.registerTask("test-client", "Browser tests", function testClient() {
        this.async();
        runWebpackDevServer(clientTests);
    });

    grunt.registerTask("test-shared-browser", "Shared browser-tests", function testSharedBrowser() {
        this.async();
        runWebpackDevServer(sharedTests);
    });

    grunt.registerTask("test-all-browser", "Browsers tests for client- and shared-lib", function testClientShared() {
        this.async();
        runWebpackDevServer(tests);
    });

    //mocha server tests
    grunt.registerTask("test-server", ["enable-testing-mode", "simplemocha:server"]);
    grunt.registerTask("test-core", ["enable-testing-mode", "simplemocha:core"]);
    grunt.registerTask("test-shared", ["enable-testing-mode", "simplemocha:shared"]);

    grunt.registerTask('test-all', ["enable-testing-mode", "simplemocha:all"]);

    grunt.registerTask("test-jenkins", ["enable-testing-mode", "simplemocha:jenkins"]);

};

function runWebpackDevServer(cwd) {
    var webpackProcess = exec("node " + webpackDevServerBin, { cwd: cwd }, function (error, stdout, stderr) {

        if (error) {
            console.error("(alamid) Error running webpack-dev-server: " + error);
        }

    });

    // awesome piping
    webpackProcess.stdout.pipe(process.stdout);
    webpackProcess.stderr.pipe(process.stderr);
}
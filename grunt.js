"use strict";

var child_process = require('child_process'),
    exec = child_process.exec,
    spawn = child_process.spawn,
    path = require("path"),
    os = require("os");

var nof5 = __dirname  + "/node_modules/nof5/bin/nof5",
    tests = __dirname  + "/test",
    clientTests = tests + "/client",
    sharedTests = tests + "/shared",
    testAssets = tests + "/assets";

module.exports = function(grunt) {

    grunt.initConfig({
        lint: {
            files: ["grunt.js", "lib/server/**/*.js"]
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                eqnull: true,
                node : true,
                es5 : true,
                globalstrict : true
            }
        },
        simplemocha: {
            all: {
                src: ["test/server/**/*.test.js", "test/shared/**/*.test.js", "test/core/**/*.test.js"],
                options: {
                    globals: ['should'],
                    timeout: 3000,
                    ignoreLeaks: false,
                    ui: 'bdd',
                    reporter: 'spec'
                }
            },
            nyan: {
                src: ["test/server/**/*.test.js", "test/shared/**/*.test.js", "test/core/**/*.test.js"],
                options: {
                    globals: ['should'],
                    timeout: 3000,
                    ignoreLeaks: false,
                    ui: 'bdd',
                    reporter: 'nyan'
                }
            },
            shared : {
                src: 'test/shared/**/*.test.js',
                options: {
                    globals: ['should'],
                    timeout: 3000,
                    ignoreLeaks: false,
                    ui: 'bdd',
                    reporter: 'spec'
                }
            },
            server : {
                src: 'test/server/**/*.test.js',
                options: {
                    globals: ['should'],
                    timeout: 3000,
                    ignoreLeaks: false,
                    ui: 'bdd',
                    reporter: 'spec'
                }
            },
            core : {
                src: 'test/core/**/*.test.js',
                options: {
                    globals: ['should'],
                    timeout: 3000,
                    ignoreLeaks: false,
                    ui: 'bdd',
                    reporter: 'spec'
                }
            },
            jenkins: {
                src: ["test/server/**/*.test.js", "test/shared/**/*.test.js", "test/core/**/*.test.js"],
                options: {
                    globals: ['should'],
                    timeout: 3000,
                    ignoreLeaks: false,
                    ui: 'bdd',
                    reporter: 'xunit-file'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-simple-mocha');

    grunt.registerTask("enable-testing-mode", "sets env to testing to keep the console quiet", function() {
        var env = process.env;
        env.env = "testing"; //logger be quiet!
    });

    /**
     * @param {string} testPath
     * @param {string} assetsPath
     * @param {number} nof5Port
     */
    grunt.registerHelper("simpleNof5", function simpleNof5(testPath, assetsPath, nof5Port) {

        var nof5Cmd = "cd " + path.resolve(testPath) + " && node " + nof5 + " -p " + nof5Port,
            nof5Process,

            openBrowserURL = "http://localhost:" + nof5Port,
            openBrowserCmd,
            openBrowserProcess;

        testPath = testPath || process.cwd();

        if (assetsPath) {
            nof5Cmd = nof5Cmd + " -a " + path.resolve(assetsPath);
        }

        nof5Process = exec(nof5Cmd, function execNof5Cmd(error, stdout, stderr) {

            if (error) {
                console.error("(alamid) Error running nof5: " + error);
            }

        });

        switch (os.platform()) {

            case "linux":
                openBrowserCmd = "sensible-browser " + openBrowserURL;
                break;

            case "darwin":
                openBrowserCmd = "open " + openBrowserURL;
                break;
        }

        // as we can't determine when nof5 is up an running we're just wait for a second
        setTimeout(function openBrowser() {

            openBrowserProcess = exec(openBrowserCmd, function execOpenBrowserCmd(error, stdout, stderr) {

                if (error) {
                    console.error("alamid Error opening default browser: " + error);
                }

                openBrowserProcess.stdout.pipe(process.stdout);
                openBrowserProcess.stderr.pipe(process.stderr);
            });

        }, 2000);

        // awesome piping
        nof5Process.stdout.pipe(process.stdout);
        nof5Process.stderr.pipe(process.stderr);

        // increment nof5's port so that it wouldn't clash with existing nof5 instances
        ++nof5Port;
    });

    grunt.registerTask("freshNpmInstall","deletes the node_modules folder and does npm install afterwards", function() {

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
                    if(code === 0) {
                        done(null);
                    }
                    else {
                        done(new Error("NPM Install error!"));
                    }
                });
            });
    });


    grunt.registerTask("test-client", "Browser tests with nof5", function testClient() {

        var done = this.async();

        grunt.helper("simpleNof5", clientTests, testAssets, 11234);
    });

    grunt.registerTask("test-shared-browser", "Shared browser-tests with nof5", function testSharedBrowser() {

        var done = this.async();

        grunt.helper("simpleNof5", sharedTests, testAssets, 11235);

    });

    grunt.registerTask("test-client-shared", "Browsers tests for client- and shared-lib with nof5", function TestClientShared() {

        var done = this.async();

        grunt.helper("simpleNof5", clientTests, testAssets, 11234);
        grunt.helper("simpleNof5", sharedTests, testAssets, 11235);

    });

    //mocha server tests
    grunt.registerTask("test-server", "enable-testing-mode simplemocha:server");
    grunt.registerTask("test-core", "enable-testing-mode simplemocha:core");
    grunt.registerTask("test-shared", "enable-testing-mode simplemocha:shared");

    grunt.registerTask('test-all', "enable-testing-mode simplemocha:all");

    grunt.registerTask("test-jenkins", "enable-testing-mode simplemocha:jenkins");

};
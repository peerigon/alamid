"use strict";

var child_process = require('child_process'),
    exec = child_process.exec,
    spawn = child_process.spawn,
    path = require("path");

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
        env.mode = "testing"; //logger be quiet!
    });

    grunt.registerHelper('nof5Test', function(testPath, callback) {

        var nof5Command = 'cd ' + testPath + " ; nof5";

        var nof5Process = exec(nof5Command,
            function (error, stdout, stderr) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });

        nof5Process.stdout.pipe(process.stdout);
        nof5Process.stderr.pipe(process.stderr);

        //give nof5 some time to initialize
        setTimeout(function() {
            var openBrowserCmd = "open http://localhost:11234";
            var openBrowserProcess = exec(openBrowserCmd, function(error){
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
                callback(error);
            });
        }, 1000);
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


    grunt.registerTask("test-client", "tests with nof5", function() {

        var done = this.async();

        grunt.helper("nof5Test", path.resolve(__dirname, "./test/client"), function() {
            //do nothing, kill it manually
        });
    });

    grunt.registerTask("test-shared-browser", "tests with nof5", function() {

        var done = this.async();

        grunt.helper("nof5Test", path.resolve(__dirname, "./test/shared"), function() {
            //do nothing, kill it manually
        });
    });

    //mocha server tests
    grunt.registerTask("test-server", "enable-testing-mode simplemocha:server");
    grunt.registerTask("test-core", "enable-testing-mode simplemocha:core");
    grunt.registerTask("test-shared", "enable-testing-mode simplemocha:shared");

    grunt.registerTask('test-all', "enable-testing-mode simplemocha:all");

    grunt.registerTask("test-jenkins", "enable-testing-mode simplemocha:jenkins");

};
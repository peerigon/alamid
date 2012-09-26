"use strict";

var exec = require('child_process').exec,
    child,
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
        env.mode = "testing"; //logger be quiet
    });

    grunt.registerTask("test-nof5", "tests with nof5", function() {

        var done = this.async(),
            cmd = 'cd ' + path.resolve(__dirname, "./test/client") + " ; nof5";

        console.log(cmd);

        child = exec(cmd,
            function (error, stdout, stderr) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });

        setTimeout(function() {
            var cmd2 = "open http://localhost:11234";
            console.log("cms2", cmd2);
            var browser = exec(cmd2, function(err, stdout, stderr){
                console.log(err, stdout, stderr);
            });

        }, 1000);


    });

    //mocha tests
    grunt.registerTask("test-server", "enable-testing-mode simplemocha:server");
    grunt.registerTask("test-core", "enable-testing-mode simplemocha:core");

    grunt.registerTask("test-shared", "enable-testing-mode simplemocha:shared");

    grunt.registerTask('test-all', "enable-testing-mode simplemocha:all");

    grunt.registerTask("test-jenkins", "enable-testing-mode simplemocha:jenkins");


    // ==========================================================================
    // HELPERS
    // ==========================================================================

    grunt.registerHelper('phantomjs', function(options) {
        return grunt.utils.spawn({
            cmd: 'phantomjs',
            args: options.args
        }, function(err, result, code) {
            if (!err) { return options.done(null); }
            // Something went horribly wrong.
            grunt.verbose.or.writeln();
            grunt.log.write('Running PhantomJS...').error();
            if (code === 127) {
                grunt.log.errorlns(
                    'In order for this task to work properly, PhantomJS must be ' +
                        'installed and in the system PATH (if you can run "phantomjs" at' +
                        ' the command line, this task should work). Unfortunately, ' +
                        'PhantomJS cannot be installed automatically via npm or grunt. ' +
                        'See the grunt FAQ for PhantomJS installation instructions: ' +
                        'https://github.com/cowboy/grunt/blob/master/docs/faq.md'
                );
                grunt.warn('PhantomJS not found.', options.code);
            } else {
                result.split('\n').forEach(grunt.log.error, grunt.log);
                grunt.warn('PhantomJS exited unexpectedly with exit code ' + code + '.', options.code);
            }
            options.done(code);
        });
    });

};
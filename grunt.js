"use strict";

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

    //mocha tests
    grunt.registerTask("test-server", "enable-testing-mode simplemocha:server");
    grunt.registerTask("test-core", "enable-testing-mode simplemocha:core");

    grunt.registerTask("test-shared", "enable-testing-mode simplemocha:shared");

    grunt.registerTask('test-all', "enable-testing-mode simplemocha:all");

    grunt.registerTask("test-jenkins", "enable-testing-mode simplemocha:jenkins");
};
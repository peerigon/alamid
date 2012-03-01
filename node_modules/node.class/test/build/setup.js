var fs = require('fs'),
    vm = require('vm');

function log(txt) {
    console.log(txt.replace(/([\{\}\;])/gi, "$1\n"));
}

function loadSrc(className) {
    var src = fs.readFileSync(__dirname + '/src/node_modules/' + className + '.js', 'utf8');
    var classModule = {
        "require": function(path) {
            if(path !== 'assert') {
                return loadSrc(path);
            } else {
                return require(path);
            }
        },
        console: console
    }
    
    vm.runInNewContext(src, classModule);
    
    return classModule;
}

function compile(className) {
    var buildModule = require('../../lib/build');
    var src = fs.readFileSync(__dirname + '/src/node_modules/' + className + '.js', 'utf8');
    var classModule = loadSrc(className);
    
    src = src + '\n' + buildModule(classModule, className);
    
    fs.writeFileSync(__dirname + '/compiled/node_modules/' + className + '.js', src);
}

function load(className) {
    return require(__dirname + '/compiled/node_modules/' + className + '.js');
}

exports.log = log;
exports.compile = compile;
exports.load = load;
exports.loadSrc = loadSrc;
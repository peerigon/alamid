// Initializing modules
/*
var clientShims = require('./clientShims.js'),
    domAdapter = require('./domAdapter.js'),
    templates = require('./templates.js'),
    appState = require('./appState.js'),
    services = require('./../shared/services.js'),
    validators = require('./../shared/validators.js'),
    settings = require('./../shared/settings.js');

domAdapter.onDOMReady(function onDOMReady() {
    settings.baseURL = location.protocol + '//' + location.host + settings.basePath;

    appState.init();
});

setTimeout(function() { // clearing callstack
    try {
        require('misc/init' + '.js');   // hack to disable dependency management
    } catch (err) {

    }
}, 0);
    */
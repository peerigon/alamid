var paths = require('../../core/paths'),
    settings = require('../../core/config'),
    fs = require('fs');

var init;

function serveInitPage(req, res) {
    function serve() {
        fs.readFile(paths.appCache + '/init.html', function onFileRead(err, data) {
            if(err) throw err;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(data);
        });
    }

    if (settings.isDev) {
        console.log('starting recompile...');
        init = require('../../init');   // conditional require to prevent a circular dependency
        init(paths.app, serve);
    } else {
        serve();
    }
}

module.exports = serveInitPage;
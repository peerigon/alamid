var fs = require('fs'),
    etag = require('connect').utils.etag,
    settings = require('../core/settings.js');

var etags = {};

function sendFile(path, req, res) {
    var clientEtag = req.headers['if-none-match'],
        serverEtag;

    function onStat(err, stats) {
        if (err) throw err;
        serverEtag = etag(stats);
        if (clientEtag === serverEtag) {
            res.statusCode = 304;
            res.end();
        } else {
            fs.readFile(path, 'utf8', onFileRead);
        }
    }

    function onFileRead(err, data) {
        if (err) throw err;
        if (!settings.isDev) {
            res.setHeader('ETag', serverEtag);
        }
        res.end(data);
    }

    if (settings.isDev) {
        fs.readFile(path, 'utf8', onFileRead);
    } else {
        fs.stat(path, onStat);
    }
}

module.exports = sendFile;
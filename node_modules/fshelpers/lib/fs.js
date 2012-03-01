/**
 * <p><b>MODULE: fs</b></p>
 * 
 * <p>Wraps all asynchronous filesystem functions so they call the callback
 * additionally to the result with all parameters that have been passed to them
 * originally.</p>
 * 
 * <p>E.g. a callback from fs.readFile will be called with
 * callback(err, filename, data, encoding);</p>
 * 
 * <p>All other function are should passed through so you dont have to keep
 * two references for both the core-module and this.</p>
 * 
 * @see MODULE: wrap for further explanations
 * @version 0.1.0
 */


var fs = require('fs'),
    wrap = require('./wrap');

exports.rename = wrap(fs.rename);
exports.renameSync = fs.renameSync;
exports.truncate = wrap(fs.truncate);
exports.truncateSync = fs.truncateSync;
exports.chmod = wrap(fs.chmod);
exports.chmodSync = fs.chmodSync;
exports.stat = wrap(fs.stat);
exports.lstat = wrap(fs.lstat);
exports.fstat = wrap(fs.fstat);
exports.statSync = fs.statSync;
exports.lstatSync = fs.lstatSync;
exports.fstatSync = fs.fstatSync;
exports.link = wrap(fs.link);
exports.linkSync = fs.linkSync;
exports.symlink = wrap(fs.symlink);
exports.symlinkSync = fs.symlinkSync;
exports.readlink = wrap(fs.readlink);
exports.readlinkSync = fs.readlinkSync;
exports.realpath = wrap(fs.realpath);
exports.realpathSync = fs.realpathSync;
exports.unlink = wrap(fs.unlink);
exports.unlinkSync = fs.unlinkSync;
exports.rmdir = wrap(fs.rmdir);
exports.rmdirSync = fs.rmdirSync;
exports.mkdir = wrap(fs.mkdir);
exports.mkdirSync = fs.mkdirSync;
exports.readdir = wrap(fs.readdir);
exports.readdirSync = fs.readdirSync;
exports.close = wrap(fs.close);
exports.closeSync = fs.closeSync;
exports.open = wrap(fs.open);
exports.openSync = fs.openSync;
exports.write = wrap(fs.write);
exports.writeSync = fs.writeSync;
exports.writeSync = fs.writeSync;
exports.read = wrap(fs.read);
exports.readSync = fs.readSync;
exports.readSync = fs.readSync;
exports.readFile = wrap(fs.readFile);
exports.readFileSync = fs.readFileSync;
exports.writeFile = wrap(fs.writeFile);
exports.writeFileSync = fs.writeFileSync;
exports.watchFile = wrap(fs.watchFile);
exports.unwatchFile = wrap(fs.unwatchFile);
exports.Stats = fs.Stats;
exports.ReadStream = fs.ReadStream;
exports.createReadStream = fs.createReadStream;
exports.WriteStream = fs.WriteStream;
exports.createWriteStream = fs.createWriteStream;
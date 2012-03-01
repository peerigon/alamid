var domAdapter = require('./domAdapter');

function loadScript(url, callback) {
    var script = document.createElement('script');

    if (url.indexOf('?') === -1) {
        url = url + '?ajax';
    } else {
        url = url + '&ajax';
    }
    script.src = url;
    script.type = 'text/javascript';
    domAdapter.append(document.head, script); // add script tag to head element

    if('\v'=='v') {    // this crazy hack identifies IE
        script.onreadystatechange = function onreadystatechange() {
            if(script.readyState === 'loaded' || script.readyState === 'complete') {
                callback();
            }
        }
    } else {
        script.onload = callback;
    }
}

module.exports = loadScript;


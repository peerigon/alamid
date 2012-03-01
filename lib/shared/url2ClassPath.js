function url2ClassPath(URL) {
    var classPath,
        URLArr,
        className;

    URL = URL.replace(/https?:\/\/[^\/]+\//gi, '');     // remove host and protocol
    if (URL[URL.length - 1] === '/') {
        URL = URL.substr(0, URL.length - 1);    // remove trailing slash
    }
    URLArr = URL.split('/');
    className = URLArr.pop();
    className = className.charAt(0).toUpperCase() + className.substr(1);   // capitalize
    className += '.class.js';
    URLArr.push(className);
    classPath = URLArr.join('/');

    return classPath;
}

module.exports = url2ClassPath;
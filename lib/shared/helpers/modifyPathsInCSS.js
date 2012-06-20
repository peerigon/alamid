"use strict"; // run code in ES5 strict mode

function modifyPathsInCSS(css, absolutePath) {

    // make relative paths within href- and src-attributes to absolute paths
    css = css.replace(
        /((?:href)|(?:src))\s*=\s*(["'])?(\w(?!\w+:\/\/))/gi,
        '$1=$2' + absolutePath + '/$3'
    );

    return css;
}

module.exports = modifyPathsInCSS;
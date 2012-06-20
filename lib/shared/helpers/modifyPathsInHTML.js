"use strict"; // run code in ES5 strict mode

function modifyPathsInHTML(html, absolutePath) {
    if (absolutePath.charAt(absolutePath.length -1) !== "/") {
        absolutePath = absolutePath + "/";
    }

    // make relative paths within href- and src-attributes to absolute paths
    html = html.replace(
        /((?:href)|(?:src))\s*=\s*(["'])?(\w(?!\w+:\/\/))/gi,
        '$1=$2' + absolutePath + '$3'
    );

    return html;
}

module.exports = modifyPathsInHTML;
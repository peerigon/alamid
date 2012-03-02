var domAdapter = require('./domAdapter'),
    settings = require('./settings'),
    appState;

var externalLink = /^\w+:/i;



function onLinkClick(event) {
    var href = this.getAttribute('href');

    appState.setState(href);
    event.stop();
    return false;
}

function prepareLinks(element) {
    var links = domAdapter.select(element, 'a'),
        link,
        href,
        prepareFlag,
        i;

    if (!appState) {     // avoiding circular dependency
        appState = require('./appState');
    }
    for (i = 0; i < links.length; i++) {
        link = links[i];
        prepareFlag = link.getAttribute('data-prepare');
        if (prepareFlag && prepareFlag === 'false') {
            continue;
        }
        href = link.getAttribute('href');
        if (!externalLink.test(href)) {
            link.setAttribute('href', settings.basePath + href);
            domAdapter.onClick(link, onLinkClick);
        }
    }

}

module.exports = prepareLinks;
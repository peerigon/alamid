var domAdapter = require('./domAdapter'),
    settings = require('./settings'),
    Page = require('./Page.class'),
    historyAdapter;

var currentState,
    initialized = false,
    firstNode,
    indexPage;

// parses the state string
function stateStringToArray(stateString) {
    if (stateString[0] === '/') {
        stateString = stateString.substr(settings.basePath.length);
    } else {
        stateString = currentState + '/' + stateString;
    }

    return stateString.replace(/^\//, '').replace(/\/$/, '').split('/'); // trimming leading and trailing slashes
}

function getState() {
    return currentState;
}

function setState(newState) {
    changePageStates(newState, function onPageStatesChanged(newState) {
        currentState = settings.basePath + '/' + newState;
        historyAdapter.save(currentState);
    });
}

function changePageStates(newState, callback) {
    var i = 0,
        previousPage,
        currentPage,
        newStateArr = stateStringToArray(newState),
        state;

    function walkHierachy() {
        previousPage = currentPage;
        if (currentPage) {
            currentPage = currentPage.getSubPage();
        } else {
            currentPage = indexPage;
        }
        if (i > 0) {
            newStateArr[i - 1] = previousPage.getState();
        }
        if (currentPage && currentPage.getPossibleStates()) {
            if (i < newStateArr.length) {
                state = newStateArr[i];
            } else {
                state = 'index';
            }
            i++;
            currentPage.setState(state, walkHierachy);
        } else {
            callback(newStateArr.join('/'));
        }
    }
    walkHierachy();
}

function onPopState(event) {
    changePageStates(location.pathname, function onPageStatesChanged(newState) {
        currentState = newState;
    });
}

function init() {
    if (!initialized) {
        historyAdapter = require('./historyAdapter');
        historyAdapter.onPopState(onPopState);
        currentState = location.pathname;
        firstNode = domAdapter.node(document.body, 'page');
        Page.create(firstNode, 'index', function() {
            indexPage = firstNode.pageObject;
            setState(currentState);
        });
        initialized = true;
    }
}

exports.setState = setState;
exports.getState = getState;
exports.init = init;
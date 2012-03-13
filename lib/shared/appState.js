var domAdapter = require('./domAdapter'),
    settings = require('./settings'),
    Page = require('./Page.class'),
    historyAdapter;

var currentState,
    initialized = false,
    firstNode,
    indexPage;

function getState() {
    return currentState;
}

function setState(newState) {
    newState = newState.replace(/\/$/, ''); // trimming trailing slashes
    changePageStates(newState, function onPageStatesChanged(newState) {
        currentState = newState;
        historyAdapter.save(settings.basePath + newState);
    });
}

function changePageStates(newState, callback) {
    var i = 0,
        previousPage,
        currentPage,
        newStateArr = newState.replace(/^\//, '').split("/"),
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
            callback('/' + newStateArr.join('/'));
        }
    }
    walkHierachy();
}

function onPopState(event) {
    var newState = location.pathname.substr(settings.basePath.length);

    newState = newState.replace(/\/$/, ''); // trimming trailing slashes
    if (newState !== currentState) {
        changePageStates(newState, function onPageStatesChanged(newState) {
            currentState = newState;
        });
    }
}

function init() {
    if (!initialized) {
        historyAdapter = require('./historyAdapter');
        historyAdapter.onPopState(onPopState);
        firstNode = domAdapter.node(document.body, 'page');
        Page.create(firstNode, 'index', function() {
            var initialState = location.pathname.substr(settings.basePath.length);

            indexPage = firstNode.pageObject;
            setState(initialState);
        });
        initialized = true;
    }
}

exports.setState = setState;
exports.getState = getState;
exports.init = init;
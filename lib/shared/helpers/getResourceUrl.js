"use strict";

var getResourceUrl;

function curry(graceful) {
    return function getResourceUrl(modelUrl, ids) {
        var resourceUrl = "";
        var partialModelUrl = "";
        var key = "";
        var urlSplit;
        var i;

        graceful = graceful === undefined? false : Boolean(graceful);

        urlSplit = modelUrl.split("/");

        for (i = 0; i < urlSplit.length; i++) {
            key = urlSplit[i];
            resourceUrl += key;
            partialModelUrl += key;

            if (!ids[partialModelUrl]) {
                if (i === urlSplit.length - 1) {
                    // We've reached the end.
                    // Some requests (e.g. "create") don't require an id at the end of the url
                    continue;
                }

                if (graceful) {
                    return null;
                }
                throw new Error("(alamid) Cannot resolve resource url: Parent id of '" + partialModelUrl + "' is missing.");
            }

            resourceUrl += "/" + ids[partialModelUrl];
            partialModelUrl += "/";

            if (i < urlSplit.length - 1) {
                resourceUrl += "/";
            }
        }

        return resourceUrl;
    };
}

getResourceUrl = curry(false);
getResourceUrl.graceful = curry(true);

module.exports = getResourceUrl;
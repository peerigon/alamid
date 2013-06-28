"use strict";

function getResourceUrl(modelUrl, ids) {
    var resourceUrl = "",
        partialModelUrl = "",
        key = "",
        id,
        urlSplit,
        i;

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

            throw new Error("(alamid) Cannot resolve resource url: Parent id of '" + partialModelUrl + "' is missing.");
        }

        resourceUrl += "/" + ids[partialModelUrl];
        partialModelUrl += "/";

        if (i < urlSplit.length - 1) {
            resourceUrl += "/";
        }
    }

    return resourceUrl;
}

module.exports = getResourceUrl;
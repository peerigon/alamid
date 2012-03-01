var cache = {};

function setTemplate(key, value) {
    cache[key] = value;
}

function getTemplate(key) {
    return cache[key];
}

exports.setTemplate = setTemplate;
exports.getTemplate = getTemplate;
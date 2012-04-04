var paths = require("../lib/core/paths.js"),
    pathModifier = paths.getPathModifier(
        ['noAlamidFiles', 'noServerFiles'],
        ['nodeModules']
    );

console.log(pathModifier("/node/spook/bananabombcanon2/node_modules/app/src/node_modules"));


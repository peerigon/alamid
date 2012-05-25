var adapterPath = 'misc/historyAdapter.js',
    adapter = require(adapterPath);     // hack to disable the dependency management.
                                        // the adapter will be included manually

module.exports = adapter;
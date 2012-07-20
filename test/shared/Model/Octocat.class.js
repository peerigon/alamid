
var Class = require("nodeclass").Class;
var Model = require('../../../lib/shared/Model.class.js'),
    schema = require("./schemas/OctocatSchema.js");

var Octocat = new Class({
    Extends : Model,
    $url : "Octocat",
    "init": function(id) {
        this.Super(id);
        this.Super.setSchema(schema);
    },
    "accept": function() {
        this.Super.acceptCurrentState();
    }
});

module.exports = Octocat;
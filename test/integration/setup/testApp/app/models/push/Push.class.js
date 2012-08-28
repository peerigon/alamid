var Class = require("nodeclass").Class;
var Model = require('../../../../../../../lib/shared/Model.class.js');

 var PushSchema = {
        name: {
            type: String
        }
    };

var Push = new Class({
    Extends : Model,
    $url : "push",
    "init": function(id) {
        this.Super(id);
        this.Super.setSchema(PushSchema, "shared");
        this.Super.setSchema(PushSchema);
    },
    "accept": function() {
        this.Super.acceptCurrentState();
    }
});

module.exports = Push;
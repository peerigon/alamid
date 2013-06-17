"use strict";

require("../testHelpers/polyfills.js");

require("../../lib/client/helpers/domAdapter.js").$ = require("../testHelpers/jquery.js");

require("./helpers/domAdapter.test.js");
require("./helpers/request.test.js");
require("./helpers/subscribeModelHandler.test.js");
require("./Client.class.test.js");
require("./Displayable.class.test.js");
require("./env.test.js");
require("./index.test.js");
require("./ModelService.test.js");
require("./Page.class.test.js");
require("./PageController.class.test.js");
require("./PageLoader.class.test.js");
require("./RemoteService.class.test.js");
require("./validator.test.js");
require("./View.class.test.js");
require("./ViewCollection.class.test.js");
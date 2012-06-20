"use strict"; // run code in ES5 strict mode

"use strict";

var Class = require("nodeclass").Class;

var SomeOtherClass = new Class({

    "init" : function () {
        //nothing to do here
    }
});

module.exports = SomeOtherClass;





var Module = this;
var Class = module.exports; 
var Extends = Class.Extends;


var Constructor = function() {
    var tmp,
        implChildAbstracts,
        implAbstracts,
        constructorIsRunning,
        exposeProtected,
        exposeNothing,
        Properties,
        Instance,
        key;

    
    if(Constructor.$) {
        tmp = Constructor.$;
        Instance = tmp.Instance; 
        implChildAbstracts = tmp.implChildAbstracts; 
        constructorIsRunning = tmp.constructorIsRunning; 
        exposeProtected = tmp.exposeProtected; 
        exposeNothing = tmp.exposeNothing; 
    }

    if(constructorIsRunning) { 
        throw new Error("Class error in " + __filename + ": Constructor recursion detected.");
        return;
    } else {
        Constructor.$ = {
            "constructorIsRunning": true
        };
    }

     

    if(!exposeNothing) {
        if(!implChildAbstracts) {
            implChildAbstracts = {};
        }

        if (Instance === undefined) {
            Instance = this;
        }
        Properties = {};  
         
        Properties.Instance = Instance;

        implAbstracts = implChildAbstracts;

        
        
        
        
        for(key in implChildAbstracts) {
            if(implChildAbstracts.hasOwnProperty(key)) {
                Properties[key] = implChildAbstracts[key];
            }
        }

         
        Class.init.apply(Properties, arguments); 
         

         
        if(exposeProtected) {
             
        }
    }

    delete Constructor.$; 
};


Constructor.$construct = function(args) { 
    var Instance = function Instance() {
        return Constructor.apply(this,args);
    };
    Instance.prototype = Constructor.prototype;
    return new Instance();
};


 

module.exports = Constructor;
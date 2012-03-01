var _ = require('underscore'),
    templates = require('./templates'),
    toSrc = require('toSrc'),
    AbstractInstanceError = templates.AbstractInstanceError,
    ClassConstructor = templates.ClassConstructor,
    Code = templates.Code,
    FunctionRightHand = templates.FunctionRightHand,
    GetterFunction = templates.GetterFunction,
    ImplAbstractsLeftHand = templates.ImplAbstractsLeftHand,
    InitCall = templates.InitCall,
    InitConstructor = templates.InitConstructor,
    PropertiesLeftHand = templates.PropertiesLeftHand,
    SetterFunction = templates.SetterFunction,
    StaticsLeftHand = templates.StaticsLeftHand,
    StaticsRightHand = templates.StaticsRightHand,
    SuperConstructor = templates.SuperConstructor,
    SuperConstructorCall = templates.SuperConstructorCall,
    WrapperLeftHand = templates.WrapperLeftHand,
    WrapperSuperRightHand = templates.WrapperSuperRightHand;
    

/**
 * <p>Capitalizes the first letter. Used for camelCase-names for all setters and getters.</p>
 * 
 * @private
 * @param {String} string
 * @returns {String} string
 */
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}



/**
 * <p>Modifies the key-string, so it looks like an ordinary setter.</p>
 * <p>_someProperty becomes setSomeProperty</p>
 * 
 * @private
 * @param {String} key
 * @returns {String} key
 */
function setterKeyModificator(key) {
    return 'set' + capitalize(trimPrefix(key));
}



/**
 * <p>Modifies the key-string, so it looks like an ordinary getter.</p>
 * <p>_someProperty becomes getSomeProperty</p>
 * 
 * @private
 * @param {String} key
 * @returns {String} key
 */
function getterKeyModificator(key) {
    return 'get' + capitalize(trimPrefix(key));
}



/**
 * <p>Trims all prefixes like _ __ ? $</p>
 * 
 * @private
 * @param {String} key
 * @returns {String} key
 */
function trimPrefix(key) {
    return key.replace(/^[_\?\$]_?/, '');
}


/**
 * <p>Returns a string that contains some JavaScript-assignments.</p>
 * 
 * <p>All properties of the given collection will be transformed to an assignment
 * using the given templates. Additionally you can pass a function that modifies
 * the key that are used in the assignment.</p>
 * 
 * <p>All keys contained in the blacklist-object are ignored.</p>
 * 
 * <p>Example:<br />
 * <br />
 * collection = {"name": "John Doe", "age": 27 }<br />
 * blacklist = {"age": null}<br />
 * leftHandTemplate = "this.<%= varName %>"<br />
 * rightHandTemplate = "<%= varValue %>;"<br />
 * leftHandKeyModificator = function(key) {return key.charAt(0);}<br />
 * rightHandKeyModificator = function(key) {return key.charAt(0);}<br />
 * <br />
 * will result in: <br/>
 * "this.n=J;"
 * </p>
 * 
 * @private
 * @param {String} collection collection of key-value-pairs
 * @param {Function} leftHandTemplate a function from the template module
 * @param {Function} [rightHandTemplate] optional a function from the template module. If it's null, the value will be turned into source code
 * @param {Object} [blacklist={}] optional object with all keys that will be ignored
 * @param {Function} [leftHandKeyModificator] optional function to modify the key on the left side
 * @param {Function} [rightHandKeyModificator] optional function to modify the key on the right side
 * @returns {String} source code
 */
function getAssignment(
        collection,
        leftHandTemplate,
        rightHandTemplate,
        blacklist,
        leftHandKeyModificator,
        rightHandKeyModificator
    ) {
        
    var src = '',
        leftHandKey,
        rightHandKey;
    
    if(!blacklist) {
        blacklist = {};
    }
    if(!leftHandKeyModificator) {
        leftHandKeyModificator = _.identity;
    }
    if(!rightHandKeyModificator) {
        rightHandKeyModificator = _.identity;
    }
    _(collection).each(function eachProperty(value, key) {
        if(blacklist[key]) {
            return;
        }
        leftHandKey = leftHandKeyModificator(key);
        rightHandKey = rightHandKeyModificator(key);
        src += leftHandTemplate(leftHandKey) + '=';
        if(rightHandTemplate) {
            src += rightHandTemplate(rightHandKey);
        } else {
            src += toSrc(value);
        }
        src += ';';
    });
    
    return src;
}



/**
 * <p>Returns the source code for a class module</p>
 * 
 * @private
 * @param {String} This the result object after you've called collectProperties().
 *      If you pass a Super-object, the This-object should have the properties
 *      This.Overridden (by calling collect.collectOverriddenProperties) and
 *      This.ImplementedAbstracts (by calling collect.collectImplAbstracts)
 * @param {String} classFile the class file. necessary for error messages.
 * @param {String} [Super] optional an object containing all super properties, created via collectSuperProperties()
 * @returns {String} key
 */
function assembleStrings(This, Super) {
    var properties = '',
        implAbstracts = '',
        wrapper = '',
        exposeWrapper = '',
        statics = '',
        classConstructor = '',
        initCall = '',
        abstractInstanceError = '',
        superConstructor = '',
        superConstructorCall = '',
        initConstructor = '';
    
    
    // Creating the source code of the Properties-object.
    // The Properties-object contains copies from all properties of the original
    // Class-object. Additionally all functions are binded to this object.
    // Thus it is an independent instance and all changes occur only on this
    // object.
    properties += getAssignment(
            This.Private.Function,
            PropertiesLeftHand,
            FunctionRightHand
        )
        + getAssignment(
            This.Private.Other,
            PropertiesLeftHand
        )
        + getAssignment(
            This.Protected.Function,
            PropertiesLeftHand,
            FunctionRightHand
        )
        + getAssignment(
            This.Protected.Other,
            PropertiesLeftHand
        )
        + getAssignment(
            This.Public.Function,
            PropertiesLeftHand,
            FunctionRightHand
        )
        + getAssignment(
            This.Public.Other,
            PropertiesLeftHand
        );
    
    if(_(This.Abstract).size() > 0) { // Is this class abstract? In case of, we're adding an Error that is thrown when the class is instantiated.'
        abstractInstanceError = AbstractInstanceError(
            '\\"' + _(This.Abstract).keys().join('\\", \\"') + '\\"'
        );
    }
    
    if(This.Init) {
        initCall = InitCall(This.Init);
    }    
    
    // The wrapper provides access only to public. Additionally all properties,
    // that are not functions are wrapped with getters and setters.
    wrapper += getAssignment(
            This.Public.Function,
            WrapperLeftHand,
            FunctionRightHand
        )
        + getAssignment(
            This.Public.Other,
            WrapperLeftHand,
            SetterFunction,
            null,
            setterKeyModificator
        )
        + getAssignment(
            This.Public.Other,
            WrapperLeftHand,
            GetterFunction,
            null,
            getterKeyModificator
        );
    
    // The expose wrapper is only applied if the exposeProtected flag is set.
    // It provides access to protected properties so a child class can use them.
    exposeWrapper += getAssignment(
            This.Protected.Function,
            WrapperLeftHand,
            FunctionRightHand,
            null,
            trimPrefix
        )
        + getAssignment(
            This.Protected.Other,
            WrapperLeftHand,
            SetterFunction,
            null,
            setterKeyModificator
        )
        + getAssignment(
            This.Protected.Other,
            WrapperLeftHand,
            GetterFunction,
            null,
            getterKeyModificator
        );
    
    // If we have a super class, than all super properties must be added to the
    // wrapper, too.
    if(Super) {
        wrapper += getAssignment(
                Super.Public.Function,
                WrapperLeftHand,
                WrapperSuperRightHand,
                This.Overridden
            )
            + getAssignment(
                Super.Public.Other,
                WrapperLeftHand,
                WrapperSuperRightHand,
                This.Overridden,
                setterKeyModificator,
                setterKeyModificator
            )
            + getAssignment(
                Super.Public.Other,
                WrapperLeftHand,
                WrapperSuperRightHand,
                This.Overridden,
                getterKeyModificator,
                getterKeyModificator
            );
    
        exposeWrapper += getAssignment(
                Super.Protected.Function,
                WrapperLeftHand,
                WrapperSuperRightHand,
                This.Overridden,
                trimPrefix,
                trimPrefix
            )
            + getAssignment(
                Super.Protected.Other,
                WrapperLeftHand,
                WrapperSuperRightHand,
                This.Overridden,
                setterKeyModificator,
                setterKeyModificator
            )
            + getAssignment(
                Super.Protected.Other,
                WrapperLeftHand,
                WrapperSuperRightHand,
                This.Overridden,
                getterKeyModificator,
                getterKeyModificator
            );
                
        initConstructor = InitConstructor();
        superConstructor = SuperConstructor();
        superConstructorCall = SuperConstructorCall();
        
        // All abstract functions that are implemented by a child class are
        // now added to the Properties-object so we can access them in this class
        implAbstracts = getAssignment(
            This.ImplementedAbstracts,
            ImplAbstractsLeftHand,
            FunctionRightHand
        );
    }
    
    // At last we're adding all static properties to the Class-object
    statics += getAssignment(
            This.Static.Function,
            StaticsLeftHand,
            StaticsRightHand,
            null,
            trimPrefix
        )
        + getAssignment(
            This.Static.Other,
            StaticsLeftHand,
            StaticsRightHand,
            null,
            trimPrefix
        );
            
    classConstructor = ClassConstructor(
        properties,
        wrapper,
        exposeWrapper,
        initCall,
        implAbstracts,
        abstractInstanceError,
        superConstructor,
        superConstructorCall
    );
        
    return Code(classConstructor, initConstructor, statics);
}

module.exports = assembleStrings;
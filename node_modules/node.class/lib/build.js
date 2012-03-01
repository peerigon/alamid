/**
 * <p><b>MODULE: build</b></p>
 *
 * <p>Builds a constructor function from a class module. The result is
 * returned as a string containing JavaScript-code, so it can be evaled inside
 * of the class module.</p>
 *
 * <p>The constructor function wrappes a Properties-object, being a copy
 * of the original Class-object. Functions from the Class-object are not copied
 * but binded with the Properties-object as this-reference, so every operation
 * in a function is done on the current Properties-object.</p>
 *
 * <p>Additionally the constructor function provides access to all public
 * members by default. To expose protected members as well, every constructor
 * function reads the Constructor.$-object and constructs the new object
 * as instructed by the given flags. For instance: If $.exposeProtected is true,
 * the constructor provides access to all protected members, so a child-class
 * can use them, too. These flags are used:
 * <ol>
 *    <li>implChildAbstracts: an array that contains references to all abstract
 *    functions that are implemented in a child class</li>
 *    <li>constructorIsRunning: indicates that this constructor is not finished
 *    yet. If this flag is true, a recursion error is thrown.</li>
 *    <li>exposeProtected: if true, the constructor function exposes all
 *    protected class members.</li>
 *    <li>exposeNothing: if true, the constructor does nothing. This flag is
 *    set by a child class so it can use the super-constructor as a prototype
 *    to make the "instanceof"-operator work. Without this flag, every
 *    constructor function would have properties inherited by the super class
 *    which does not make any sense.</li>
 * </ol>
 * </p>
 *
 * <p>This module uses the memoize caching-functionality provided by
 * the underscore framework. You can disable this behaviour by passing
 * false as second argument.</p>
 *
 * @requires third-party: underscore http://documentcloud.github.com/underscore/
 * @requires module: toSrc git://github.com/jhnns/toSrc.git
 *
 * @version 0.1.0
 */


var _ = require('underscore'),    // underscore framework
    toSrc = require('toSrc'),   // turns every object or primitive in a string representation
    collect = require('./collect'),
    assembleStrings = require('./assembleStrings');


/**
 * <p>Builds source code that can be evaled inside of the class module to get
 * a Constructor-function for the class.</p>
 *
 * @private
 * @param {Object} classModule the class module
 * @returns {String} source
 */
function build(classModule) {
    var This,
        Super,
        src;

    if(typeof classModule !== 'object') {
        throw new Error('The class module is not an object. Instead of that it is typeof ' + typeof classModule);
    }
    if(typeof classModule.Class !== 'object') {
        throw new Error('Cannot find the "Class"-property. The "Class"-property must be an object.');
    }

    // Collecting all properties of this class and all inherited properties
    This = collect.collectProperties(classModule.Class);
    if(typeof classModule.Extends === 'object') {
        Super = collect.collectSuperProperties(classModule.Extends);
        This.Overridden = collect.collectOverriddenProperties(This, Super);
        This.ImplementedAbstracts = collect.collectImplAbstracts(
            classModule.Class,
            _(Super.Abstract).keys()
        );
    }

    // Assembling the strings from the collected properties
    src = assembleStrings(This, Super);

    return src;
}

module.exports = build;
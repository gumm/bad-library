goog.provide('bad.utils');
goog.require('goog.ui.Css3ButtonRenderer');
goog.require('goog.ui.CustomButton');

/**
 * @param {string} string
 * @param {string} icon
 * @return {!Element}
 */
bad.utils.getIconString = function(string, icon) {
    return goog.dom.createDom('span', {},
        goog.dom.createDom('i', icon), string);
};

/**
 * Make a default button.
 * @param {!string} elId The element id that will be decorated.
 * @param {Function=} opt_callback The callback function to execute on
 *      button action.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @return {goog.ui.CustomButton}
 */
bad.utils.makeButton = function(elId, opt_callback, opt_domHelper) {
    var button = new goog.ui.CustomButton('',
        goog.ui.Css3ButtonRenderer.getInstance(), opt_domHelper);
    button.setSupportedState(goog.ui.Component.State.FOCUSED, false);
    button.decorate(goog.dom.getElement(elId));
    if (opt_callback) {
        button.getHandler().listen(
            button,
            goog.ui.Component.EventType.ACTION,
            function() {
                opt_callback();
            }, undefined, button
        );
    }
    return button;
};

/**
 *
 * @param {number=} opt_start
 * @return {function(): number}
 */
bad.utils.privateCounter = function(opt_start) {
    var c = opt_start ? opt_start : 0;

    /**
     * @return {number}
     */
    return function() {
        c = c + 1;
        return c;
    };
};

/**
 * Returns a pseudo random string. Good for ids.
 * @return {string}
 */
bad.utils.makeId = function() {
    return Math.floor(Math.random() * 2147483648).toString(36);
};

/**
 * Private function that will always return the same random string each time
 * it is called.
 * @return {string}
 */
bad.utils.privateRandom = function() {
    var c = bad.utils.makeId();

    /**
     * @return {string}
     */
    return (function() {
        return c;
    })();
};

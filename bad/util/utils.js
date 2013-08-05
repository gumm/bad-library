goog.provide('bad.utils');
goog.require('goog.ui.CustomButton');
goog.require('goog.ui.Css3ButtonRenderer');

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
 * @returns {goog.ui.CustomButton}
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

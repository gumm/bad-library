/**
 * @fileoverview  An extension of goog.ui.Component to extend the workflow.
 */

goog.provide('bad.ui.Component');

goog.require('goog.ui.Component');


/**
 * Create a bad.ui.Component. This is an extension of the basic
 * goog.ui.Compoent, and provides more control over the component targeting
 * and rendering.
 *
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
bad.ui.Component = function(opt_domHelper) {
    goog.ui.Component.call(this, opt_domHelper);

    /**
     * @type {Element}
     */
    this.target_ = null;
};
goog.inherits(bad.ui.Component, goog.ui.Component);

/**
 * Arguments passed into this call directly override the target set
 * with setTarget().
 * If a target has been specified, it will first set it, and then use it,
 * else it will simply fall back to normal component operation.
 * @param {Element=} opt_target The target element
 *      where the panel will be rendered.
 */
bad.ui.Component.prototype.render = function(opt_target) {
    if (opt_target) {
        this.setTarget(opt_target);
    }

    if (this.target_) {
        bad.ui.Component.superClass_.render.call(this, this.target_);
    } else {
        bad.ui.Component.superClass_.render.call(this);
    }
};

/**
 * Creates the initial DOM representation for the component.  The default
 * implementation is to set this.element_ = div.
 */
bad.ui.Component.prototype.createDom = function() {
    bad.ui.Component.superClass_.createDom.call(this);

    // Function stub for sub-classing
};

/**
 * Called when the component's element is known to be in the document. Anything
 * using document.getElementById etc. should be done at this stage. If the
 * component contains child components, this call is propagated to its
 * children.
 */
bad.ui.Component.prototype.enterDocument = function() {
    bad.ui.Component.superClass_.enterDocument.call(this);

    // Function stub for sub-classing
};

bad.ui.Component.prototype.exitDocument = function() {
    bad.ui.Component.superClass_.exitDocument.call(this);

    // Function stub for sub-classing
};

bad.ui.Component.prototype.disposeInternal = function() {
    bad.ui.Component.superClass_.disposeInternal.call(this);

    // Function stub for sub-classing
};

/**
 * Set the target element where the component will render to.
 * @param {Element} element A valid dom element.
 */
bad.ui.Component.prototype.setTarget = function(element) {
    this.target_ = element;
};

/**
 * Get the target element where the component was rendered to.
 * @return {Element} A valid dom element.
 */
bad.ui.Component.prototype.getTarget = function() {
    return this.target_;
};

bad.ui.Component.prototype.hide = function() {
    goog.style.setElementShown(this.getElement(), false);
};

bad.ui.Component.prototype.show = function() {
    goog.style.setElementShown(this.getElement(), true);
};

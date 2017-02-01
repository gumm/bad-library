/**
 * @fileoverview  An extension of goog.ui.Component to extend the workflow.
 */

goog.provide('bad.ActionEvent');
goog.provide('bad.ui.Component');

goog.require('bad.ui.EventType');
goog.require('goog.events.Event');
goog.require('goog.style');
goog.require('goog.ui.Component');



/**
 * Create a bad.ui.Component. This is an extension of the basic
 * goog.ui.Component, and provides more control over the component targeting
 * and rendering.
 *
 * @param {?goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
bad.ui.Component = function(opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  /**
   * @type {?Element}
   * @private
   */
  this.target_ = null;
};
goog.inherits(bad.ui.Component, goog.ui.Component);


/**
 * A callback function to execute before the component ready callback
 * is executed.
 * @private
 */
bad.ui.Component.prototype.onBeforeCompReadyCallback_ = goog.nullFunction;


/**
 * Arguments passed into this call directly override the target set
 * with setTarget().
 * If a target has been specified, it will first set it, and then use it,
 * else it will simply fall back to normal component operation.
 * @param {?Element=} opt_target The target element
 *      where the panel will be rendered.
 * @override
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
 * @inheritDoc
 */
bad.ui.Component.prototype.enterDocument = function() {
  bad.ui.Component.superClass_.enterDocument.call(this);

  this.onBeforeComponentReady();
  this.dispatchActionEvent(bad.ui.EventType.READY);
};


/**
 * Fired before the component ready callback is executed.
 */
bad.ui.Component.prototype.onBeforeComponentReady = function() {
  this.onBeforeCompReadyCallback_();
};


/**
 * @param {!Function} func A callback guaranteed to fire after the panels is
 * ready, and in the document, but before the
 * {@code bad.ui.EventType.READY} event is fired.
 */
bad.ui.Component.prototype.setBeforeReadyCallback = function(func) {
  this.onBeforeCompReadyCallback_ = func;
};


/**
 * Set the target element where the component will render to.
 * @param {!Element|!HTMLElement} element A valid dom element.
 */
bad.ui.Component.prototype.setTarget = function(element) {
  this.target_ = element;
};


/**
 * Get the target element where the component was rendered to.
 * @return {?Element|?HTMLElement} A valid dom element.
 */
bad.ui.Component.prototype.getTarget = function() {
  return this.target_;
};


/**
 * Hide the component without removing it from the DOM.
 */
bad.ui.Component.prototype.hide = function() {
  goog.style.setElementShown(this.getElement(), false);
};


/**
 * Show a hidden component.
 */
bad.ui.Component.prototype.show = function() {
  goog.style.setElementShown(this.getElement(), true);
};


//---------------------------------------------------------[ Component Event ]--
/**
 * Dispatches a {@code bad.ui.EventType.ACTION} event.
 * A shorthand method to get panels to dispatch uniform events.
 * Views may listen just to this event, and act on the supplied value or
 * data payload.
 * @param {!string} value
 * @param {(string|number|?Object)=} opt_data
 * @return {boolean} If anyone called preventDefault on the event object (or
 *     if any of the handlers returns false this will also return false.
 */
bad.ui.Component.prototype.dispatchActionEvent = function(value, opt_data) {
  const event = new bad.ActionEvent(this, value, opt_data);
  return this.dispatchEvent(event);
};



//-------------------------------------------------------------[ Panel Event ]--
/**
 * @param {!bad.ui.Component} target
 * @param {!string} value
 * @param {(string|number|?Object)=} opt_data
 * @constructor
 * @extends {goog.events.Event}
 */
bad.ActionEvent = function(target, value, opt_data) {
  goog.events.Event.call(this, bad.ui.EventType.ACTION, target);

  /**
   * @type {!string}
   * @private
   */
  this.value_ = value;

  /**
   * @type {(string|number|?Object)}
   * @private
   */
  this.data_ = opt_data || {};
};
goog.inherits(bad.ActionEvent, goog.events.Event);


/**
 * @return {!string}
 */
bad.ActionEvent.prototype.getValue = function() {
  return this.value_;
};


/**
 * @return {(string|number|?Object)}
 */
bad.ActionEvent.prototype.getData = function() {
  return this.data_;
};

/**
 * Created by gumm on 2017/02/02.
 */
goog.provide('bad.CompEvent');
goog.require('goog.events.Event');


//-------------------------------------------------------------[ Panel Event ]--
/**
 * @param {bad.ui.Component} target
 * @param {string} value
 * @param {?(string|number|IObject|Object)=} opt_data
 * @constructor
 * @extends {goog.events.Event}
 */
bad.CompEvent = function(target, value, opt_data) {
  goog.events.Event.call(this, bad.EventType.COMP, target);

  /**
   * @type {string}
   * @private
   */
  this.value_ = value;

  /**
   * @type {string|number|IObject|Object}
   * @private
   */
  this.data_ = opt_data || {};
};
goog.inherits(bad.CompEvent, goog.events.Event);


/**
 * @return {string}
 */
bad.CompEvent.prototype.getValue = function() {
  return this.value_;
};


/**
 * @return {string|number|IObject|Object}
 */
bad.CompEvent.prototype.getData = function() {
  return this.data_;
};

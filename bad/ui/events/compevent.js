/**
 * Created by gumm on 2017/02/02.
 */
goog.provide('bad.CompEvent');
goog.require('goog.events.Event');


//-------------------------------------------------------------[ Panel Event ]--
/**
 * @param {!bad.ui.Component} target
 * @param {!string} value
 * @param {(string|number|?Object)=} opt_data
 * @constructor
 * @extends {goog.events.Event}
 */
bad.CompEvent = function(target, value, opt_data) {
  goog.events.Event.call(this, bad.ui.EventType.ACTION, target);

  /**
   * @type {!string}
   * @private
   */
  this.value_ = value;

  /**
   * @type {*}
   * @private
   */
  this.data_ = opt_data || {};
};
goog.inherits(bad.CompEvent, goog.events.Event);


/**
 * @return {!string}
 */
bad.CompEvent.prototype.getValue = function() {
  return this.value_;
};


/**
 * @return {*}
 */
bad.CompEvent.prototype.getData = function() {
  return this.data_;
};

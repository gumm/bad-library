/**
 * Created by gumm on 2017/02/02.
 */
goog.provide('bad.ViewEvent');
goog.require('goog.events.Event');


//-------------------------------------------------------------[ View Events ]--
/**
 * Object representing bad.ui.ViewEvent event.
 *
 * @param {!bad.ui.View} target The view that dispatched the event.
 * @param {!string} value Secondary event value.
 * @param {*=} opt_data Optional data to include
 *    in the event.
 * @extends {goog.events.Event}
 * @constructor
 */
bad.ViewEvent = function(target, value, opt_data) {
  goog.events.Event.call(this, bad.EventType.VIEW, target);

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
goog.inherits(bad.ViewEvent, goog.events.Event);

/**
 * @return {!string}
 */
bad.ViewEvent.prototype.getValue = function() {
  return this.value_;
};


/**
 * @return {*}
 */
bad.ViewEvent.prototype.getData = function() {
  return this.data_;
};

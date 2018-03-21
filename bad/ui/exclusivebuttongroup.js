/**
 * Created by gumm on 2016/01/01.
 */

goog.provide('bad.ui.ExButtonGroup');

goog.require('goog.events.EventHandler');
goog.require('goog.ui.Component');



/**
 * Manages a set of toggle buttons to be exclusive. That is make them
 * function like radio buttons: only one button can be selected at a time.
 *
 * @constructor
 * @extends {goog.events.EventHandler}
 */
bad.ui.ExButtonGroup = function() {
  goog.events.EventHandler.call(this);

  /**
   * @type {!Array<!(!goog.ui.ToggleButton|!bad.ui.ExButtonGroup)>}
   * @private
   */
  this.buttonSet_ = [];
};
goog.inherits(bad.ui.ExButtonGroup, goog.events.EventHandler);


/**
 * @param {!goog.ui.ToggleButton} button
 */
bad.ui.ExButtonGroup.prototype.addToggleButton = function(button) {
  this.listen(button, goog.ui.Component.EventType.ACTION, this.onAction);
  this.buttonSet_.push(button);
};


/**
 * @param {!bad.ui.ExButtonGroup} group
 */
bad.ui.ExButtonGroup.prototype.addExGroup = function(group) {
  this.buttonSet_.push(group);
};


/**
 * @param {!goog.events.Event} e
 */
bad.ui.ExButtonGroup.prototype.onAction = function(e) {
  const activeButton = e.target;
  this.buttonSet_.forEach(button => {
    if (button !== activeButton) {
      button.setChecked(false);
    }
  });
};


/**
 * @param {!boolean} bool
 */
bad.ui.ExButtonGroup.prototype.setChecked = function(bool) {
  this.buttonSet_.forEach(button => {
    if (button instanceof goog.ui.ToggleButton) {
      button.setChecked(false);
    }
  });
};

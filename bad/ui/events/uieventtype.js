/**
 * @fileoverview Panel Event Types.
 *
 */
goog.provide('bad.EventType');
goog.provide('bad.ui.Resizable.EventType');

goog.require('bad.utils');

/**
 * @enum {string}
 */
bad.ui.Resizable.EventType = {
  RESIZE: 'resize',
  START_RESIZE: 'start_resize',
  END_RESIZE: 'end_resize'
};

/**
 * Constants for panel event.
 * @enum {string}
 */
// noinspection JSUnusedGlobalSymbols
bad.EventType = {
  /**
   * Dispatched after the content from the template is in the DOM
   * and the in-line scripts from the AJAX call has been eval'd.
   */
  ACTION: bad.utils.privateRandom(),
  READY: bad.utils.privateRandom(),
  APP_DO: bad.utils.privateRandom(),
  PANEL_MINIMIZE: bad.utils.privateRandom()
};

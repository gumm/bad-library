goog.provide('bad.ui.FlatButtonRenderer');

goog.require('goog.ui.Css3ButtonRenderer');

/**
 * @constructor
 * @extends {goog.ui.Css3ButtonRenderer}
 */
bad.ui.FlatButtonRenderer = function() {
  goog.ui.Css3ButtonRenderer.call(this);
};
goog.inherits(bad.ui.FlatButtonRenderer, goog.ui.Css3ButtonRenderer);
goog.addSingletonGetter(bad.ui.FlatButtonRenderer);

/**
 * CSS class name the renderer applies to menu item elements.
 * @type {string}
 */
bad.ui.FlatButtonRenderer.CSS_CLASS = goog.getCssName('flat-button');

/** @override */
bad.ui.FlatButtonRenderer.prototype.getCssClass = function() {
  return bad.ui.FlatButtonRenderer.CSS_CLASS;
};

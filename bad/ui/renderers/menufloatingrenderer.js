goog.provide('bad.ui.MenuFloatRenderer');

goog.require('goog.ui.MenuRenderer');

/**
 * @constructor
 * @extends {goog.ui.MenuRenderer}
 */
bad.ui.MenuFloatRenderer = function() {
  goog.ui.MenuRenderer.call(this);
};
goog.inherits(bad.ui.MenuFloatRenderer, goog.ui.MenuRenderer);
goog.addSingletonGetter(bad.ui.MenuFloatRenderer);

/**
 * Default CSS class to be applied to the root element of toolbars rendered
 * by this renderer.
 * @type {string}
 */
bad.ui.MenuFloatRenderer.CSS_CLASS = goog.getCssName('floating-menu');

/**
 * Returns the CSS class to be applied to the root element of containers
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
bad.ui.MenuFloatRenderer.prototype.getCssClass = function() {
  return bad.ui.MenuFloatRenderer.CSS_CLASS;
};

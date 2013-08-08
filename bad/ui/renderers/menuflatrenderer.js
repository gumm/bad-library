goog.provide('bad.ui.MenuFlatRenderer');

goog.require('goog.ui.MenuRenderer');

/**
 * @constructor
 * @extends {goog.ui.MenuRenderer}
 */
bad.ui.MenuFlatRenderer = function () {
  goog.ui.MenuRenderer.call(this);
};
goog.inherits(bad.ui.MenuFlatRenderer, goog.ui.MenuRenderer);
goog.addSingletonGetter(bad.ui.MenuFlatRenderer);


/**
 * Default CSS class to be applied to the root element of toolbars rendered
 * by this renderer.
 * @type {string}
 */
bad.ui.MenuFlatRenderer.CSS_CLASS = goog.getCssName('flat-menu');

/**
 * Returns the CSS class to be applied to the root element of containers
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
bad.ui.MenuFlatRenderer.prototype.getCssClass = function() {
  return bad.ui.MenuFlatRenderer.CSS_CLASS;
};
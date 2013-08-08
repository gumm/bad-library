goog.provide('bad.ui.MenuItemRenderer');

goog.require('goog.ui.MenuItemRenderer');

/**
 * @constructor
 * @extends {goog.ui.MenuItemRenderer}
 */
bad.ui.MenuItemRenderer = function() {
  goog.ui.MenuItemRenderer.call(this);
};
goog.inherits(bad.ui.MenuItemRenderer, goog.ui.MenuItemRenderer);
goog.addSingletonGetter(bad.ui.MenuItemRenderer);


/**
 * CSS class name the renderer applies to menu item elements.
 * @type {string}
 */
bad.ui.MenuItemRenderer.CSS_CLASS = goog.getCssName('flat-menuitem');

/** @override */
bad.ui.MenuItemRenderer.prototype.getCssClass = function() {
  return bad.ui.MenuItemRenderer.CSS_CLASS;
};

goog.provide('bad.ui.MenuButtonRenderer');

goog.require('goog.ui.Css3MenuButtonRenderer');

/**
 * @constructor
 * @extends {goog.ui.Css3MenuButtonRenderer}
 */
bad.ui.MenuButtonRenderer = function() {
  goog.ui.Css3MenuButtonRenderer.call(this);
};
goog.inherits(bad.ui.MenuItemRenderer, goog.ui.Css3MenuButtonRenderer);
goog.addSingletonGetter(bad.ui.MenuButtonRenderer);

/**
 * CSS class name the renderer applies to menu item elements.
 * @type {string}
 */
bad.ui.MenuButtonRenderer.CSS_CLASS = goog.getCssName('flat-menu-button');

/** @override */
bad.ui.MenuButtonRenderer.prototype.getCssClass = function() {
  return bad.ui.MenuButtonRenderer.CSS_CLASS;
};

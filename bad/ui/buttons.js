goog.provide('bad.ui.flatButtons');

goog.require('goog.ui.Css3ButtonRenderer');
goog.require('goog.ui.Css3MenuButtonRenderer');

/**
 * @return {!goog.ui.ButtonRenderer}
 */
bad.ui.flatButtons.getBasicButton = function() {
  var renderer = goog.ui.Css3ButtonRenderer.getInstance();
  renderer.CSS_CLASS = goog.getCssName('flat-button');
  return renderer;
};

/**
 * @return {!goog.ui.Css3MenuButtonRenderer}
 */
bad.ui.flatButtons.getMenuButton = function() {
  var renderer = goog.ui.Css3MenuButtonRenderer.getInstance();
  renderer.CSS_CLASS = goog.getCssName('flat-button');
  return renderer;
};

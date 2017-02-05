goog.provide('bad.CssClassMap');
goog.provide('bad.CssPrefix');

/**
 * @type {{PANEL: string, LAYOUT: string}}
 */
bad.CssPrefix = {
  PANEL: 'pan',
  LAYOUT: 'layout'
};

/**
 * An enumerator to the HTML element class names.
 * @enum {string}
 */
bad.CssClassMap = {
  PANEL_WRAPPER: goog.getCssName(bad.CssPrefix.PANEL, 'wrapper')
};

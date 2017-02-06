goog.provide('bad.ui.button');

goog.require('bad.utils');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.ui.Component');
goog.require('goog.ui.ContainerRenderer');
goog.require('goog.ui.ControlRenderer');
goog.require('goog.ui.Css3ButtonRenderer');
goog.require('goog.ui.Css3MenuButtonRenderer');
goog.require('goog.ui.CustomButton');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuButton');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.MenuItemRenderer');
goog.require('goog.ui.MenuRenderer');
goog.require('goog.ui.MenuSeparator');
goog.require('goog.ui.ToggleButton');


/**
 * @return {!goog.ui.Css3ButtonRenderer}
 */
bad.ui.button.getBasicButtonRenderer = function() {
  return /**@type {!goog.ui.Css3ButtonRenderer} */ (
      goog.ui.ControlRenderer.getCustomRenderer(
          goog.ui.Css3ButtonRenderer, 'ignore-this-class'));
};


/**
 * @return {!goog.ui.Css3ButtonRenderer}
 */
bad.ui.button.getFlatButtonRenderer = function() {
  return /**@type {!goog.ui.Css3ButtonRenderer} */ (
      goog.ui.ControlRenderer.getCustomRenderer(
          goog.ui.Css3ButtonRenderer, 'flat-button'));
};


/**
 * @return {!goog.ui.Css3MenuButtonRenderer}
 */
bad.ui.button.getMenuButtonRenderer = function() {
  return /**@type {!goog.ui.Css3MenuButtonRenderer} */ (
      goog.ui.ControlRenderer.getCustomRenderer(
          goog.ui.Css3MenuButtonRenderer, 'flat-button'));
};


/**
 * Make a default button.
 * @param {string} elId The element id that will be decorated.
 * @param {!goog.ui.Component|undefined} parent The button's parent.
 * @param {?Function=} opt_callback The callback function to execute on
 *      button action.
 * @param {?goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @return {!goog.ui.CustomButton|undefined}
 */
bad.ui.button.makeButton = function(elId, parent, opt_callback, opt_domHelper) {

  const el = goog.dom.getElement(elId);
  let button;

  if (el) {
    button = /** @type {!goog.ui.CustomButton} */ (bad.ui.button.makeButton_(
        goog.ui.CustomButton, el, parent, opt_callback, opt_domHelper));
  }
  return button;
};


/**
 * Make a toggle button.
 * @param {!string} elId The element id that will be decorated.
 * @param {!goog.ui.Component|undefined} parent The button's parent.
 * @param {?Function=} opt_callback The callback function to execute on
 *      button action.
 * @param {?goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @return {!goog.ui.ToggleButton|undefined}
 */
bad.ui.button.makeToggleButton = function(
    elId, parent, opt_callback, opt_domHelper) {

  const el = goog.dom.getElement(elId);
  let button;

  if (el) {
    button = /** @type {!goog.ui.ToggleButton} */ (bad.ui.button.makeButton_(
        goog.ui.ToggleButton, el, parent, opt_callback, opt_domHelper));
  }

  return button;
};


/**
 * Make a toggle button.
 * @param {!Function} constructor A button constructor.
 * @param {!Element} el The element id that will be decorated.
 * @param {!goog.ui.Component|undefined} parent The button's parent.
 * @param {?Function=} opt_callback The callback function to execute on
 *      button action.
 * @param {?goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @return {!goog.ui.ToggleButton|!goog.ui.CustomButton}
 * @private
 */
bad.ui.button.makeButton_ = function(
    constructor, el, parent, opt_callback, opt_domHelper) {

  var renderer = bad.ui.button.getBasicButtonRenderer();
  /**
   * @type {!goog.ui.ToggleButton|!goog.ui.CustomButton}
   */
  const button = new constructor('', renderer, opt_domHelper);
  button.setSupportedState(goog.ui.Component.State.FOCUSED, false);

  if (parent) {
    parent.addChild(button, false);
    button.decorate(el);
  } else {
    button.decorate(el);
  }

  let cb = opt_callback;
  if (goog.isDefAndNotNull(cb)) {
    cb = /** @type {!Function} */ (cb);

    button.listen(goog.ui.Component.EventType.ACTION, function() {
      if (goog.isDefAndNotNull(button.isChecked)) {
        cb(button.isChecked());
      } else {
        cb();
      }
    }, false, button);
  }
  return button;
};


/**
 * Make a menu button.
 * @param {!string} elId The element id that will be decorated.
 * @param {!Array} menuItems An array of arrays.
 * @param {!goog.dom.DomHelper} domHelper DOM helper.domHelper.
 * @param {!goog.events.EventHandler} handler The event handler for the panel.
 * @param {!goog.ui.Component} scope The panel scope that the
 *    events will fire in.
 * @param {boolean=} opt_sticky If true, the menu marks the last selected item.
 * @param {string=} opt_cssClass A CSS Class name to use for the renderer.
 *    Defaults to: 'flat-menu', and the library has a built in 'floating-menu'
 *    version. Anything else the implementing application should define in CSS.
 * @return {!goog.ui.MenuButton|undefined}
 */
bad.ui.button.makeMenuButton = function(
    elId, menuItems, domHelper, handler, scope, opt_sticky, opt_cssClass) {

  var el = goog.dom.getElement(elId);
  var button;
  var cssClassName = opt_cssClass ? opt_cssClass : 'flat-menu';

  if (el) {
    var menuRenderer = /** @type {!goog.ui.MenuRenderer} */ (
        goog.ui.ContainerRenderer.getCustomRenderer(
            goog.ui.MenuRenderer, cssClassName));

    var itemRenderer = /** @type {!goog.ui.MenuItemRenderer} */ (
        goog.ui.ControlRenderer.getCustomRenderer(
            goog.ui.MenuItemRenderer, 'flat-menuitem'));

    var menu = bad.ui.button.makeMenu(
        menuItems, domHelper, handler, scope, menuRenderer, itemRenderer,
        opt_sticky);

    // Menu Button
    button = new goog.ui.MenuButton(
        '', menu, bad.ui.button.getMenuButtonRenderer(), domHelper);
    button.decorate(el);
  }
  return button;
};


/**
 * Given an array of items, return a menu
 * @param {!Array} menuItems An array of arrays.
 * @param {!goog.dom.DomHelper} domHelper DOM helper.domHelper.
 * @param {!goog.events.EventHandler} handler The event handler for the panel.
 * @param {!goog.ui.Component} scope The component scope that the
 *    events will fire in.
 * @param {!goog.ui.MenuRenderer=} opt_menuRend
 * @param {!goog.ui.MenuItemRenderer=} opt_itemRend
 * @param {boolean=} opt_sticky
 * @return {!goog.ui.Menu}
 */
bad.ui.button.makeMenu = function(
    menuItems, domHelper, handler, scope, opt_menuRend, opt_itemRend,
    opt_sticky) {

  var menu = new goog.ui.Menu(domHelper, opt_menuRend);
  menu.addListItem = function(arr) {
    var item;
    if (arr[0]) {
      /**
       * @type {!Element}
       */
      var name = bad.utils.getIconString(arr[0], arr[1]);
      item = new goog.ui.MenuItem(name, arr[2], domHelper, opt_itemRend);
    } else {
      item = new goog.ui.MenuSeparator(domHelper);
    }
    menu.addChild(item, true);
  };

  goog.array.forEach(
      menuItems, function(arr) { menu.addListItem(arr); }, scope);

  menu.unStickAll = function() {
    menu.forEachChild(function(child) {
      child.removeClassName('flat-menuitem-stickey-select');
    });
  };

  handler.listen(menu, goog.ui.Component.EventType.ACTION, function(e) {
    var activeMenuItem = e.target;
    e.stopPropagation();
    activeMenuItem.getModel()();
    if (opt_sticky) {
      menu.unStickAll();
      activeMenuItem.addClassName('flat-menuitem-stickey-select');
    }
  });
  return menu;
};

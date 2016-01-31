goog.provide('Fuckit');

goog.require('bad.ActionEvent');
goog.require('bad.CssClassMap');
goog.require('bad.CssPrefix');
goog.require('bad.Net');
goog.require('bad.UserManager');
goog.require('bad.math.bit');
goog.require('bad.math.buff');
goog.require('bad.ui.Component');
goog.require('bad.ui.EventType');
goog.require('bad.ui.ExButtonGroup');
goog.require('bad.ui.Form');
goog.require('bad.ui.Layout');
goog.require('bad.ui.Layout.CssClassMap');
goog.require('bad.ui.Layout.IdFragment');
goog.require('bad.ui.MenuFlatRenderer');
goog.require('bad.ui.MenuFloatRenderer');
goog.require('bad.ui.MenuItemRenderer');
goog.require('bad.ui.Panel');
goog.require('bad.ui.Resizable.EventType');
goog.require('bad.ui.View');
goog.require('bad.ui.ViewEvent');
goog.require('bad.ui.flatButtons');
goog.require('bad.utils');

/**
 * @constructor
 */
Fuckit = function() {

  this.allMods = [
    bad.CssClassMap,
    bad.CssPrefix,
    bad.math.bit,
    bad.math.buff,
    bad.Net,
    bad.ui.flatButtons,
    bad.ui.MenuFlatRenderer,
    bad.ui.MenuFloatRenderer,
    bad.ui.MenuItemRenderer,
    bad.ActionEvent,
    bad.ui.Component,
    bad.ui.ExButtonGroup,
    bad.ui.Form,
    bad.ui.Layout,
    bad.ui.Layout.CssClassMap,
    bad.ui.Layout.IdFragment,
    bad.ui.Panel,
    bad.ui.EventType,
    bad.ui.Resizable.EventType,
    bad.ui.View,
    bad.ui.ViewEvent,
    bad.UserManager,
    bad.utils
  ];
};




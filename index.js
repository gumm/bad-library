goog.module('CompilerEntry');

const CompEvent = goog.require('bad.CompEvent');
const Component = goog.require('bad.ui.Component');
const CssClassMap = goog.require('bad.CssClassMap');
const CssPrefix = goog.require('bad.CssPrefix');
const EventType = goog.require('bad.EventType');
const ExButtonGroup = goog.require('bad.ui.ExButtonGroup');
const FieldErrs = goog.require('bad.ui.FieldErrs');
const Form = goog.require('bad.ui.Form');
const Layout = goog.require('bad.ui.Layout');
const LayoutCssClassMap = goog.require('bad.ui.Layout.CssClassMap');
const LayoutIdFragment = goog.require('bad.ui.Layout.IdFragment');
const Panel = goog.require('bad.ui.Panel');
const ResizableEventType = goog.require('bad.ui.Resizable.EventType');
const UserManager = goog.require('bad.UserManager');
const View = goog.require('bad.ui.View');
const ViewEvent = goog.require('bad.ViewEvent');
const bit = goog.require('bad.math.bit');
const buf = goog.require('bad.math.buff');
const button = goog.require('bad.ui.button');
const func = goog.require('bad.func');
const parseShape = goog.require('bad.layout.parseShape');
const shapeNames = goog.require('bad.layout.shapesNames');
const utils = goog.require('bad.utils');

const bad = {
  bit,
  buf,
  CssClassMap,
  CssPrefix,
  CompEvent,
  EventType,
  ResizableEventType,
  ViewEvent,
  Layout,
  LayoutCssClassMap,
  LayoutIdFragment,
  parseShape,
  shapeNames,
  button,
  Component,
  ExButtonGroup,
  FieldErrs,
  Form,
  Panel,
  View,
  UserManager,
  utils,
  func
};

goog.exportSymbol('bad', bad);

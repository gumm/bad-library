goog.module('CompilerEntry');

const A = goog.require('bad.ActionEvent');
const B = goog.require('bad.CssClassMap');
const C = goog.require('bad.CssPrefix');
const D = goog.require('bad.ui.FieldErrs');
const E = goog.require('bad.UserManager');
const F = goog.require('bad.math.bit');
const G = goog.require('bad.math.buff');
const H = goog.require('bad.ui.Component');
const I = goog.require('bad.ui.EventType');
const J = goog.require('bad.ui.ExButtonGroup');
const K = goog.require('bad.ui.Form');
const L = goog.require('bad.ui.Layout');
const M = goog.require('bad.ui.Layout.CssClassMap');
const N = goog.require('bad.ui.Layout.IdFragment');
const O = goog.require('bad.ui.Panel');
const P = goog.require('bad.ui.Resizable.EventType');
const Q = goog.require('bad.ui.View');
const R = goog.require('bad.ui.ViewEventName');
const S = goog.require('bad.ui.button');
const T = goog.require('bad.utils');
const U = goog.require('ViewEvent');
const parseShape = goog.require('bad.layout.parseShape');




/**
 * @return {!Array<*>}
 */
exports.enter = function() {

  return [
    parseShape,
    A,
    B,
    C,
    E,
    F,
    G,
    H,
    I,
    J,
    K,
    L,
    M,
    N,
    O,
    P,
    Q,
    R,
    S,
    T,
    D,
    U
  ];
};




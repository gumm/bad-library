goog.provide('bad.ui.Form');

goog.require('bad.ui.Panel');
goog.require('bad.utils');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.forms');
goog.require('goog.events.EventType');
goog.require('goog.object');
goog.require('goog.uri.utils');

/**
 * @param {!string} id The form element id.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @extends {bad.ui.Panel}
 * @constructor
 */
bad.ui.Form = function(id, opt_domHelper) {
  bad.ui.Panel.call(this, opt_domHelper);

  /**
   * @type {!string}
   * @private
   */
  this.formElId_ = id;

  /**
   * @type {?HTMLFormElement}
   * @private
   */
  this.form_ = null;

  /**
   * An array of alert messages displayed on the form
   * @type {Array}
   * @private
   */
  this.fieldAlerts_ = [];
};
goog.inherits(bad.ui.Form, bad.ui.Panel);

bad.ui.Form.prototype.enterDocument = function() {
  this.form_ = this.getSterileFormFromId(this.formElId_);
  bad.ui.Form.superClass_.enterDocument.call(this);
};

/**
 * @return {?HTMLFormElement}
 */
bad.ui.Form.prototype.getForm = function() {
  return this.form_;
};

/**
 * Given a form id, get the form, and intercept and sterilise its submit.
 * Forms that passed through here will not be able to be submitted with a
 * normal submit button any more, but built in HTML5 Constraint Validation
 * will still function on the form. This way, we can still have a button with
 * type="submit", which will trigger the validation, and we can submit
 * valid forms with xhrio which allows us to add callbacks to them.
 *
 * @param {string} string The id of the form we want to sterilise.
 * @return {HTMLFormElement}
 */
bad.ui.Form.prototype.getSterileFormFromId = function(string) {
  var form = /** @type {HTMLFormElement} */ (goog.dom.getElement(string));
  if (form) {
    this.getHandler().listen(
      form,
      goog.events.EventType.SUBMIT,
      function(e) {
        e.preventDefault();
      }
    );
  }
  return form;
};

/**
 * Given a form, get the post content string.
 * @param {HTMLFormElement} form The form to get the post content from.
 * @return {string}
 */
bad.ui.Form.prototype.getPostContentFromForm = function(form) {
  return goog.uri.utils.buildQueryDataFromMap(
    goog.dom.forms.getFormDataMap(form).toObject()
  );
};

//----------------------------------------------------------[ Alert Messages ]--

bad.ui.Form.prototype.checkValidation = function() {

  this.clearAlerts();
  var fields = bad.utils.getRawFormElements(this.form_);
  goog.object.forEach(fields, function(field) {
    if (field.willValidate && !field.checkValidity()) {
      this.displayError(field, field.validationMessage);
    }
  }, this);
};

bad.ui.Form.prototype.clearAlerts = function() {
  goog.object.forEach(this.form_.elements, function(field) {
    goog.dom.classes.remove(field, 'error');
  }, this);
  while (this.fieldAlerts_.length > 0) {
    goog.dom.removeNode(this.fieldAlerts_.pop());
  }
};

/**
 * The standard reply object has an error field. For forms, this field is
 * filled with an object with k:v pairs that correspond to the form field
 * names, and the associated error message.
 * @param {Object|undefined} data A JavaScript object ass passed in by xhrio.
 */
bad.ui.Form.prototype.displayErrors = function(data) {

  /**
   * @type {HTMLCollection}
   */
  var fields = this.form_.elements;
  console.debug('THIS IS THE TYPE OF ERROR:--->', goog.typeOf(data['error']));

  if (goog.typeOf(data['error']) === 'object') {
    goog.object.forEach(data['error'],
      /**
       * The error message and the name of the field it belongs to.
       * @param {string} message
       * @param {string} name
       */
        function(message, name) {
        /**
         * @type {HTMLElement}
         */
        var field = fields[name];
        if (message && field) {
          this.displayError(field, message);
        }
      },
      this);
  } else {
    console.error(data['error']);
  }
};

/**
 * Display the given error message on the given form field.
 * @param {HTMLElement} field
 * @param {string} message
 */
bad.ui.Form.prototype.displayError = function(field, message) {
  goog.dom.classes.add(field, 'error');
  this.displayAlert(field, message,
    'alert-error', null, 'icon-remove-sign');
};

/**
 * Display the given success message on the given form field.
 * @param {HTMLElement} field
 * @param {string} message
 */
bad.ui.Form.prototype.displaySuccess = function(field, message) {
  this.displayAlert(field, message,
    'alert-success', null, 'icon-ok-sign');
};

/**
 * Display the given information message on the given form field.
 * @param {HTMLElement} field
 * @param {string} message
 */
bad.ui.Form.prototype.displayInfo = function(field, message) {
  this.displayAlert(field, message,
    'alert-info', null, 'icon-info-sign');
};

/**
 * Format the message dom object and insert it into the DOM
 * @param {HTMLElement} field The field after which the alert will be inserted.
 * @param {string} message The message in the alert.
 * @param {string} css A CSS class name to add to the alert div.
 * @param {?string=} opt_itr An optional intro string to add before the message.
 *      This will be formatted bold.
 * @param {?string=} opt_icon An optional icon to add to the alert.
 */
bad.ui.Form.prototype.displayAlert =
  function(field, message, css, opt_itr, opt_icon) {
    var icon = opt_icon ? goog.dom.createDom('i', opt_icon, ' ') : '';
    var intro = opt_itr ? goog.dom.createDom('strong', {}, opt_itr + ' ') : '';
    var alertDom = goog.dom.createDom('div', 'alert ' + css,
      icon, intro, message);
    goog.dom.insertSiblingAfter(alertDom, field);
    this.fieldAlerts_.push(alertDom);
  };

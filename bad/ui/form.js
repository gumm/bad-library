goog.provide('bad.ui.FieldErrs');
goog.provide('bad.ui.Form');

goog.require('bad.ui.Panel');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.dom.forms');
goog.require('goog.events.EventType');
goog.require('goog.uri.utils');


/**
 * A class for managing the display of field level messages on a form.
 */
bad.ui.FieldErrs = class {
  constructor() { this.fMap = new Map(); }

  /**
   * Format the message dom object and insert it into the DOM
   * @param {!HTMLInputElement} field The field after which the
   *    alert will be inserted.
   * @param {!string} msg The message in the alert.
   * @param {!string} css A CSS class name to add to the alert div.
   *      This will be formatted bold.
   */
  displayAlert(field, msg, css) {
    const alertDom =
        goog.dom.createDom('p', 'mdc-textfield-helptext ' + css, msg);
    let parent = goog.dom.getParentElement(field);
    goog.dom.insertSiblingAfter(alertDom, parent);
    this.fMap.set(field, alertDom);
  };

  /**
   * @param {!HTMLInputElement} field
   */
  checkValidationForField(field) {
    this.clearAlertOnField(field);
    field.willValidate && field.checkValidity();
  };

  /**
   * @param {!HTMLInputElement} field
   */
  clearAlertOnField(field) {
    goog.dom.classlist.remove(field, 'error');
    goog.dom.removeNode(this.fMap.get(field));
    this.fMap.delete(field);
  };

  /**
   * Display the given error message on the given form field.
   * @param {!HTMLInputElement} field
   * @param {!string=} opt_msg
   */
  displayError(field, opt_msg) {
    let message = opt_msg || field.validationMessage;
    goog.dom.classlist.add(field, 'error');
    this.displayAlert(field, message, 'alert-error');
  };

  /**
   * Display the given success message on the given form field.
   * @param {!HTMLInputElement} field
   * @param {!string} message
   */
  displaySuccess(field, message) {
    this.displayAlert(field, message, 'alert-success');
  };

  /**
   * Display the given information message on the given form field.
   * @param {!HTMLInputElement} field
   * @param {!string} message
   */
  displayInfo(field, message) {
    this.displayAlert(field, message, 'alert-info');
  };

  /**
   * @param {!Event} e
   */
  validateOnChange(e) {
    this.checkValidationForField(/** @type {!HTMLInputElement} */ (e.target));
  }
};


/**
 * @param {!string=} opt_id The form element id.
 * @param {?goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @extends {bad.ui.Panel}
 * @constructor
 */
bad.ui.Form = function(opt_id, opt_domHelper) {
  bad.ui.Panel.call(this, opt_domHelper);

  /**
   * @type {!string}
   * @private
   */
  this.formElId_ = opt_id || '';

  /**
   * @type {?HTMLFormElement}
   * @private
   */
  this.form_ = null;

  /**
   * @type {!bad.ui.FieldErrs}
   * @private
   */
  this.fieldErr_ = new bad.ui.FieldErrs();

  /**
   * @type {!function(!bad.ui.Form):(?|null|Promise<?>)}
   */
  this.onSubmitSucFunc = panel => null;

};
goog.inherits(bad.ui.Form, bad.ui.Panel);


/**
 * @inheritDoc
 */
bad.ui.Form.prototype.enterDocument = function() {
  this.formIdElementToForm_();
  bad.ui.Form.superClass_.enterDocument.call(this);
};


/**
 * @private
 */
bad.ui.Form.prototype.formIdElementToForm_ = function() {
  this.form_ = this.getFormFromId(this.formElId_);
  if (this.form_) {
    this.interceptFormSubmit(this.form_);
    this.form_.addEventListener(
        'change', e => {this.fieldErr_.validateOnChange(e)}, false);
    this.form_.addEventListener('invalid', e => {
      e.preventDefault();
      const field = /** @type {!HTMLInputElement} */ (e.target);
      this.fieldErr_.clearAlertOnField(field);
      this.fieldErr_.displayError(field);
    }, true);
  }
};


/**
 * @param {!string} string The id of the form we want to sterilise.
 * @return {?HTMLFormElement}
 */
bad.ui.Form.prototype.getFormFromId = function(string) {
  let form = null;
  const el =
      goog.dom.getElement(string) || this.getElement().querySelector('form');
  if (el && el.tagName == goog.dom.TagName.FORM) {
    form = /** @type {!HTMLFormElement} */ (el);
  }
  return form;
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
 * @param {?HTMLFormElement} form The form we want to sterilise.
 * @return {?HTMLFormElement}
 */
bad.ui.Form.prototype.interceptFormSubmit = function(form) {
  const user = this.getUser();
  this.listenToThis(form, goog.events.EventType.SUBMIT, goog.bind(function(e) {
    e.preventDefault();
    user && user.formSubmit(this);
  }, this));
  return form;
};


/**
 * Get the post content of this form as a content string.
 * @return {!Object}
 */
bad.ui.Form.prototype.getFormDataMapObject = function() {
  return goog.dom.forms.getFormDataMap(this.form_).toObject();
};


/**
 * Get the post content of this form as a content string.
 * @return {string}
 */
bad.ui.Form.prototype.getPostContentFromForm = function() {
  return goog.uri.utils.buildQueryDataFromMap(this.getFormDataMapObject());
};


//----------------------------------------------------------[ Alert Messages ]--
/**
 * @param {!Object} obj
 */
bad.ui.Form.prototype.showErrs = function(obj) {
  const f = this.getForm();
  const err = goog.bind(this.fieldErr_.displayError, this.fieldErr_);
  Object.keys(obj).forEach(k => {
    if (k === 'non_field_errors') {
      err(f, obj[k].reduce((p, c) => `${p}${p == '' ? c : '\n' + c}`, ''));
    }
  });
};


/**
 * Clear all existing errors
 */
bad.ui.Form.prototype.clearErrs = function() {
  let fields = this.form_ ? this.form_.elements : [];
  Array
      .from(
          /** @type {!HTMLFormControlsCollection<!HTMLElement>} */ (fields))
      .forEach(field => this.fieldErr_.clearAlertOnField(field));

  let nonFieldErrs = goog.dom.getElementByClass(
      'zform_alert__non-field-errors', this.getElement());
  nonFieldErrs && goog.dom.removeNode(nonFieldErrs);
};


//--------------------------------------------------------------[ Round Trip ]--
/**
 * @param {!function(!bad.ui.Form):(?|null|Promise<?>)} func
 */
bad.ui.Form.prototype.onSubmitSuccess = function(func) {
  this.onSubmitSucFunc = func;
};

/**
 * Given a 'fetch' reply, replace the form.
 * This simply replaced the form element with what came back from the server
 * and re-reads the scripts.
 * @param {!string} reply
 */
bad.ui.Form.prototype.replaceForm = function(reply) {

  this.responseObject = splitScripts(reply);
  if (this.responseObject.html) {
    if (this.redirected) {
      const el = this.getElement();
      // Replace the whole innards of the panel.
      el.replaceChild(this.responseObject.html, el.firstElementChild);
    } else {
      // Just replace the form component.
      let newForm = goog.dom.getElementsByTagName(
          goog.dom.TagName.FORM,
          /** @type {!Element} */ (this.responseObject.html))[0];
      goog.dom.replaceNode(newForm, this.form_);
    }
    this.enterDocument();
  }
  if (this.responseObject.scripts) {
    this.evalScripts(this.responseObject.scripts);
  }

};


/**
 * Expects HTML data from a call to the back.
 * @return {!Promise} Returns a promise with this panel as value.
 */
bad.ui.Form.prototype.refreshFromFromServer = function() {
  const usr = this.getUser();
  const uri = this.getUri();
  if (usr) {
    return usr.fetch(uri).then(s => this.replaceForm(s));
  } else {
    return Promise.reject('No user')
  }
};


/**
 * @param {!string} reply
 * @return {!Promise}
 */
bad.ui.Form.prototype.processSubmitReply = function(reply) {

  this.clearErrs();
  let success = false;

  if (reply === 'success') {
    success = true;
  } else if (reply === 'redirected_success\n') {
    success = true;
    this.redirected = false;
  } else {
    this.replaceForm(reply);
    let hasErrors = goog.dom.getElementsByClass('alert-error', this.form_);
    success = !hasErrors.length
  }

  if (success && this.redirected) {
    // Just return the promise - we are not done yet.
    this.redirected = false;
    return Promise.resolve(this);
  } else if (success) {
    return Promise.resolve(this).then(p => {
      this.onSubmitSucFunc(this);
      this.dispatchCompEvent(bad.EventType.FORM_SUBMIT_SUCCESS);
    });
  } else {
    return Promise.reject('Form has errors');
  }
};

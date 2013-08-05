goog.provide('bad.ui.Form');

goog.require('bad.ui.Panel');
goog.require('goog.dom.forms');

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
    var fields = this.form_.elements;
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

bad.ui.Form.prototype.displayErrors = function(data) {
    var fields = this.form_.elements;
    goog.object.forEach(data.error, function(message, name) {
        var field = fields[name];
        if (message) {
            this.displayError(field, message);
        }
    }, this);
};

bad.ui.Form.prototype.displayError = function(field, message) {
    goog.dom.classes.add(field, 'error');
    this.displayAlert(field, message,
        'alert-error', null, 'icon-remove-sign');
};

bad.ui.Form.prototype.displaySuccess = function(field, message) {
    this.displayAlert(field, message,
        'alert-success', null, 'icon-ok-sign');
};

bad.ui.Form.prototype.displayInfo = function(field, message) {
    this.displayAlert(field, message,
        'alert-info', null, 'icon-info-sign');
};

bad.ui.Form.prototype.displayAlert = function(
        field, message, css, opt_itr, opt_icon) {

    var icon = opt_icon ? goog.dom.createDom('i', opt_icon, ' ') : '';
    var intro = opt_itr ? goog.dom.createDom('strong', {}, opt_itr + ' ') : '';
    var alertDom = goog.dom.createDom('div', 'alert ' + css,
        icon, intro, message);
    goog.dom.insertSiblingAfter(alertDom, field);
    this.fieldAlerts_.push(alertDom);
};

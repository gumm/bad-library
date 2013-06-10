goog.provide('bad.ui.Form');

goog.require('bad.ui.Component');
goog.require('goog.dom.forms');
goog.require('goog.uri.utils');

/**
 * @param {!string} id
 * @param {!goog.Uri} uri
 * @param {Object} targetNest
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @extends {bad.ui.Component}
 * @constructor
 */
bad.ui.Form = function(id, uri, targetNest, opt_domHelper) {
    bad.ui.Component.call(this, opt_domHelper);

    /**
     * @type {!string}
     * @private
     */
    this.id_ = id;

    /**
     * @type {!goog.Uri}
     * @private
     */
    this.uri_ = uri;

    /**
     * @type {Object}
     * @private
     */
    this.nest_ = targetNest;
};
goog.inherits(bad.ui.Form, bad.ui.Component);

bad.ui.Form.prototype.getNest = function() {
    return this.nest_;
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

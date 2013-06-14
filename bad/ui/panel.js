goog.provide('bad.ui.Panel');

goog.require('bad.ui.Component');
goog.require('goog.uri.utils');

/**
 * @param {!goog.Uri} uri
 * @param {Object} targetNest
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @extends {bad.ui.Component}
 * @constructor
 */
bad.ui.Panel = function(uri, targetNest, opt_domHelper) {
    bad.ui.Component.call(this, opt_domHelper);

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
goog.inherits(bad.ui.Panel, bad.ui.Component);

bad.ui.Panel.prototype.renderWithTemplate = function() {
    this.xMan.get(
        this.uri_,
        goog.bind(this.onRenderWithTemplateReply_, this));
};

bad.ui.Panel.prototype.onRenderWithTemplateReply_ = function(e) {
    var xhr = e.target;
    this.e = /** @type {Element} */ (goog.dom.htmlToDocumentFragment(
        xhr.getResponseText())
    );
    this.render(this.nest_.element);
};

bad.ui.Panel.prototype.createDom = function() {
    bad.ui.Panel.superClass_.createDom.call(this);
    this.element_ = goog.dom.createDom(
        goog.dom.TagName.DIV,
        bad.CssClassMap.PANEL_WRAPPER,
        this.e
    );
};

bad.ui.Panel.prototype.getNest = function() {
    return this.nest_;
};

/**
 * @param {bad.Net} xMan
 */
bad.ui.Panel.prototype.setXMan = function(xMan) {
    this.xMan = xMan;
};

/**
 * @return {bad.Net} xMan
 */
bad.ui.Panel.prototype.getXMan = function() {
    return this.xMan;
};

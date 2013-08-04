goog.provide('bad.ui.Panel');

goog.require('bad.ui.Component');
goog.require('goog.uri.utils');

/**
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @extends {bad.ui.Component}
 * @constructor
 */
bad.ui.Panel = function(opt_domHelper) {
    bad.ui.Component.call(this, opt_domHelper);

    /**
     * @type {goog.Uri}
     * @private
     */
    this.uri_ = null;

    /**
     * @type {Object}
     * @private
     */
    this.nest_ = null;

    this.responseObject = {
        html: '',
        scripts: ''
    };
};
goog.inherits(bad.ui.Panel, bad.ui.Component);

bad.ui.Panel.prototype.renderWithTemplate = function() {
    this.xMan.get(
        this.uri_,
        goog.bind(this.onRenderWithTemplateReply_, this));
};

bad.ui.Panel.prototype.onRenderWithTemplateReply_ = function(e) {
    var xhr = e.target;
    this.responseObject = this.splitScripts(xhr.getResponseText());
    this.render();
};

bad.ui.Panel.prototype.createDom = function() {
    bad.ui.Panel.superClass_.createDom.call(this);
    this.setElementInternal(goog.dom.createDom(
        goog.dom.TagName.DIV,
        bad.CssClassMap.PANEL_WRAPPER,
        this.responseObject.html
    ));
    this.evalScripts_();
};

/**
 * @param {Object} nest
 */
bad.ui.Panel.prototype.setNestAsTarget = function(nest) {
    this.nest_ = nest;
    this.setTarget(this.nest_.element);
};

/**
 * @param {bad.Net} xMan
 */
bad.ui.Panel.prototype.setXMan = function(xMan) {
    this.xMan = xMan;
};

/**
 * @return {bad.Net} xMan.
 */
bad.ui.Panel.prototype.getXMan = function() {
    return this.xMan;
};

/**
 * @param {goog.Uri} uri
 */
bad.ui.Panel.prototype.setUri = function(uri) {
    this.uri_ = uri;
};

/**
 * @return {goog.Uri}
 */
bad.ui.Panel.prototype.getUri = function() {
    return this.uri_;
};

/**
 * @param {Object} user
 */
bad.ui.Panel.prototype.setUser = function(user) {
    this.user_ = user;
};

/**
 * @return {Object}
 */
bad.ui.Panel.prototype.getUser = function() {
    return this.user_;
};

//------------------------------------------------------------[ Ajax Control ]--

/**
 * A function to split scripts out of an HTML response string.
 * @param {string} data The original HTML string returned from the server.
 * @return {Object} An object literal with two key value pairs:
 *  html: The the scrubbed HTML string - without any <script> tags.
 *  scripts: An array with the script nodes that was removed from the response,
 *  in order that they were found.
 */
bad.ui.Panel.prototype.splitScripts = function(data) {
    var response = {};
    var sourceHtml = goog.dom.htmlToDocumentFragment(data);
    response.scripts = [];

    var scriptNodes = goog.dom.findNodes(sourceHtml, function(node) {
        return (node.tagName === 'SCRIPT');
    });

    goog.array.forEach(scriptNodes, function(script) {
        response.scripts.push(script);
    }, this);

    response.html = this.splitScripts_(sourceHtml);
    return response;
};

/**
 * A helper function to remove the script tags from the given document fragment.
 * @param {Object} documentFragment A valid HTML document fragment.
 * @return {Object} The same document fragment but with scripts removed.
 */
bad.ui.Panel.prototype.splitScripts_ = function(documentFragment) {
    var temp = goog.dom.getDocument().createElement(goog.dom.TagName.DIV);

    while (documentFragment.firstChild) {
        temp.appendChild(documentFragment.firstChild);
    }
    var scripts = temp.getElementsByTagName(goog.dom.TagName.SCRIPT);

    var length = scripts.length;
    while (length--) {
        scripts[length].parentNode.removeChild(scripts[length]);
    }
    // Add elements back to fragment:
    while (temp.firstChild) {
        documentFragment.appendChild(temp.firstChild);
    }
    return documentFragment;
};

/**
 * Evaluates each of the scripts in the ajaxScriptsStrings_ map in turn.
 * The scripts are evaluated in the scope of this panel.
 */
bad.ui.Panel.prototype.evalScripts_ = function() {
    goog.array.forEach(this.responseObject.scripts, function(script) {
        goog.bind(function() {
            eval(script.text);
        }, this)();
    }, this);
};
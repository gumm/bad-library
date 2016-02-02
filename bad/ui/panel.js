goog.provide('bad.ui.Panel');

goog.require('bad.CssClassMap');
goog.require('bad.ui.Component');
goog.require('goog.Uri');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');



/**
 * @param {?goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @extends {bad.ui.Component}
 * @constructor
 */
bad.ui.Panel = function(opt_domHelper) {
  bad.ui.Component.call(this, opt_domHelper);

  /**
   * @type {!goog.Uri}
   * @private
   */
  this.uri_ = new goog.Uri();

  /**
   * @type {?Object}
   * @private
   */
  this.nest_ = null;

  /**
   * @type {!number}
   * @private
   */
  this.defaultSlideSize_ = 350;

  /**
   * An array of classes to be added to the panel element when it is created.
   * @type {!Array}
   * @private
   */
  this.elementClasses_ = [];

  this.responseObject = {
    html: '',
    scripts: ''
  };
};
goog.inherits(bad.ui.Panel, bad.ui.Component);


/**
 * Sub-classes should override
 */
bad.ui.Panel.prototype.initDom = goog.nullFunction;


/**
 * Expects HTML data from a call to the back.
 */
bad.ui.Panel.prototype.renderWithTemplate = function() {
  this.xMan.get(
      this.uri_,
      goog.bind(this.onRenderWithTemplateReply_, this));
};


/**
 * @param {!goog.events.Event} e Event object.
 * @private
 */
bad.ui.Panel.prototype.onRenderWithTemplateReply_ = function(e) {
  var xhrIo = /** @type {!goog.net.XhrIo} */ (e.target);
  this.responseObject = this.splitScripts(xhrIo.getResponseText());
  this.render();
};


/**
 * Equivalent to the @code{renderWithTemplate} method in that it is guaranteed
 * that a reply from the callback is received before @code{render} is called.
 * @param {!function(?goog.events.EventLike)} callback The callback function
 *      that will receive the reply event.
 */
bad.ui.Panel.prototype.renderWithJSON = function(callback) {
  this.xMan.get(
      this.uri_,
      goog.bind(this.onRenderWithJSON, this, callback));
};


/**
 * On reply from a GET call to the panel URI
 * @param {!function(?goog.events.EventLike)} callback The callback function
 *      that will receive the reply event.
 * @param {?goog.events.EventLike} e Event object.
 */
bad.ui.Panel.prototype.onRenderWithJSON = function(callback, e) {
  callback(e);
  this.render();
};


/**
 * @inheritDoc
 */
bad.ui.Panel.prototype.createDom = function() {
  bad.ui.Panel.superClass_.createDom.call(this);

  var classes = bad.CssClassMap.PANEL_WRAPPER;
  goog.array.forEach(this.elementClasses_, function(className) {
    classes = classes + ' ' + className;
  }, this);

  this.setElementInternal(goog.dom.createDom(
      goog.dom.TagName.DIV,
      classes,
      this.responseObject.html));
};


/**
 * @inheritDoc
 */
bad.ui.Panel.prototype.enterDocument = function() {

  this.dom_ = goog.dom.getDomHelper(this.getElement());
  this.initDom();

  // Calling this last makes sure that the final PANEL-READY event really is
  // dispatched right at the end of all of the enterDocument calls.
  bad.ui.Panel.superClass_.enterDocument.call(this);
  this.evalScripts_();
};


/**
 * @param {!bad.ui.Layout.NestType|undefined} nest
 */
bad.ui.Panel.prototype.setNestAsTarget = function(nest) {
  if (nest) {
    this.nest_ = nest;
    this.setTarget(this.nest_.element);
  }
};


/**
 * @param {!bad.ui.Layout.NestType|undefined} nest
 */
bad.ui.Panel.prototype.setSlideNest = function(nest) {
  if (nest) {
    this.slideNest_ = nest;
  }
};


/**
 * @return {bad.ui.Layout.CellType}
 */
bad.ui.Panel.prototype.getSlideNest = function() {
  return this.slideNest_;
};


/**
 * The size to which the panel opens by default.
 * Given in pixels.
 * @param {!number} size
 */
bad.ui.Panel.prototype.setSlideSize = function(size) {
  this.defaultSlideSize_ = size;
};


/**
 * @return {!number}
 */
bad.ui.Panel.prototype.getSlideSize = function() {
  return this.defaultSlideSize_;
};


/**
 * @param {!bad.Net} xMan
 */
bad.ui.Panel.prototype.setXMan = function(xMan) {
  this.xMan = xMan;
};


/**
 * @return {!bad.Net} xMan.
 */
bad.ui.Panel.prototype.getXMan = function() {
  return this.xMan;
};


/**
 * @param {!goog.Uri} uri
 */
bad.ui.Panel.prototype.setUri = function(uri) {
  this.uri_ = uri;
};


/**
 * @return {!goog.Uri}
 */
bad.ui.Panel.prototype.getUri = function() {
  return this.uri_;
};


/**
 * @param {!bad.UserManager} user
 */
bad.ui.Panel.prototype.setUser = function(user) {
  this.user_ = user;
};


/**
 * @return {?bad.UserManager}
 */
bad.ui.Panel.prototype.getUser = function() {
  return this.user_;
};


/**
 * @param {!string} className
 */
bad.ui.Panel.prototype.addElementClass = function(className) {
  this.elementClasses_.push(className);
};


/**
 * @return {!boolean}
 */
bad.ui.Panel.prototype.isOpen = function() {
  return this.slideNest_.isOpen();
};


//------------------------------------------------------------[ Ajax Control ]--

/**
 * A function to split scripts out of an HTML response string.
 * @param {!string} data The original HTML string returned from the server.
 * @return {!Object} An object literal with two key value pairs:
 *  html: The the scrubbed HTML string - without any <script> tags.
 *  scripts: An array with the script nodes that was removed from the response,
 *  in order that they were found.
 */
bad.ui.Panel.prototype.splitScripts = function(data) {

  var sourceHtml = goog.dom.htmlToDocumentFragment(data);
  var response = {
    scripts: [],
    html: this.splitScripts_(sourceHtml)
  };

  var scriptNodes = goog.dom.findNodes(
      sourceHtml,
      /**
       * @param {?Node} node
       * @return {!boolean}
       */
      function(node) {
        if (goog.dom.isElement(node)) {
          node = /** @type {!Element} */(node);
          return (node.tagName === 'SCRIPT');
        } else {
          return false;
        }
      });

  goog.array.forEach(scriptNodes, function(script) {
    response.scripts.push(script);
  }, this);

  return response;
};


/**
 * A helper function to remove the script tags from the given document fragment.
 * @param {!Node} documentFragment A valid HTML document fragment.
 * @return {!Node} The same document fragment but with scripts removed.
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

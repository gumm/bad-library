goog.provide('bad.ui.View');

goog.require('bad.ui.EventType');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.object');

/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
bad.ui.View = function() {
  goog.events.EventTarget.call(this);

  /**
   * @type {bad.Net}
   */
  this.xMan_ = null;

  /**
   * @type {bad.ui.Layout}
   * @private
   */
  this.layout_ = null;

  /**
   * @type {Object.<string, bad.ui.Panel>}
   */
  this.panelMap = {};
};
goog.inherits(bad.ui.View, goog.events.EventTarget);

/**
 * Returns the event handler for this component, lazily created the first time
 * this method is called.
 * @return {!goog.events.EventHandler} Event handler for this component.
 * @protected
 */
bad.ui.View.prototype.getHandler = function() {
  return this.googUiComponentHandler_ ||
    (this.googUiComponentHandler_ = new goog.events.EventHandler(this));
};

/**
 * Render each of the panels in this view.
 */
bad.ui.View.prototype.render = function() {
  this.preRender();
};

bad.ui.View.prototype.preRender = function() {
  this.renderInternal();
};

bad.ui.View.prototype.renderInternal = function() {
  this.configurePanels();
  this.displayPanels();
  this.postRender();
};

bad.ui.View.prototype.dispose = function() {
  if (this.googUiComponentHandler_) {
    this.googUiComponentHandler_.dispose();
    delete this.googUiComponentHandler_;
  }

  goog.object.forEach(this.panelMap, function(panel, uid) {
    console.debug('Dispose panel: ', uid, '-->', panel);
    panel.dispose();
  }, this);
};

/**
 * Add a panel as a child of the view.
 * @param {string} name The name of the panel - used as a key in the panel map.
 * @param {bad.ui.Panel} panel The panel itself.
 */
bad.ui.View.prototype.addPanelToView = function(name, panel) {
  if (this.panelMap[name]) {
    this.panelMap[name].dispose();
  }
  panel.setXMan(this.getXMan());
  this.panelMap[name] = panel;
  this.initListenersForPanel_(panel);
};

/**
 * Initiates a listener for panel action events on the panel.
 * @param {bad.ui.Panel} panel The panel to listen to.
 * @private
 */
bad.ui.View.prototype.initListenersForPanel_ = function(panel) {
  this.getHandler().listen(
    panel,
    bad.ui.EventType.ACTION,
    goog.bind(this.onPanelAction, this)
  );
};

/**
 * This dispatches a special event that the controlling app listens for.
 * The data of the event is an object with two k:v pairs, being a method, and
 * optionally a single parameter object. This allows the view to ask the
 * app to do something without having direct access to the app object.
 *
 * @param {string} view The target view that the site should change to.
 * @param {?(Object|string)=} opt_data An optional payload to include in the
 *      event.
 */
bad.ui.View.prototype.appDo = function(view, opt_data) {
  var data = {method: view, param: opt_data || null};
  this.dispatchEvent({
      type: bad.ui.EventType.APP_DO,
      data: data
    }
  );
};

bad.ui.View.prototype.postRender = goog.nullFunction;

bad.ui.View.prototype.configurePanels = goog.nullFunction;

bad.ui.View.prototype.displayPanels = goog.nullFunction;

bad.ui.View.prototype.onPanelAction = goog.nullFunction;

/**
 * @param {bad.ui.Layout} layout
 */
bad.ui.View.prototype.setLayout = function(layout) {
  this.layout_ = layout;
};

/**
 * @return {bad.ui.Layout}
 */
bad.ui.View.prototype.getLayout = function() {
  return this.layout_;
};

/**
 * @param {bad.Net} xMan
 */
bad.ui.View.prototype.setXMan = function(xMan) {
  this.xMan_ = xMan;
};

/**
 * @return {bad.Net}
 */
bad.ui.View.prototype.getXMan = function() {
  return this.xMan_;
};

/**
 * @param {Object} user
 */
bad.ui.View.prototype.setUser = function(user) {
  this.user_ = user;

  // Steps through each of the panels and makes sure their user is set
  // to the same.
  goog.object.forEach(this.panelMap, function(panel) {
    panel.setUser(user);
  }, this);
};

/**
 * @return {Object}
 */
bad.ui.View.prototype.getUser = function() {
  return this.user_;
};

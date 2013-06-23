goog.provide('bad.ui.View');

goog.require('goog.events.EventTarget');

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

    goog.object.forEach(this.panelMap, function(panel) {
        panel.disposeInternal();
    }, this);
};

bad.ui.View.prototype.addPanelToView = function(name, panel) {
    if (this.panelMap[name]) {
        this.panelMap[name].dispose();
    }
    panel.setXMan(this.getXMan());
    this.panelMap[name] = panel;
    this.initListenersForPanel_(panel);
};

bad.ui.View.prototype.initListenersForPanel_ = function(panel) {
    this.getHandler().listen(
        panel,
        bad.ui.EventType.PANEL_ACTION,
        goog.bind(this.onPanelAction, this)
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
};

/**
 * @return {Object}
 */
bad.ui.View.prototype.getUser = function() {
    return this.user_;
};

goog.provide('bad.ui.View');

goog.require('goog.events.EventHandler');

/**
 * @constructor
 * @extends {goog.events.EventHandler}
 */
bad.ui.View = function() {
    goog.events.EventHandler.call(this, this);

    /**
     * @type {bad.Net}
     */
    this.xMan_ = undefined;

    /**
     * @type {bad.ui.Layout}
     * @private
     */
    this.layout_ = undefined;

    /**
     * @type {Object.<string, bad.ui.Panel>}
     */
    this.panelMap = {};
};
goog.inherits(bad.ui.View, goog.events.EventHandler);

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
    goog.object.forEach(this.panelMap, function(panel) {
        panel.dispose();
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
    this.listen(
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
 * @returns {bad.ui.Layout}
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
 * @returns {bad.Net}
 */
bad.ui.View.prototype.getXMan = function() {
    return this.xMan_;
};
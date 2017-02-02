goog.provide('ViewEvent');
goog.provide('bad.ui.View');
goog.provide('bad.ui.ViewEventName');

goog.require('bad.ui.EventType');
goog.require('bad.utils');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');


//-------------------------------------------------------------[ View Events ]--
/**
 * @type {!string}
 */
bad.ui.ViewEventName = bad.utils.privateRandom();

/**
 * Object representing bad.ui.ViewEvent event.
 *
 * @param {!bad.ui.View} target The view that dispatched the event.
 * @param {!string} value Secondary event value.
 * @param {(string|number|?Object)=} opt_data Optional data to include
 *    in the event.
 * @extends {goog.events.Event}
 * @constructor
 */
ViewEvent = function(target, value, opt_data) {
  goog.events.Event.call(this, bad.ui.ViewEventName, target);

  /**
   * @type {!string}
   * @private
   */
  this.value_ = value;

  /**
   * @type {(string|number|?Object)}
   * @private
   */
  this.data_ = opt_data || {};
};
goog.inherits(ViewEvent, goog.events.Event);

/**
 * @return {!string}
 */
ViewEvent.prototype.getValue = function() {
  return this.value_;
};


/**
 * @return {(string|number|?Object)}
 */
ViewEvent.prototype.getData = function() {
  return this.data_;
};



//--------------------------------------------------------------------[ View ]--
/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
bad.ui.View = function() {
  goog.events.EventTarget.call(this);

  /**
   * @type {!Map<*, !bad.ui.Panel>}
   */
  this.panelMap = new Map();

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


/**
 * Run before the render.
 */
bad.ui.View.prototype.preRender = function() {
  this.renderInternal();
};


/**
 * Render.
 */
bad.ui.View.prototype.renderInternal = function() {
  this.configurePanels();
  this.displayPanels();
  this.postRender();
};


/**
 * @inheritDoc
 */
bad.ui.View.prototype.dispose = function() {
  if (this.googUiComponentHandler_) {
    this.googUiComponentHandler_.dispose();
    delete this.googUiComponentHandler_;
  }

  this.panelMap.forEach(panel => panel.dispose());
};


/**
 * Add a panel as a child of the view.
 * @param {!string} name The name of the panel - used as a key in the panel map.
 * @param {!bad.ui.Panel} panel The panel itself.
 */
bad.ui.View.prototype.addPanelToView = function(name, panel) {

  this.panelMap.has(name) && this.panelMap.get(name).dispose();
  this.panelMap.set(name, panel);
  this.initListenersForPanel_(panel);
};


/**
 * @param {*} name
 * @return {!bad.ui.Panel|undefined}
 */
bad.ui.View.prototype.getPanelByName = function(name) {
  return this.panelMap.get(name);
};


/**
 * Initiates a listener for panel action events on the panel.
 * @param {!bad.ui.Panel} panel The panel to listen to.
 * @private
 */
bad.ui.View.prototype.initListenersForPanel_ = function(panel) {
  this.getHandler().listen(
      panel, bad.ui.EventType.ACTION, goog.bind(this.onPanelAction, this));
};


/**
 * Placeholder for post render functionality.
 */
bad.ui.View.prototype.postRender = goog.nullFunction;


/**
 * Placeholder for panel configuration functionality;
 */
bad.ui.View.prototype.configurePanels = goog.nullFunction;


/**
 * Placeholder for panel display functionality;
 */
bad.ui.View.prototype.displayPanels = goog.nullFunction;


/**
 * @param {!bad.ActionEvent} e
 */
bad.ui.View.prototype.onPanelAction = function(e) {
  const eventValue = e.getValue();
  const eventData = e.getData();
  console.debug('This event is not handled:', eventValue, eventData);
};


/**
 * @param {!nestMap} nests
 */
bad.ui.View.prototype.setNests = function(nests) {
  this.nst = nests;
};


/**
 * @param {!bad.UserManager} user
 */
bad.ui.View.prototype.setUser = function(user) {
  this.user_ = user;

  // Steps through each of the panels and makes sure their user is set
  // to the same.
  // goog.object.forEach(this.panelMap, panel => panel.setUser(user), this);

  this.panelMap.forEach(panel => panel.setUser(user));

};


/**
 * @return {!bad.UserManager}
 */
bad.ui.View.prototype.getUser = function() {
  return this.user_;
};

//------------------------------------------------------[ Panel Event Helper ]--
/**
 * @param {!string} v Secondary event value.
 * @param {(string|number|?Object)=} opt_data Optional data to include in the
 * event.
 */
bad.ui.View.prototype.dispatchViewEvent = function(v, opt_data) {
  this.dispatchEvent(new ViewEvent(this, v, opt_data));
};

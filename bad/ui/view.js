goog.provide('ViewEvent');
goog.provide('bad.ui.View');
goog.provide('bad.ui.ViewEventName');

goog.require('bad.ui.EventType');
goog.require('bad.utils');
goog.require('goog.array');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.object');


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
 * @param {?Object=} opt_data Optional data to include in the event.
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
   * @type {!bad.ui.Layout|undefined}
   * @private
   */
  this.layout_ = undefined;

  /**
   * @enum {!bad.ui.Panel}
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

  goog.object.forEach(
      this.panelMap, function(panel, uid) { panel.dispose(); }, this);
};


/**
 * Add a panel as a child of the view.
 * @param {!string} name The name of the panel - used as a key in the panel map.
 * @param {!bad.ui.Panel} panel The panel itself.
 */
bad.ui.View.prototype.addPanelToView = function(name, panel) {
  this.panelMap[name] && this.panelMap[name].dispose();
  this.panelMap[name] = panel;
  this.initListenersForPanel_(panel);
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
 * @param {!bad.ui.Layout} layout
 */
bad.ui.View.prototype.setLayout = function(layout) {
  this.layout_ = layout;
};


/**
 * @return {!bad.ui.Layout|undefined}
 */
bad.ui.View.prototype.getLayout = function() {
  return this.layout_;
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
  goog.object.forEach(this.panelMap, panel => panel.setUser(user), this);
};


/**
 * @return {!bad.UserManager}
 */
bad.ui.View.prototype.getUser = function() {
  return this.user_;
};


//--------------------------------------------------------[ Panel Animations ]--
/**
 * Slide a given panel in. Only reacts if the panel knows about its slidable
 * nest. Set this up with @code<panel.setSlideNest>
 * @param {!bad.ui.Panel} panel
 * @param {?Function=} opt_cb
 * @param {number=} opt_size
 * @param {boolean=} opt_ps If true, treat the size as a percentage.
 */
bad.ui.View.prototype.slidePanelIn = function(panel, opt_cb, opt_size, opt_ps) {
  const cb = opt_cb || goog.bind(panel.show, panel);
  let pix = opt_size ? opt_size : panel.getSlideSize();
  let pers = null;
  if (opt_ps) {
    pers = pix;
    pix = null;
  }
  const nest = panel.getSlideNest();
  nest && nest.slideOpen(pers, pix, cb);
};


/**
 * @param {!bad.ui.Panel} panel
 * @param {?Function=} opt_cb
 */
bad.ui.View.prototype.slidePanelClosed = function(panel, opt_cb) {
  const cb = opt_cb ? opt_cb : goog.nullFunction;
  const nest = panel.getSlideNest();
  nest ? nest.slideClosed(cb) : cb();
};


/**
 * @param {!bad.ui.Panel} panel
 * @param {?Function=} opt_cb
 * @param {number=} opt_perc
 * @param {number=} opt_pix
 */
bad.ui.View.prototype.slidePanelToggle = function(
    panel, opt_cb, opt_perc, opt_pix) {
  var cb = opt_cb ? opt_cb : goog.nullFunction;
  var pix = opt_pix || panel.getSlideSize();
  var nest = panel.getSlideNest();
  if (nest) {
    nest.toggle(cb, opt_perc, pix);
  } else
    cb();
};


/**
 * Slides all the slidable panels closed, and once all panels in the view
 * have been visited, it fires the given callback.
 * @param {?Function=} opt_cb
 */
bad.ui.View.prototype.slideAllClosed = function(opt_cb) {

  /**
   * @type {!Function}
   */
  const cb = opt_cb || goog.nullFunction;

  /**
   * @type {!Array.<string>}
   */
  const panelIds = goog.object.getKeys(this.panelMap);

  console.log('Here is the panelIds', this.panelMap);

  /**
   * Ca callback function called either immediately, if the panel cant slide
   * closed, or after the slide is done.
   * @param {!string} uid
   */
  const callback = function(uid) {
    goog.array.remove(panelIds, uid);
    if (panelIds.length > 0) {
      console.debug('Wait for it...');
    } else {
      console.debug('Fire now!');
      cb();
    }
  };

  goog.object.forEach(this.panelMap, function(panel, uid) {
    const nest = panel.getSlideNest();
    if (nest) {
      nest.slideClosed(goog.partial(callback, uid));
    } else {
      callback(uid);
    }
  }, this);
};


//------------------------------------------------------[ Panel Event Helper ]--
/**
 * @param {!string} v Secondary event value.
 * @param {?Object=} opt_data Optional data to include in the event.
 */
bad.ui.View.prototype.dispatchViewEvent = function(v, opt_data) {
  this.dispatchEvent(new ViewEvent(this, v, opt_data));
};

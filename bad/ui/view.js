goog.provide('bad.ui.View');

goog.require('bad.EventType');
goog.require('bad.ViewEvent');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');


/**
 * Toggle the whole tree display either open or closed
 * @param {!bad.ui.Panel} panel
 * @param {!{custom:{isOn:!boolean}}} eventData
 */
const toggleTree = (panel, eventData) => {
  // The first level children. From a pure usability perspective
  // its nicer if we don't to close these. If we did, the tree *always* ends
  // up with only one element revealed. So we keep the first level children
  // open at all times.
  const fc = panel.getElement().querySelector('.children');
  const isOn = /**@type {!boolean} */ (eventData.custom['isOn']);
  const children = panel.getElement().querySelectorAll('.children');
  const revealIcons = panel.getElement().querySelectorAll('.tst_reveal_icon');
  Array.from(children).forEach(
      e => goog.dom.classlist.enable(
          e, 'tst_tree-children__hidden', e !== fc && !isOn));
  Array.from(revealIcons)
      .forEach(
          e => goog.dom.classlist.enable(
              e, 'tst_icon_rotated', e !== fc && !isOn));
};


/**
 * @param {!bad.ui.Panel} panel
 * @param {!{trigger:!HTMLElement}} eventData
 */
const toggleTreeChildren = (panel, eventData) => {
  const revealIcon = eventData.trigger;
  const elId = revealIcon.getAttribute('data-child-id');
  let child = panel.getElement().querySelector(`#${elId}`);
  goog.dom.classlist.toggle(child, 'tst_tree-children__hidden');
  goog.dom.classlist.toggle(revealIcon, 'tst_icon_rotated');
};


const treeNodeSelect = panel => eventData => {
  const allNodes = panel.getElement().querySelectorAll('.tree-node');
  let href = eventData.trigger.getAttribute('data-href');
  Array.from(allNodes).forEach(n => {
    if (n.getAttribute('data-href') == href) {
      goog.dom.classlist.add(n, 'selected')
    } else {
      goog.dom.classlist.remove(n, 'selected')
    }
  });
};


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

  this.removePanelFromView(name);
  this.panelMap.set(name, panel);
  this.initListenersForPanel_(panel);
};


/**
 * Remove a panel from the view by name.
 * @param {!string} name The name of the panel - used as a key in the panel map.
 */
bad.ui.View.prototype.removePanelFromView = function(name) {
  this.panelMap.has(name) && this.panelMap.get(name).dispose();
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
      panel, bad.EventType.COMP, goog.bind(this.onPanelAction, this));
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
 * @param {!bad.CompEvent} e
 */
bad.ui.View.prototype.onPanelAction = function(e) {
  const eventValue = e.getValue();
  const eventData = e.getData();
  const ePanel = /** @type {!bad.ui.Panel} */ (e.target);

  switch (eventValue) {
    case 'toggle_tree':
      toggleTree(ePanel, /**@type {!{custom:{isOn:boolean}}}*/ (eventData));
      break;
    case 'tree_toggle-children':
      toggleTreeChildren(
          ePanel,
          /**@type {!{trigger:!HTMLElement}}*/ (eventData));
      break;
    case 'destroy_me':
      ePanel.dispose();
      break;
    case 'switch_view':
      let view = eventData.trigger.getAttribute('data-view');
      let pk = eventData.trigger.getAttribute('data-pk');
      this.dispatchViewEvent(`switch_view_${view}`, pk);
      break;
    default:
      (() => [eventValue, eventData, ePanel])();
      console.debug('This event is not handled:', eventValue, eventData);
  }
};


/**
 * @param {!bad.ui.Layout.NestMap} nests
 */
bad.ui.View.prototype.setNests = function(nests) {
  this.nst = nests;
};


/**
 * @param {!bad.UserManager} user
 */
bad.ui.View.prototype.setUser = function(user) {
  this.user_ = user;
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
 * @param {*=} opt_data Optional data to include in the
 * event.
 */
bad.ui.View.prototype.dispatchViewEvent = function(v, opt_data) {
  this.dispatchEvent(new bad.ViewEvent(this, v, opt_data));
};

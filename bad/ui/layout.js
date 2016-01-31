/**
 * @fileoverview  Class for building a 3 panel dynamic resizeable layout.
 */

goog.provide('bad.ui.Layout');
goog.provide('bad.ui.Layout.CssClassMap');
goog.provide('bad.ui.Layout.IdFragment');

goog.require('bad.CssPrefix');
goog.require('bad.ui.Component');
goog.require('bad.ui.EventType');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.fx.Animation');
goog.require('goog.fx.Dragger');
goog.require('goog.fx.Transition');
goog.require('goog.math.Box');
goog.require('goog.math.Rect');
goog.require('goog.math.Size');
goog.require('goog.object');
goog.require('goog.style');
goog.require('goog.ui.Component');



/**
 * Create layout that gives three resizable cells. The layout can be set
 * either horizontal, or vertical. Cell positions are :
 * <pre>
 * Horizontal:  [A]|[B]|[C]
 *
 * Vertical:    [1]
 *              [2]
 *              [3]
 * </pre>
 * Cells are separated by a drag bar that resizes the cells on
 * either side of the drag bar. The drag bars are named for the cells
 * they effect. So:
 *      Cells [A] and [B] are separated by drag bar [AB]
 *      Cells [B] and [C] are separated by drag bar [BC]
 * Internally, the layout is modelled with rectangles, and the DOM elements are
 * updated to the rectangle size and positions as dragging happens.
 * @param {!string} id An id for this instance of this class.
 * @param {!Array<!String>} cellNames An array of three cell addresses.
 * @param {string=} opt_orientation An optional specification for the
 *      orientation of the layout. (vertical or horizontal)
 *      Defaults to horizontal.
 * @param {?goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {bad.ui.Component}
 */
bad.ui.Layout = function(id, cellNames, opt_orientation, opt_domHelper) {
  bad.ui.Component.call(this, opt_domHelper);

  /**
   * The component instance Id.
   */
  this.setId(id.toString());

  /**
   * The component box size
   * @type {!goog.math.Size}
   * @private
   */
  this.componentBoxSize_ = new goog.math.Size(0, 0);

  /**
   * Allows the height of the layout to follow the height of the view port.
   * @type {!boolean}
   * @private
   */
  this.heightToViewport_ = false;

  /**
   * Allows the width of the layout to follow the width of the view port.
   * @type {!boolean}
   * @private
   */
  this.widthToViewport_ = false;

  /**
   * The orientation of the containers.
   * @type {!string}
   * @private
   */
  this.orientation_ = 'horizontal';
  if (opt_orientation) {
    this.orientation_ = opt_orientation;
  }

  /**
   * The default margin of the layout component.
   * @type {!goog.math.Box}
   * @private
   */
  this.margin_ = new goog.math.Box(0, 0, 0, 0);

  /**
   * A layout may have inner layouts.
   * This is a map of the inner layouts contained in this layout.
   * @enum
   * @private
   */
  this.innerLayout_ = {};

  /**
   * All cell elements - including those of the inner layout
   * are accessible through this map.
   * @enum {!bad.ui.Layout.NestType}
   */
  this.nests = {};

  /**
   * A layout has three cells.
   * The cells and their methods are accessible through this
   * map via the id's given to the cells with during construction.
   * If no id's were passed in, the default is A, B and C are used
   * @enum {!bad.ui.Layout.CellType}
   * @private
   */
  this.cell_ = {
    A: {name: cellNames[0], cellClass: cellNames[0]},
    B: {name: cellNames[1], cellClass: cellNames[1]},
    C: {name: cellNames[2], cellClass: cellNames[2]}
  };

  /**
   * A map of the draggers in the layout.
   * @enum {!bad.ui.Layout.DraggerType}
   * @private
   */
  this.dragger_ = {
    AB: {dragClass: cellNames[0] + cellNames[1]},
    BC: {dragClass: cellNames[1] + cellNames[2]}
  };

  /**
   * The thickness (in pixels) of the draggers.
   * @type {!number}
   * @private
   */
  this.draggerThickness_ = 0;

  /**
   * A class name that will be appended to the draggers to be able to style
   * a grabber image into them. By default this is set to 'grabber'
   * and results in 3 dots.
   * @type {!string}
   * @private
   */
  this.grabberClass_ = 'grabber';

  /**
   * The last known position of the 'AB' dragger.
   * @type {!number}
   * @private
   */
  this.memoryAB_ = 0;

  /**

   * The last known position of the 'BC' dragger.
   * @type {!number}
   * @private
   */
  this.memoryBC_ = 0;

  /**
   * @type {!string}
   * @private
   */
  this.targetCellName_ = '';

  /**
   * This is set only when the dom is rendered, and can be read by any of the
   * children in order to build a dynamic CSS structure for each cell.
   * @type {!string}
   * @private
   */
  this.cellClassPrefix_ = '';

  /**
   * A monitoring object
   * @type {!goog.dom.ViewportSizeMonitor}
   * @private
   */
  this.viewportSizeMonitor_ =
      goog.dom.ViewportSizeMonitor.getInstanceForWindow();

  /**
   * The duration of animations
   * @type {!number}
   * @private
   */
  this.aniDuration_ = 250;
};
goog.inherits(bad.ui.Layout, bad.ui.Component);


/**
 * @typedef {{
 *     cellClass: !String,
 *     close: !Function,
 *     element: !Element,
 *     hide: !Function,
 *     initSize: !number,
 *     minSize: !number,
 *     isOpen: !function(): !boolean,
 *     lock: !Function,
 *     name: !String,
 *     rect: !goog.math.Rect,
 *     show: !Function,
 *     slideClosed: !Function,
 *     slideOpen: !Function,
 *     slideTo: !Function,
 *     toggle: !Function,
 *     unlock: !Function
 * }}
 */
bad.ui.Layout.CellType;


/**
 * @typedef {{
 *    cellClass: !String,
 *    element: !Element,
 *    name: !String,
 *    rect: !goog.math.Rect
 * }}
 */
bad.ui.Layout.NestType;


/**
 * @typedef {{
 *    dragClass: !String,
 *    dragger: !goog.fx.Dragger,
 *    element: !Element,
 *    limitsRect: !goog.math.Rect,
 *    rect: !goog.math.Rect
 * }}
 */
bad.ui.Layout.DraggerType;


/**
 * @typedef {{
 *    element: !Element,
 *    nestId: !string,
 *    rect: !goog.math.Rect
 * }}
 */
bad.ui.Layout.EventDataType;


/**
 * Orientation values for the layout.
 * @enum {string}
 */
bad.ui.Layout.Orientation = {

  /**
   * Horizontal orientation means splitter moves right-left.
   */
  HORIZONTAL: 'horizontal',

  /**
   * Vertical orientation means splitter moves up-down.
   */
  VERTICAL: 'vertical'
};


/**
 * @enum {string}
 */
bad.ui.Layout.IdFragment = {
  CELL: '_cmprt',
  DRAGGER: '_drggr'
};


/**
 * A map of orientation transforms.
 * For vertical orientations, this map is used as a rotation transform to access
 * the correct values in things like goog.math.Rect and goog.math.Size objects.
 * @enum {!string}
 */
bad.ui.Layout.ORIENT = {
  'x': 'y',
  'y': 'x',
  'left': 'top',
  'top': 'left',
  'width': 'height',
  'height': 'width',
  'east': 'north',
  'north': 'east',
  'west': 'south',
  'south': 'west',
  'A': '1',
  'B': '2',
  'C': '3'
};


/**
 * A map of dom class names
 * @enum {!string}
 */
bad.ui.Layout.CssClassMap = {
  LAYOUT_CELL: goog.getCssName(bad.CssPrefix.LAYOUT, 'nest'),
  CELL_FRAGMENT: goog.getCssName(bad.CssPrefix.LAYOUT, 'nest'),
  DRAG_HANDLE: goog.getCssName(bad.CssPrefix.LAYOUT, 'drag-handle'),
  DRAG_HAND_FRAGMENT: goog.getCssName(bad.CssPrefix.LAYOUT, 'drag-handle-'),
  DRAG_HORIZ: goog.getCssName(bad.CssPrefix.LAYOUT, 'drag-handle-horiz'),
  DRAG_VERTICAL: goog.getCssName(bad.CssPrefix.LAYOUT, 'drag-handle-vert')
};


//----------------------------------------------------[ Component Life Cycle ]--
/**
 * Create the DOM node & text node needed for the layout.
 * @override
 */
bad.ui.Layout.prototype.createDom = function() {
  var dom = this.getDomHelper();

  // Create the root element, a DIV that holds the three cells and
  // two drag handles.
  this.setElementInternal(dom.createDom(goog.dom.TagName.DIV, {
    'id': this.getId(),
    'class': bad.CssPrefix.LAYOUT
  }));

  /**
   * The name of the parent cell of this cell.
   * Used to give cell elements a handy class for CSS
   * @type {string}
   */
  var myClassPrefix = this.getCellClassPrefix_();

  // Create the cells.
  goog.object.forEach(this.cell_,
      function(cell, key) {
        var className = bad.ui.Layout.CssClassMap.LAYOUT_CELL + ' ' +
            bad.ui.Layout.CssClassMap.CELL_FRAGMENT + myClassPrefix +
            '-' + cell.cellClass;

        cell.element = dom.createDom(goog.dom.TagName.DIV, className);
        dom.appendChild(this.getElement(), cell.element);
      }, this);

  // Create the draggers.
  goog.object.forEach(this.dragger_,
      function(dragger, key) {
        dragger.element = dom.createDom(goog.dom.TagName.DIV, {
          'class': bad.ui.Layout.CssClassMap.DRAG_HANDLE + ' ' +
              bad.ui.Layout.CssClassMap.DRAG_HAND_FRAGMENT +
              dragger.dragClass + ' ' + this.getOrientClassName_() +
              ' ' + this.getGrabberClass_(),
          'style': this.checkOrient_('width') + ': ' +
              this.draggerThickness_ + 'px'
        });
        dom.appendChild(this.getElement(), dragger.element);
      }, this);

  this.createDraggers_();
};


/**
 * Setup all events and do an initial resize.
 */
bad.ui.Layout.prototype.enterDocument = function() {
  bad.ui.Layout.superClass_.enterDocument.call(this);

  // If position is not set in the inline style of the element, it is not
  // possible to get the element's real CSS position until the element is in
  // the document.
  // When position:relative is set in the CSS and the element is not in the
  // document, Safari, Chrome, and Opera always return the empty string;
  // while IE always return "static".
  // Do the final check to see if element's position is set as "relative",
  // "absolute" or "fixed".
  var element = /** @type {!Element} */ (this.getElement());
  var target = /** @type {!Node} */ (this.getTarget());

  goog.dom.append(target, element);

  if (goog.style.getComputedPosition(element) === 'static') {
    element.style.position = 'relative';
  }

  // Init the event handlers.
  this.getHandler().
      listen(
          this.dragger_.AB.dragger,
          goog.fx.Dragger.EventType.START,
          this.onDragStart_).
      listen(
          this.dragger_.AB.dragger,
          goog.fx.Dragger.EventType.DRAG,
          goog.bind(this.onDrag_, this, this.dragger_.AB)).
      listen(
          this.dragger_.AB.dragger,
          goog.fx.Dragger.EventType.END,
          this.onABDragEnd_).
      listen(
          this.dragger_.BC.dragger,
          goog.fx.Dragger.EventType.START,
          this.onDragStart_).
      listen(
          this.dragger_.BC.dragger,
          goog.fx.Dragger.EventType.DRAG,
          goog.bind(this.onDrag_, this, this.dragger_.BC)).
      listen(
          this.dragger_.BC.dragger,
          goog.fx.Dragger.EventType.END,
          this.onBCDragEnd_).
      listen(
          this.dragger_.BC.element, goog.events.EventType.DBLCLICK,
          goog.bind(this.onDoubleClick_, this, this.cell_.C)).
      listen(
          this.dragger_.AB.element,
          goog.events.EventType.DBLCLICK,
          goog.bind(this.onDoubleClick_, this, this.cell_.A)).
      listen(
          this,
          bad.ui.EventType.PANEL_MINIMIZE,
          this.onPanelMinimize_).
      listen(
          this,
          goog.ui.Component.EventType.CHANGE,
          this.updateChildSizes_
      );

  this.createRects_();
  this.updateVariableSizes_();
  this.addInteraction_();
  this.createNests_();

  if (this.getWidthToViewport() || this.getHeightToViewport()) {

    this.getHandler().listen(
        this.viewportSizeMonitor_,
        goog.events.EventType.RESIZE,
        this.onViewportSizeChanged_
    );
    this.matchSizeToViewport();
  }

  // Create the inner layouts.
  this.createInnerLayout_();

  // Render each child in order that it was added.
  this.forEachChild(function(child) {
    child.render();
  }, this);

  // Pull the inner layout nests to into the parent nest accessor.
  this.pullNests_();

  // Fire a LAYOUT READY event.
  // This event will fire for each child layout as well. The last of these
  // to fire is from the root layout.
  this.dispatchEvent(bad.ui.Layout.EventType.LAYOUT_READY);
};


/**
 * Change the sizes of all children in this layout. It is important to stop
 * event propagation here to prevent the events bubbling to the parent layout
 * and ending in a loop.
 * @param {!goog.events.Event} e The resize event that triggered this.
 * @private
 */
bad.ui.Layout.prototype.updateChildSizes_ = function(e) {
  e.stopPropagation();
  this.forEachChild(function(child) {
    var parentCell = this.getCellByName(child.getTargetCellName());
    child.onTargetSizeChange(parentCell);
  }, this);
};


/**
 * @inheritDoc
 */
bad.ui.Layout.prototype.exitDocument = function() {
  bad.ui.Layout.superClass_.exitDocument.call(this);

  goog.object.forEach(this.innerLayout_, function(layout) {
    layout.getHandler().removeAll();
    layout.exitDocument();
  }, this);

  goog.object.forEach(this.dragger_, function(item) {
    item.dragger.dispose();
  }, this);

  if (this.getHandler()) {
    this.getHandler().removeAll();
  }
};


/**
 * @override
 */
bad.ui.Layout.prototype.disposeInternal = function() {
  bad.ui.Layout.superClass_.disposeInternal.call(this);

  goog.object.forEach(this.innerLayout_, function(layout) {
    layout.disposeInternal();
  }, this);

  goog.dom.removeNode(this.getElement());
};


//-------------------------------------------------------------[ Orientation ]--
/**
 * @param {!string} value The orientation string to check.
 * @return {!string}
 * @private
 */
bad.ui.Layout.prototype.checkOrient_ = function(value) {
  return this.orientation_ === bad.ui.Layout.Orientation.VERTICAL ?
      bad.ui.Layout.ORIENT[value] : value;
};


/**
 * @param {!goog.math.Rect} rect
 * @param {!number} value
 * @private
 */
bad.ui.Layout.prototype.setWidth_ = function(rect, value) {
  this.orientation_ === bad.ui.Layout.Orientation.VERTICAL ?
      rect.height = value :
      rect.width = value;
};


/**
 * @param {!(!goog.math.Rect|!goog.math.Size)} rect
 * @return {number}
 * @private
 */
bad.ui.Layout.prototype.getWidth_ = function(rect) {
  return this.orientation_ === bad.ui.Layout.Orientation.VERTICAL ?
      rect.height :
      rect.width;
};


/**
 * @return {!string}
 * @private
 */
bad.ui.Layout.prototype.flipLeft_ = function() {
  return this.checkOrient_('left');
};


/**
 * @param {!goog.math.Rect} rect
 * @param {!number} value
 * @private
 */
bad.ui.Layout.prototype.setLeft_ = function(rect, value) {
  this.orientation_ === bad.ui.Layout.Orientation.VERTICAL ?
      rect.top = value :
      rect.left = value;
};


/**
 * @param {!goog.math.Rect} rect
 * @return {number}
 * @private
 */
bad.ui.Layout.prototype.getLeft_ = function(rect) {
  return this.orientation_ === bad.ui.Layout.Orientation.VERTICAL ?
      rect.top : rect.left;
};


/**
 * @param {!(!goog.math.Rect|!goog.math.Size)} rect
 * @return {!number}
 * @private
 */
bad.ui.Layout.prototype.getHeight_ = function(rect) {
  return this.orientation_ === bad.ui.Layout.Orientation.VERTICAL ?
      rect.width : rect.height;
};


/**
 * @param {!goog.math.Rect} rect
 * @param {!number} value
 * @private
 */
bad.ui.Layout.prototype.setHeight_ = function(rect, value) {
  this.orientation_ === bad.ui.Layout.Orientation.VERTICAL ?
      rect.width = value : rect.height = value;
};


//-------------------------------------------------------------------[ Nests ]--
/**
 * @private
 */
bad.ui.Layout.prototype.createNests_ = function() {
  goog.object.forEach(this.cell_, function(cell) {
    this.nests['$' + cell.name] = cell;
  }, this);
};


/**
 * Pull the inner layout nests to into the parent nest accessor.
 * @private
 */
bad.ui.Layout.prototype.pullNests_ = function() {
  goog.object.forEach(this.innerLayout_, function(layout) {
    var parentNests = this.getNests();
    var layoutNests = layout.getNests();
    var nestId = '$' + layout.getTargetCellName();
    goog.object.forEach(layoutNests, function(nest, key) {
      parentNests[nestId + key] = nest;
    }, this);
  }, this);
};


//------------------------------------------------------------[ Inner Layout ]--
/**
 * A layout has the ability to contain inner layouts in any of its cells.
 * This functions add an layout instance into the given inner cell.
 * @param {!Array} names An array of names for the inner layout cells.
 * @param {!string} targetName The name of the target layouts cell where this
 *      layout will be added.
 * @param {!string} orientation The vertical or horizontal orientation
 *      of the layout.
 * @return {!bad.ui.Layout}
 */
bad.ui.Layout.prototype.setInnerLayout = function(names, targetName,
                                                  orientation) {
  var id = Math.floor(Math.random() * 2147483648).toString(36);
  var cell = this.getCellByName(targetName);
  if (cell) {
    cell.innerLayoutId = id;
  }

  this.innerLayout_[id] = new bad.ui.Layout(id, names, orientation);
  var layout = this.innerLayout_[id];
  layout.setTargetCellName(targetName);
  layout.setDraggerThickness(this.getDraggerThickness());
  layout.setGrabberClass(this.getGrabberClass_());
  layout.setWidthToViewport(false);
  layout.setHeightToViewport(false);
  layout.setInitialSize(names[0], 20);
  layout.setInitialSize(names[2], 20);
  layout.setMinimumSize(names[0], 0);
  layout.setMinimumSize(names[2], 0);
  layout.setCellClassPrefix_(this.getCellClassPrefix_() + '-' +
      targetName);
  return layout;
};


/**
 * Setting the targetId automatically also sets the target element.
 * @param {!string} id The id of the target element.
 */
bad.ui.Layout.prototype.setTargetCellName = function(id) {
  this.targetCellName_ = id;
};


/**
 * @return {!string} The id of the target element.
 */
bad.ui.Layout.prototype.getTargetCellName = function() {
  return this.targetCellName_;
};


/**
 * Build up a CSS class name from all the parent cells.
 * @param {!string} name The id of the target element.
 * @private
 */
bad.ui.Layout.prototype.setCellClassPrefix_ = function(name) {
  this.cellClassPrefix_ = name;
};


/**
 * Get a pre-built CSS class name from all the parent cells.
 * @return {!string} The id of the target element.
 * @private
 */
bad.ui.Layout.prototype.getCellClassPrefix_ = function() {
  return this.cellClassPrefix_;
};


/**
 * Create each of the inner layouts in turn.
 * @private
 */
bad.ui.Layout.prototype.createInnerLayout_ = function() {
  goog.object.forEach(this.innerLayout_, function(layout) {
    var parentCell = this.getCellByName(layout.getTargetCellName());
    /**
     * Inner layout targets can only be set once the parent layout
     * has been rendered.
     */
    layout.setTarget(parentCell.element);

    /**
     * Layouts are added as children of this layout.
     */
    this.addChild(layout);
  }, this);
};


/**
 * This is the callback function to be called once a change event has been
 * fired by the parent layout.
 * This function is called with the inner layout as scope.
 * @param {!bad.ui.Layout.CellType} parentCell The parent cell that
 *    changed size.
 */
bad.ui.Layout.prototype.onTargetSizeChange = function(parentCell) {
  var size = parentCell.rect;
  this.setSize(size.width, size.height);
};


//-----------------------------------------------------[ Setters and Getters ]--
/**
 * @return {!Object<string, !bad.ui.Layout.NestType>} The nests object.
 */
bad.ui.Layout.prototype.getNests = function() {
  return this.nests;
};


/**
 * Given a list of names, get the nest object for that layout position.
 * @param {...*} var_args
 * @return {!bad.ui.Layout.NestType|undefined}
 */
bad.ui.Layout.prototype.getNest = function(var_args) {
  var accessor = '';
  for (var arg = 0; arg < arguments.length; ++arg) {
    accessor += '$' + arguments[arg];
  }
  return this.nests[accessor];
};


/**
 * Given a list of names, get the nest element for that layout position.
 * @param {...*} var_args
 * @return {!Element|undefined}
 */
bad.ui.Layout.prototype.getNestElement = function(var_args) {
  var result;
  var accessor = '';
  for (var arg = 0; arg < arguments.length; ++ arg) {
    accessor += '$' + arguments[arg];
  }
  if (this.nests[accessor]) {
    result = this.nests[accessor].element;
  }
  return result;
};


/**
 * Sets the initial size of a cell.
 * @param {!string} name The name of the cell to set the initial size.
 * @param {!number} value The size in Pixels of the container.
 */
bad.ui.Layout.prototype.setInitialSize = function(name, value) {
  var cell = this.getCellByName(name);
  if (cell) {
    cell.initSize = value;
  }
};


/**
 * Gets the initial size of a cell.
 * @param {!bad.ui.Layout.CellType} cell The cell to get its initial size for.
 * @return {number} The size in Pixels of the container.
 * @private
 */
bad.ui.Layout.prototype.getInitialSize_ = function(cell) {
  return cell.initSize;
};


/**
 * Set smallest size the A or C cell can be dragged to.
 * @param {!string} name The name of the cell to set the minimum size to.
 * @param {!number} value The minimum size allowed for the A component.
 */
bad.ui.Layout.prototype.setMinimumSize = function(name, value) {
  var cell = this.getCellByName(name);
  if (cell) {
    cell.minSize = value;
  }
};


/**
 * Returns the minimum size the A or C panel may be.
 * Lazily creates a minimum and set it to 0 if none has been specified yet.
 * @param {!bad.ui.Layout.CellType} cell The cell to get the minimum size for.
 * @return {number} The minimum size the A cell may be.
 * @private
 */
bad.ui.Layout.prototype.getMinimumSize_ = function(cell) {
  return cell.minSize || 0;
};


/**
 * @param {!string} value The name of the cell to get.
 * @return {!bad.ui.Layout.CellType|undefined}
 */
bad.ui.Layout.prototype.getCellByName = function(value) {
  var test = function(cell) {
    return cell.name === value;
  };
  return goog.object.findValue(this.cell_, test, this);
};


/**
 * Set the maximum size of the A cell.
 * @param {!number} value
 * @private
 */
bad.ui.Layout.prototype.setDraggerABLimits_ = function(value) {
  var rect = this.getDraggerLimitsRect_(this.dragger_.AB);

  this.setLeft_(rect, this.getMinimumSize_(this.cell_.A));
  this.setWidth_(rect,
      value - this.getLeft_(rect) - this.getDraggerThickness());
  this.dragger_.AB.dragger.setLimits(rect);
};


/**
 * Set the BC dragger to be limited to between the AB dragger and the minimum
 * size the C panel may be.
 * @param {!number} max The maximum position allowed for the AB dragger. This is
 *      either top or left depending on the orientation.
 * @private
 */
bad.ui.Layout.prototype.setDraggerBCLimits_ = function(max) {
  var draggerThickness = this.getDraggerThickness();
  var rect = this.getDraggerLimitsRect_(this.dragger_.BC);
  var min = this.getMinimumSize_(this.cell_.C);

  this.setWidth_(rect,
      this.getWidth_(this.componentBoxSize_) -
      this.getLeft_(this.dragger_.AB.rect) -
      (draggerThickness * 2) - min);
  this.setLeft_(rect, max + draggerThickness);
  this.dragger_.BC.dragger.setLimits(rect);
};


/**
 * Dragger limits are set via a goog.math.Rect object.
 * If dragger limits have been set, this returns the rect object,
 * and lazily creates it (with NaN as limits) if it has not been set.
 * @param {!bad.ui.Layout.DraggerType} dragger The dragger object to
 *      get the limits for.
 * @return {!goog.math.Rect} goog.math.Rect object specifying the limits of the
 *      AB dragger.
 * @private
 */
bad.ui.Layout.prototype.getDraggerLimitsRect_ = function(dragger) {
  if (!dragger.limitsRect) {
    dragger.limitsRect = new goog.math.Rect(NaN, NaN, NaN, NaN);
  }
  return dragger.limitsRect;
};


/**
 * Set whether the layout should follow the view port width.
 * @param {!number} top Top.
 * @param {!number} right Right.
 * @param {!number} bottom Bottom.
 * @param {!number} left Left.
 */
bad.ui.Layout.prototype.setMargin = function(top, right, bottom, left) {
  this.margin_.top = top;
  this.margin_.right = right;
  this.margin_.bottom = bottom;
  this.margin_.left = left;
};


/**
 * @return {!goog.math.Box} The margin box.
 */
bad.ui.Layout.prototype.getMargin = function() {
  return this.margin_;
};


/**
 * Set whether the layout should follow the view port width.
 * @param {!boolean} bool True if the layout should follow the view port width.
 */
bad.ui.Layout.prototype.setWidthToViewport = function(bool) {
  this.widthToViewport_ = bool;
};


/**
 * @return {!boolean} True if the layout should track the view port width.
 */
bad.ui.Layout.prototype.getWidthToViewport = function() {
  return this.widthToViewport_;
};


/**
 * Set whether the layout should follow the view port height.
 * @param {!boolean} bool True if the layout should follow the view port height.
 */
bad.ui.Layout.prototype.setHeightToViewport = function(bool) {
  this.heightToViewport_ = bool;
};


/**
 * @return {boolean} True if the layout should track the view port height.
 */
bad.ui.Layout.prototype.getHeightToViewport = function() {
  return this.heightToViewport_;
};


/**
 * Sets the thickness of the drag handle.
 * @param {!number} value The thickness of the drag handle in pixels.
 */
bad.ui.Layout.prototype.setDraggerThickness = function(value) {
  this.draggerThickness_ = value;
};


/**
 * Gets the width of the drag handle.
 * @return {!number} The size of the handle in pixels.
 */
bad.ui.Layout.prototype.getDraggerThickness = function() {
  return this.draggerThickness_;
};


/**
 * Add a grabber image to the dragger.
 * @param {!string} value The name of a class that wil be
 *      appended to the draggers.
 */
bad.ui.Layout.prototype.setGrabberClass = function(value) {
  this.grabberClass_ = value;
};


/**
 * Get the class name of the grabber image to be added to the draggers.
 * @return {!string} The size of the handle in pixels.
 * @private
 */
bad.ui.Layout.prototype.getGrabberClass_ = function() {
  return this.grabberClass_;
};


/**
 * Sets the vertical/horizontal orientation.
 * @param {!string} value The continuous resize value.
 */
bad.ui.Layout.prototype.setOrientation = function(value) {
  this.orientation_ = value;
};


/**
 * Set the size of the layout.  This is usually called by the controlling
 * application.  This will set the layout root BorderBoxSize, while honouring
 * the required margins for the layout.
 * @param {!number} givenWidth The required width of the layout.
 * @param {!number} givenHeight The required height of the layout.
 */
bad.ui.Layout.prototype.setSize = function(givenWidth, givenHeight) {
  // Compensate for margin settings.
  var margin = this.getMargin();
  var newRect = new goog.math.Rect(
      margin.left,
      margin.top,
      givenWidth - margin.left - margin.right,
      givenHeight - margin.top - margin.bottom
  );

  // Set the total size of the component.
  this.componentBoxSize_.width = newRect.width;
  this.componentBoxSize_.height = newRect.height;

  if (this.isInDocument()) {

    // Update the size and position of the layout root element.
    this.updatePositionAndSize_(
        /** @type {!Element} */ (this.getElement()),
        newRect);

    var bCRect = this.dragger_.BC.rect;
    var cRectWidth = this.getWidth_(this.cell_.C.rect) +
        this.getDraggerThickness();
    this.setLeft_(bCRect, this.getWidth_(this.componentBoxSize_) - cRectWidth);

    // Update the common size of the elements.
    this.updateStaticSizes_(this.getHeight_(this.componentBoxSize_));

    // Update the variable sizes of the cells.
    this.updateVariableSizes_();
  } else {
    console.debug('Layout: Sizes before initiation is read from the CSS!');
  }
};


/**
 * Get the size of the component border box.
 * @return {!goog.math.Size} A goog.math.Size object.
 */
bad.ui.Layout.prototype.getSize = function() {
  return this.componentBoxSize_;
};


/**
 * Get the class names relative to the orientation of the element requesting the
 * class name.
 * @return {!string} The required class name.
 * @private
 */
bad.ui.Layout.prototype.getOrientClassName_ = function() {
  if (this.orientation_ === bad.ui.Layout.Orientation.VERTICAL) {
    return bad.ui.Layout.CssClassMap.DRAG_VERTICAL;
  }
  return bad.ui.Layout.CssClassMap.DRAG_HORIZ;
};


/**
 * Find the location relative to the layout.
 * @param {!number} left The x location relative to the window.
 * @return {!number} The relative x location.
 * @private
 */
bad.ui.Layout.prototype.getRelativeLeft_ = function(left) {
  return left - goog.style.getPosition(this.getElement()).x +
      this.getMargin().left;
};


//-----------------------------------------------[ Create basic DOM elements ]--
/**
 * Parent the passed in components to the split containers.  Call their
 * createDom methods if necessary.
 * @private
 */
bad.ui.Layout.prototype.createDraggers_ = function() {
  goog.object.forEach(this.dragger_,
      /**
       * @param {!bad.ui.Layout.DraggerType} dragger
       * @param {!String} key
       */
      function(dragger, key) {
        dragger.dragger = new goog.fx.Dragger(dragger.element, dragger.element);
      }, this);
};


/**
 * The layout is mirrored internally by a set of rectangles that represent the
 * size and position of each of the cells, and draggers.
 * This function sets up each of those rectangles.
 * @private
 */
bad.ui.Layout.prototype.createRects_ = function() {
  var initTargetSize = goog.style.getBorderBoxSize(this.getTarget());
  var margin = this.getMargin();

  var newRect = new goog.math.Rect(
      margin.left,
      margin.top,
      initTargetSize.width - margin.left - margin.right,
      initTargetSize.height - margin.top - margin.bottom);

  /**
   * @type {!Array<!goog.math.Rect>}
   */
  var rects = [];

  this.componentBoxSize_.width = newRect.width;
  this.componentBoxSize_.height = newRect.height;
  this.updatePositionAndSize_(
      /** @type {!Element} */ (this.getElement()),
      newRect);

  // goog.math.Rect(x, y, w, h)
  var left = 0;
  var top = 0;
  var iniA = this.cell_.A.initSize;
  var iniC = this.cell_.C.initSize;

  var rootHeight = this.getHeight_(this.componentBoxSize_);
  var rootWidth = this.getWidth_(this.componentBoxSize_);
  var thickness = this.draggerThickness_;

  if (!this.dragger_.AB.rect) {
    /**
     * @type {!goog.math.Rect}
     */
    this.dragger_.AB.rect = new goog.math.Rect(
        iniA, top,
        thickness, rootHeight);
    rects.push(this.dragger_.AB.rect);
  }

  if (!this.dragger_.BC.rect) {
    /**
     * @type {!goog.math.Rect}
     */
    this.dragger_.BC.rect = new goog.math.Rect(
        rootWidth - iniC - thickness, top,
        thickness, rootHeight);
    rects.push(this.dragger_.BC.rect);
  }

  if (!this.cell_.A.rect) {
    /**
     * @type {!goog.math.Rect}
     */
    this.cell_.A.rect = new goog.math.Rect(
        left, top,
        iniA, rootHeight);
    rects.push(this.cell_.A.rect);
  }

  if (!this.cell_.B.rect) {
    /**
     * @type {!goog.math.Rect}
     */
    this.cell_.B.rect = new goog.math.Rect(
        iniA + thickness, top,
        rootWidth - iniA - iniC - thickness, rootHeight);
    rects.push(this.cell_.B.rect);
  }

  if (!this.cell_.C.rect) {
    /**
     * @type {!goog.math.Rect}
     */
    this.cell_.C.rect = new goog.math.Rect(
        iniC + thickness, top,
        rootWidth - iniC + thickness, rootHeight);
    rects.push(this.cell_.C.rect);
  }

  /**
   * When creating the controlling rectangles for the first time, invert all
   * the created rectangles if the orientation is vertical.
   */
  if (this.orientation_ === bad.ui.Layout.Orientation.VERTICAL) {
    goog.array.forEach(rects, function(rect) {
      this.invertRect_(rect);
    }, this);
  }
};


/**
 * Given a goog.math.rect object, this inverts the rectangle. That is:
 * width becomes height, and top becomes left (and vice versa).
 * @param {!goog.math.Rect} rect The rectangle object that will be inverted.
 * @return {!goog.math.Rect} rect The inverted rectangle.
 * @private
 */
bad.ui.Layout.prototype.invertRect_ = function(rect) {
  var width, height, left, top;

  width = rect.width;
  height = rect.height;
  left = rect.left;
  top = rect.top;

  //noinspection JSSuspiciousNameCombination
  rect.width = height;

  //noinspection JSSuspiciousNameCombination
  rect.height = width;

  //noinspection JSSuspiciousNameCombination
  rect.left = top;

  //noinspection JSSuspiciousNameCombination
  rect.top = left;

  return rect;
};


//----------------------------------------------------------[ Update Methods ]--
/**
 * Move and resize a container.  The sizing changes the BorderBoxSize.
 * @param {!Element} element The element to move and size.
 * @param {!goog.math.Rect} rect The top, left, width and height to change to.
 * @param {string=} opt_nestId The id of the nest that is being updated.
 * @private
 */
bad.ui.Layout.prototype.updatePositionAndSize_ = function(element, rect,
                                                          opt_nestId) {
  goog.style.setPosition(element, rect.left, rect.top);
  goog.style.setBorderBoxSize(element, new goog.math.Size(Math.max(
      rect.width, 0), Math.max(rect.height, 0)));

  if (opt_nestId) {this.dispatchEvent(
      new bad.ui.Layout.Event(
          bad.ui.Layout.EventType['SIZE_CHANGED_' + opt_nestId],
          this, {
            element: element,
            rect: rect,
            nestId: opt_nestId
          }
      )
    );
  }
};


/**
 * Update the variable component of the cells and draggers.
 * For vertical layout, the height is the variable component, and for
 * horizontal layouts, the width is the variable component.
 * @private
 */
bad.ui.Layout.prototype.updateVariableSizes_ = function() {

  // The following variables are named for the edge they represent
  // aEdgeAB represents the edge between cell A and dragger AB
  // aBEdgeB represents the edge between dragger AB and cell B
  // and so on.
  var aEdgeAB = this.getLeft_(this.dragger_.AB.rect);
  var aBEdgeB = aEdgeAB + this.draggerThickness_;
  var bEdgeBC = this.getLeft_(this.dragger_.BC.rect);
  var bCEdgeC = bEdgeBC + this.draggerThickness_;

  // Size the A cell.
  this.setWidth_(this.cell_.A.rect, aEdgeAB);

  // Size the B cell.
  this.setLeft_(this.cell_.B.rect, aBEdgeB);
  this.setWidth_(this.cell_.B.rect, bEdgeBC - aBEdgeB);

  // Size the C cell.
  this.setLeft_(this.cell_.C.rect, bCEdgeC);
  this.setWidth_(this.cell_.C.rect,
      this.getWidth_(this.componentBoxSize_) - bCEdgeC);

  // Set the maximum size the AB drag handle can be dragged to.
  this.setDraggerABLimits_(bEdgeBC);

  // Set the maximum size the BC drag handle can be dragged to.
  this.setDraggerBCLimits_(aEdgeAB);

  // Now move and size the containers.
  this.updatePositionAndSize_(this.cell_.A.element,
      this.cell_.A.rect);
  this.updatePositionAndSize_(this.dragger_.AB.element,
      this.dragger_.AB.rect);
  this.updatePositionAndSize_(this.cell_.B.element,
      this.cell_.B.rect);
  this.updatePositionAndSize_(this.dragger_.BC.element,
      this.dragger_.BC.rect);
  this.updatePositionAndSize_(this.cell_.C.element,
      this.cell_.C.rect);

  // Fire a CHANGE event.
  this.dispatchEvent(goog.ui.Component.EventType.CHANGE);
};


/**
 * Update the static static component of the cells and draggers.
 * For vertical layout, the width is the static component, and for
 * horizontal layouts, the height is the static component.
 * @param {!number} value The required pixel size.
 * @private
 */
bad.ui.Layout.prototype.updateStaticSizes_ = function(value) {
  this.setHeight_(this.dragger_.AB.rect, value);
  this.setHeight_(this.dragger_.BC.rect, value);
  this.setHeight_(this.cell_.A.rect, value);
  this.setHeight_(this.cell_.B.rect, value);
  this.setHeight_(this.cell_.C.rect, value);
};


//---------------------------------------------------------[ Events Handlers ]--
/**
 * @param {!goog.events.Event} e The event.
 * @private
 */
bad.ui.Layout.prototype.onPanelMinimize_ = function(e) {
  // TODO: Return this!
  //if (e.target.getNestId) {
  //  var nestId = e.target.getNestId();
  //  if (!goog.isDefAndNotNull(this.nests[nestId].toggle)) {
  //    nestId = nestId.substring(0, nestId.length - 2);
  //  }
  //  this.nests[nestId].toggle();
  //}
};


/**
 * @param {!bad.ui.Layout.CellType} cell
 * @private
 */
bad.ui.Layout.prototype.onDoubleClick_ = function(cell) {
  cell.toggle();
};


/**
 * Handle the start drag event on the BC dragger.
 * @private
 */
bad.ui.Layout.prototype.onDragStart_ = function() {
  goog.nullFunction();
};


/**
 * Handle the AB-dragger drag event. Move the containers.
 * @param {!bad.ui.Layout.DraggerType} dragger The parent object to whom
 *    this dragger belong.
 * @param {!goog.fx.DragEvent} e The event.
 * @private
 */
bad.ui.Layout.prototype.onDrag_ = function(dragger, e) {
  var pos = this.flipLeft_() === 'left' ? e.left : e.top;
  this.setLeft_(dragger.rect, this.getRelativeLeft_(pos));
  this.updateVariableSizes_();
};


/**
 * Handle the AB-dragger drag end event. If we're not doing continuous resize,
 * resize the component.  If we're doing continuous resize, the component
 * is already the correct size.
 * @private
 */
bad.ui.Layout.prototype.onABDragEnd_ = function() {
  /*
   * If the results of this drag is same or bigger than the minimum,
   * then set the memory. A 5px margin of error is given.
   * For panels where the minimum is set to 0, we don't want to set the memory
   * unless at least a 5pixel movement was detected. This is to prevent the
   * memory from being set on a double click - such as when you want to open
   * the panel.
   */
  var result = this.getLeft_(this.dragger_.AB.rect);
  var minimum = this.getMinimumSize_(this.cell_.A);
  if (result > Math.max(minimum, 5)) {
    this.memoryAB_ = result;
  }

  this.dispatchEvent(bad.ui.Layout.EventType.HANDLE_DRAG_END);
};


/**
 * Handle the BC-dragger drag end event. If we're not doing continuous resize,
 * resize the component.  If we're doing continuous resize, the component
 * is already the correct size.
 * @private
 */
bad.ui.Layout.prototype.onBCDragEnd_ = function() {
  /*
   * If the full component size minus the result of the drag is bigger than
   * the the minimum allowed size (plus dragger thickness compensation),
   * then set the memory.
   */
  var result = this.getLeft_(this.dragger_.BC.rect);
  var minimum = this.getMinimumSize_(this.cell_.C);
  var fullSize = this.getWidth_(this.componentBoxSize_);
  var draggerThickness = this.getDraggerThickness();

  if (fullSize - result > minimum + draggerThickness) {
    this.memoryBC_ = fullSize - result;
  }

  this.dispatchEvent(bad.ui.Layout.EventType.HANDLE_DRAG_END);
};


/**
 * If the layout width is connected to the view port size, this is the
 * callback that gets called if the view port size changed.
 * @private
 */
bad.ui.Layout.prototype.onViewportSizeChanged_ = function() {
  this.matchSizeToViewport();
};


/**
 * When the viewport changed, match its size.
 */
bad.ui.Layout.prototype.matchSizeToViewport = function() {
  var viewPortSize = this.viewportSizeMonitor_.getSize();
  var targetElementRect = goog.style.getBounds(this.getTarget());
  var width = targetElementRect.width;
  var height = targetElementRect.height;

  if (this.getWidthToViewport() && viewPortSize) {
    width = viewPortSize.width;
  }
  if (this.getHeightToViewport() && viewPortSize) {
    height = viewPortSize.height;
  }
  this.setSize(width, height);
};


//-------------------------------------------------------------[ Interaction ]--
/**
 * Add interaction methods to the nests.
 * @private
 */
bad.ui.Layout.prototype.addInteraction_ = function() {
  this.addInteractionA_(this.cell_.A, this.cell_.C, this.dragger_.AB);
  this.addInteractionC_(this.cell_.A, this.cell_.C, this.dragger_.BC);
};


/**
 * @param {!bad.ui.Layout.CellType} compA
 * @param {!bad.ui.Layout.CellType} compC
 * @param {!bad.ui.Layout.DraggerType} dragAB
 * @private
 */
bad.ui.Layout.prototype.addInteractionA_ = function(compA, compC, dragAB) {

  /**
   * Helper function to hide the A cell.
   * @param {?Function=} opt_callback
   */
  compA.hide = goog.bind(function(opt_callback) {
    this.setLeft_(dragAB.rect, 0 - this.getDraggerThickness());
    this.updateVariableSizes_();
    if (opt_callback) {
      opt_callback();
    }
    return true;
  }, this);

  /**
   * Helper function to close the A cell.
   * @param {?Function=} opt_callback
   * @param {boolean=} opt_animate
   */
  compA.close = goog.bind(function(opt_callback, opt_animate) {
    this.memoryAB_ = Math.max(
        this.getLeft_(dragAB.rect),
        this.getMinimumSize_(this.cell_.A));
    if (opt_animate) {
      this.doAnimate_(dragAB, 0, opt_callback);
    } else {
      this.setLeft_(dragAB.rect, 0);
      this.updateVariableSizes_();
      if (opt_callback) {
        opt_callback();
      }
    }
    return true;
  }, this);

  /**
   * Helper function to show the A cell.
   * @param {number=} opt_percentage
   * @param {number=} opt_pixels
   * @param {?Function=} opt_callback
   * @param {boolean=} opt_animate
   */
  compA.show = goog.bind(
      function(opt_percentage, opt_pixels, opt_callback, opt_animate) {
        var fullSize = this.getWidth_(this.componentBoxSize_);
        var initSize = this.getInitialSize_(this.cell_.A);
        var minSize = this.getMinimumSize_(this.cell_.A);
        var fallbackSize = initSize || minSize || 50;
        var availableSize = fullSize - this.getWidth_(compC.rect) -
            (this.getDraggerThickness() * 2);
        var lastOpenSize = this.memoryAB_ ? this.memoryAB_ : fallbackSize;
        var openTo = goog.isDefAndNotNull(opt_percentage) ?
            (availableSize / 100) * opt_percentage :
            goog.isDefAndNotNull(opt_pixels) ? opt_pixels : lastOpenSize;
        if (opt_animate) {
          this.doAnimate_(dragAB, openTo, opt_callback);
        } else {
          this.setLeft_(dragAB.rect, openTo);
          this.updateVariableSizes_();
          if (opt_callback) {
            opt_callback();
          }
        }
        return true;
      }, this);

  /**
   * Helper function to slide the A cell open.
   * @param {number=} opt_percentage
   * @param {number=} opt_pixels
   * @param {?Function=} opt_callback
   */
  compA.slideOpen = goog.bind(
      function(opt_percentage, opt_pixels, opt_callback) {
        var size = this.getWidth_(compA.rect);
        if (size <= 0) {
          var animate = true;
          compA.show(opt_percentage, opt_pixels, opt_callback, animate);
        }
      }, this);

  /**
   * Helper function to slide the A cell closed.
   * @param {?Function=} opt_callback
   */
  compA.slideClosed = goog.bind(
      function(opt_callback) {
        var size = this.getWidth_(compA.rect);
        if (size > 0) {
          var animate = true;
          compA.close(opt_callback, animate);
        } else {
          compA.close(opt_callback);
        }
      }, this);

  /**
   * Helper function to slide the C cell to any arbitrary position.
   * @param {number=} opt_percentage
   * @param {number=} opt_pixels
   * @param {?Function=} opt_callback
   */
  compA.slideTo = goog.bind(
      function(opt_percentage, opt_pixels, opt_callback) {
        var animate = true;
        compA.show(opt_percentage, opt_pixels, opt_callback, animate);
      }, this);

  /**
   * Helper function to toggle the A cell.
   * @param {?Function=} opt_callback
   */
  compA.toggle = goog.bind(
      function(opt_callback, opt_perc, opt_pix) {
        var size = this.getWidth_(compA.rect);
        var animate = true;
        if (size <= 0) {
          compA.show(opt_perc, opt_pix, opt_callback, animate);
        } else {
          compA.close(opt_callback, animate);
        }
      }, this);

  /**
   * Helper function to lock the A cell.
   */
  compA.lock = goog.bind(
      function() {
        dragAB.dragger.setEnabled(false);
      }, this);

  /**
   * Helper function to unlock the A cell.
   */
  compA.unlock = goog.bind(
      function() {
        dragAB.dragger.setEnabled(true);
      }, this);


  /**
   * Helper function to check if the cell is open.
   */
  compA.isOpen = goog.bind(
      function() {
        return this.getWidth_(compA.rect) > 0;
      }, this);
};


/**
 * @param {!bad.ui.Layout.CellType} compA
 * @param {!bad.ui.Layout.CellType} compC
 * @param {!bad.ui.Layout.DraggerType} dragBC
 * @private
 */
bad.ui.Layout.prototype.addInteractionC_ = function(compA, compC, dragBC) {

  /**
   * Helper function to hide the C cell.
   * @param {?Function=} opt_callback
   */
  compC.hide = goog.bind(
      function(opt_callback) {
        this.setLeft_(dragBC.rect, this.getWidth_(this.componentBoxSize_));
        this.updateVariableSizes_();
        if (opt_callback) {
          opt_callback();
        }
        return true;
      }, this);

  /**
   * Helper function to close the C cell.
   * @param {?Function=} opt_callback
   * @param {boolean=} opt_animate
   */
  compC.close = goog.bind(
      function(opt_callback, opt_animate) {
        var result = this.getLeft_(dragBC.rect);
        var fullSize = this.getWidth_(this.componentBoxSize_);
        var draggerThickness = this.getDraggerThickness();
        this.memoryBC_ = fullSize - result;
        var closeTo = fullSize - draggerThickness;

        if (opt_animate) {
          this.doAnimate_(dragBC, closeTo, opt_callback);
        } else {
          this.setLeft_(dragBC.rect, closeTo);
          this.updateVariableSizes_();
          if (opt_callback) {
            opt_callback();
          }
        }
        return true;
      }, this);

  /**
   * Helper function to show the C cell.
   * @param {number=} opt_percentage
   * @param {number=} opt_pixels
   * @param {?Function=} opt_callback
   * @param {boolean=} opt_animate
   */
  compC.show = goog.bind(
      function(opt_percentage, opt_pixels, opt_callback, opt_animate) {
        var fullSize = this.getWidth_(this.componentBoxSize_);
        var compASize = this.getWidth_(compA.rect);
        var initSize = this.getInitialSize_(this.cell_.C);
        var minSize = this.getMinimumSize_(this.cell_.C);
        var fallbackSize = initSize || minSize || 50;
        var availableSize = fullSize - compASize;
        var lastOpenSize = this.memoryBC_ ? fullSize - this.memoryBC_ :
            fullSize - fallbackSize;
        var openTo = goog.isDefAndNotNull(opt_percentage) ?
            (compASize + this.getDraggerThickness() +
                (availableSize / 100) * (100 - opt_percentage)) :
            goog.isDefAndNotNull(opt_pixels) ?
                compASize + this.getDraggerThickness() + availableSize -
                opt_pixels : lastOpenSize;

        if (opt_animate) {
          this.doAnimate_(dragBC, openTo, opt_callback);
        } else {
          this.setLeft_(dragBC.rect, openTo);
          this.updateVariableSizes_();
          if (opt_callback) {
            opt_callback();
          }
        }
        return true;
      }, this);

  /**
   * Helper function to slide the C cell open.
   * @param {number=} opt_percentage
   * @param {number=} opt_pixels
   * @param {?Function=} opt_callback
   */
  compC.slideOpen = goog.bind(
      function(opt_percentage, opt_pixels, opt_callback) {
        var size = this.getWidth_(compC.rect);
        if (size <= 0) {
          var animate = true;
          compC.show(opt_percentage, opt_pixels, opt_callback, animate);
        }
      }, this);

  /**
   * Helper function to slide the C cell to any arbitrary position.
   * @param {number=} opt_percentage
   * @param {number=} opt_pixels
   * @param {?Function=} opt_callback
   */
  compC.slideTo = goog.bind(
      function(opt_percentage, opt_pixels, opt_callback) {
        var animate = true;
        compC.show(opt_percentage, opt_pixels, opt_callback, animate);
      }, this);

  /**
   * Helper function to slide the C cell closed.
   * If the cell is already closed, it simply calls hide
   * @param {?Function=} opt_callback
   */
  compC.slideClosed = goog.bind(
      function(opt_callback) {
        var size = this.getWidth_(compC.rect);
        if (size > 0) {
          var animate = true;
          compC.close(opt_callback, animate);
        } else {
          compC.close(opt_callback);
        }
      }, this);

  /**
   * Helper function to toggle the C cell.
   * @param {?Function=} opt_callback
   */
  compC.toggle = goog.bind(
      function(opt_callback, opt_perc, opt_pix) {
        var size = this.getWidth_(compC.rect);
        var animate = true;
        if (size <= 0) {
          compC.show(opt_perc, opt_pix, opt_callback, animate);
        } else {
          compC.close(opt_callback, animate);
        }
      }, this);

  /**
   * Helper function to lock the C cell.
   */
  compC.lock = goog.bind(
      function() {
        dragBC.dragger.setEnabled(false);
      }, this);

  /**
   * Helper function to unlock the C cell.
   */
  compC.unlock = goog.bind(
      function() {
        dragBC.dragger.setEnabled(true);
      }, this);

  /**
   * Helper function to check if the cell is open.
   */
  compC.isOpen = goog.bind(
      function() {
        return this.getWidth_(compC.rect) > 0;
      }, this);
};


/**
 *
 * @param {!bad.ui.Layout.DraggerType} dragger
 * @param {!number} end
 * @param {?Function=} opt_callback
 * @private
 */
bad.ui.Layout.prototype.doAnimate_ = function(dragger, end, opt_callback) {
  var start = this.getLeft_(dragger.rect);

  /**
   * @type {!goog.fx.Animation}
   */
  var anim = new goog.fx.Animation([start], [end], this.aniDuration_);

  /**
   * @type {!function(goog.fx.Animation.EventType)}
   */
  var onAnimate = goog.bind(function(e) {
    this.setLeft_(dragger.rect, e.coords[0]);
    this.updateVariableSizes_();
  }, this);

  /**
   * @type {!function(goog.fx.Transition.EventType)}
   */
  var onEnd = goog.bind(function() {
    this.setLeft_(dragger.rect, end);
    this.updateVariableSizes_();
    anim.dispose();
    if (opt_callback) {
      opt_callback();
    }
  }, this);

  this.getHandler().
      listen(
          anim,
          goog.fx.Animation.EventType.ANIMATE,
          onAnimate).
      listen(
          anim,
          goog.fx.Transition.EventType.END,
          onEnd
      );
  anim.play();
};


/**
 * Resets the layout to the state it was initialized in.
 * Can also be used to redraw the layout after its margins were altered.
 */
bad.ui.Layout.prototype.reset = function() {
  this.componentBoxSize_ = new goog.math.Size(NaN, NaN);
  this.dragger_.AB.rect = new goog.math.Rect(NaN, NaN, NaN, NaN);
  this.dragger_.BC.rect = new goog.math.Rect(NaN, NaN, NaN, NaN);
  this.cell_.A.rect = new goog.math.Rect(NaN, NaN, NaN, NaN);
  this.cell_.B.rect = new goog.math.Rect(NaN, NaN, NaN, NaN);
  this.cell_.C.rect = new goog.math.Rect(NaN, NaN, NaN, NaN);
  this.memoryAB_ = 0;
  this.memoryBC_ = 0;

  this.createRects_();
  this.updateVariableSizes_();
};



//-------------------------------------------------------------------[ Events]--
/**
 * Events.
 * @enum {string}
 */
//noinspection JSUnusedGlobalSymbols
bad.ui.Layout.EventType = {
  /**
   * Dispatched after handle drag end.
   */
  HANDLE_DRAG_END: 'on_drag_end',

  /**
   * Dispatched when the layout becomes ready, but before any of the inner
   * layouts are ready.
   */
  LAYOUT_READY: 'layout_ready'
};


/**
 * Object representing a layout event.
 * @param {!string} type Event type.
 * @param {!Object} target Object initiating event.
 * @param {!bad.ui.Layout.EventDataType} data The data that was submitted.
 * @extends {goog.events.Event}
 * @constructor
 */
bad.ui.Layout.Event = function(type, target, data) {
  goog.events.Event.call(this, type, target);

  /**
   * @type {!Element}
   */
  this.element = data.element;

  /**
   * @type {!goog.math.Rect}
   */
  this.rect = data.rect;

  /**
   * @type {!string}
   */
  this.nestId = data.nestId;
};
goog.inherits(bad.ui.Layout.Event, goog.events.Event);


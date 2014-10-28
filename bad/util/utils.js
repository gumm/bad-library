goog.provide('bad.utils');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.object');
goog.require('goog.ui.Component');
goog.require('goog.ui.Css3ButtonRenderer');
goog.require('goog.ui.CustomButton');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.MenuSeparator');
goog.require('goog.ui.ToggleButton');
goog.require('bad.Crypto');
goog.require('goog.crypt.Sha1');
goog.require('goog.crypt.base64');


bad.utils.stringToBytes = function(s) {
  var bytes = new Array(s.length);
  for (var i = 0; i < s.length; ++i)
    bytes[i] = s.charCodeAt(i) & 255;
  return bytes;
};

bad.utils.getTimeNow = function() {
  return Math.floor(new Date().valueOf() / 1000);
};

/**
 * @param {string} string
 * @param {string} icon
 * @return {!Element}
 */
bad.utils.getIconString = function(string, icon) {
  return goog.dom.createDom('span', {},
    goog.dom.createDom('i', icon), string);
};

/**
 * Get a list of the raw form elements. That is all the elements in the form
 * with a type.
 * @param {Element} form
 * @return {Array}
 */
bad.utils.getRawFormElements = function(form) {
    var formElements = [];
    goog.array.forEach(form.elements, function(el) {
        if (el.type && el.type !== 'fieldset') {
            formElements.push(el);
        }
    });
    return formElements;
};

/**
 * Make a default button.
 * @param {!(string|Element)} elId The element id that will be decorated.
 * @param {goog.ui.Component|undefined} parent The buttons parent.
 * @param {Function=} opt_callback The callback function to execute on
 *      button action.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @return {?goog.ui.CustomButton}
 */
bad.utils.makeButton = function(elId, parent, opt_callback, opt_domHelper) {

  var el = goog.dom.getElement(elId);
  var parentEl = goog.dom.getParentElement(el);
  var button = null;
  if (el) {
    button = new goog.ui.CustomButton('',
      goog.ui.Css3ButtonRenderer.getInstance(), opt_domHelper);
    button.setSupportedState(goog.ui.Component.State.FOCUSED, false);
    button.decorateInternal(goog.dom.getElement(elId));
    if (parent) {
      parent.addChild(button);
    } else {
      button.render(parentEl);
    }

    if (opt_callback) {
      button.getHandler().listenWithScope(
        button,
        goog.ui.Component.EventType.ACTION,
        function() {
          opt_callback();
        }, undefined, button
      );
    }
  }
  return button;
};

/**
 * Make a toggle button.
 * @param {!string} elId The element id that will be decorated.
 * @param {goog.ui.Component} parent The buttons parent.
 * @param {Function=} opt_callback The callback function to execute on
 *      button action.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @return {goog.ui.ToggleButton}
 */
bad.utils.makeToggleButton =
  function(elId, parent, opt_callback, opt_domHelper) {
    var button = new goog.ui.ToggleButton('',
      goog.ui.Css3ButtonRenderer.getInstance(), opt_domHelper);
    button.setSupportedState(goog.ui.Component.State.FOCUSED, false);
    button.decorateInternal(goog.dom.getElement(elId));
    parent.addChild(button);
    if (opt_callback) {
      button.getHandler().listenWithScope(
        button,
        goog.ui.Component.EventType.ACTION,
        function() {
          opt_callback();
        }, undefined, button
      );
    }
    return button;
  };

/**
 * Given an array of items, return a menu
 * @param {Array} menuItems An array of arrays.
 * @param {goog.dom.DomHelper} domHelper DOM helper.domHelper.
 * @param {!goog.events.EventHandler} handler The event handler for the panel.
 * @param {bad.ui.Panel} scope The panel scope that the events will fire in.
 * @param {goog.ui.MenuRenderer=} opt_rend
 * @param {goog.ui.MenuItemRenderer=} opt_itemRend
 * @param {boolean=} opt_sticky
 * @return {goog.ui.Menu}
 */
bad.utils.makeMenu = function(menuItems, domHelper, handler, scope, opt_rend,
    opt_itemRend, opt_sticky) {

      /**
       * @type {goog.ui.Menu}
       */
      var menu = new goog.ui.Menu(domHelper, opt_rend);
      menu.addListItem = function(arr) {
        var item;
        if (arr[0]) {
          /**
           * @type {!Element}
           */
          var name = bad.utils.getIconString(arr[0], arr[1]);
          item = new goog.ui.MenuItem(name, arr[2], domHelper, opt_itemRend);
        } else {
          item = new goog.ui.MenuSeparator(domHelper);
        }
        menu.addChild(item, true);
      };

      goog.array.forEach(menuItems, function(arr) {
        menu.addListItem(arr);
      }, scope);

      menu.unStickAll = function() {
        menu.forEachChild(function(child) {
          child.removeClassName('flat-menuitem-stickey-select');
        });
      };

      handler.listen(
        menu,
        goog.ui.Component.EventType.ACTION,
        function(e) {
          var activeMenuItem = e.target;
          e.stopPropagation();
          activeMenuItem.getModel()();
          if (opt_sticky) {
            menu.unStickAll();
            activeMenuItem.addClassName('flat-menuitem-stickey-select');
          }
        }
      );
      return menu;
    };

/**
 *
 * @param {number=} opt_start
 * @return {function(): number}
 */
bad.utils.privateCounter = function(opt_start) {
  var c = opt_start ? opt_start : 0;

  /**
   * @return {number}
   */
  return function() {
    c = c + 1;
    return c;
  };
};

/**
 * Private function that will always return the same random string each time
 * it is called.
 * @return {string}
 */
bad.utils.privateRandom = function() {
  var c = bad.utils.makeId();

  /**
   * @return {string}
   */
  return (function() {
    return c;
  })();
};

/**
 * Returns a pseudo random string. Good for ids.
 * @return {string}
 */
bad.utils.makeId = function() {
  return Math.floor(Math.random() * 2147483648).toString(36);
};



/**
 * @param {number} number
 * @param {string} type
 * @return {boolean}
 */
bad.utils.creditCardValidator = function(number, type) {
  var isValid = false;

  var cards = {
    'mc': '5[1-5][0-9]{14}',
    'ec': '5[1-5][0-9]{14}',
    'vi': '4(?:[0-9]{12}|[0-9]{15})',
    'ax': '3[47][0-9]{13}',
    'dc': '3(?:0[0-5][0-9]{11}|[68][0-9]{12})',
    'bl': '3(?:0[0-5][0-9]{11}|[68][0-9]{12})',
    'di': '6011[0-9]{12}',
    'jcb': '(?:3[0-9]{15}|(2131|1800)[0-9]{11})',
    'er': '2(?:014|149)[0-9]{11}'
  };

  var validateStructure = function(value, ccType) {
    // ignore dashes and whitespaces
    // We could even ignore all non-numeric chars (/[^0-9]/g)
    value = String(value).replace(/[^0-9]/g, '');

    var results = [];
    if (ccType) {
      var expr = '^' + cards[ccType.toLowerCase()] + '$';
      return expr ? !!value.match(expr) : false; // boolean
    }

    goog.object.forEach(cards, function(pattern, name) {
      var matchpat = '^' + pattern + '$';
      if (value.match(matchpat)) {
        results.push(name);
      }
    });

    // String | boolean
    return results.length ? results.join('|') : false;
  };

  // Add the Luhn validator
  // http://en.wikipedia.org/wiki/Luhn_algorithm
  var validateChecksum = function(value) {
    // ignore dashes and whitespaces - We could even ignore
    // all non-numeric chars (/[^0-9]/g)
    value = String(value).replace(/[^0-9]/g, '');

    var sum = 0;
    var parity = value.length % 2;

    for (var i = 0; i <= (value.length - 1); i++) {
      var digit = parseInt(value[i], 10);

      if (i % 2 === parity) {
        digit = digit * 2;
      }
      if (digit > 9) {
        // get the cossfoot
        // Exp: 10 - 9 = 1 + 0 | 12 - 9 = 1 + 2 | ... | 18 - 9 = 1 + 8
        digit = digit - 9;
      }
      sum += digit;
    }

    // divide by 10 and check if it ends in 0 - return true | false
    return ((sum % 10) === 0);
  };

  // Apply both validations
  var validate = function(value, ccType) {
    if (validateChecksum(value)) {
      isValid = validateStructure(value, ccType);
    }
  };

  validate(number, type);

  return isValid;

  //---------------------------------------------------------------[ Example ]--
  //mc: 5100000000000040
};

bad.utils.loadGoogleMaps = function(callback) {

  // the 'google.maps' namespace may already be in the document.
  // If it is, there is no need to get the namespace again.
  try {
    goog.isDefAndNotNull(google.maps);
    callback();
  } catch (e) {

    // Makes a random name for the callback in the global scope
    var randName = bad.utils.makeId();

    // The callback below is placed in the global scope so the call to google
    // maps can access it on callback. It is destroyed
    // immediately inside the callback;
    goog.global[randName] = goog.partial(callback, randName);

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp' +
      '&sensor=false' +
      '&callback=' + randName;
    document.body.appendChild(script);
  }
};





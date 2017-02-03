goog.provide('bad.utils');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.object');
goog.require('goog.string');


/**
 * @param {!bad.ui.Panel} panel
 * @param {!bad.ui.View} view
 * @param {!string} name
 * @param {?bad.ui.Panel=} opt_tPan The target panel
 * @return {!Array<!Function>}
 */
bad.utils.panelWithinPanel = (panel, view, name, opt_tPan) => {
  /**
   * @param {!string} c The class name
   * @param {!Element} t The target element where to look from
   * @param {!Element} def The default if we could not find it
   * @return {!Element|!HTMLBodyElement}
   */
  const getEbyCorD = (c, t, def) => goog.dom.getElementByClass(c, t) || def;
  const user = view.getUser();
  const b = /** @type {!Element} */(goog.dom.getDocument().body);
  const target = opt_tPan ? getEbyCorD(
      'tst_content',
      /** @type {!Element} */(opt_tPan.getElement()),
      b) : b;
  const render = () => {
    panel.setUser(user);
    panel.setTarget(target);
    view.addPanelToView(name, panel);
    panel.renderWithTemplate();
  };
  const destroy = () => {
    const p = view.getPanelByName(name);
    p && p.dispose();
  };
  return [render, destroy];
};


/**
 * Given a string this returns an array of bytes
 * @param {!string} s
 * @return {!Array}
 */
bad.utils.stringToBytes = function(s) {
  const bytes = new Array(s.length);
  for (let i = 0; i < s.length; ++i) bytes[i] = s.charCodeAt(i) & 255;
  return bytes;
};


/**
 * This returns now in seconds.
 * The value returned by the Date.now() method is the number of milliseconds
 * since 1 January 1970 00:00:00 UTC. Always UTC.
 * @return {!number} The current Epoch timestamp in seconds. Rounding down.
 */
bad.utils.getNowSeconds = function() {
  return Math.floor(Date.now() / 1000);
};


/**
 * Private function that will return an incremented counter value each time it
 * is called.
 * @param {?number=} opt_start
 * @return {!function(): number}
 */
bad.utils.privateCounter = function(opt_start) {
  let c = opt_start ? opt_start : 0;
  return function() {
    c = c + 1;
    return c;
  };
};


/**
 * Private function that will always return the same random string each time
 * it is called.
 * @return {!string}
 */
bad.utils.privateRandom = () => {
  const c = bad.utils.makeId();
  return (() => c)();
};


/**
 * Returns a pseudo random string. Good for ids.
 * @param {?number=} opt_length An optional length for the string. Note this
 *    clearly reduces the randomness, and increases the chances of a collision.
 * @return {!string}
 */
bad.utils.makeId = function(opt_length) {
  const s = goog.string.getRandomString();
  return opt_length ? s.substr(0, opt_length) : s;
};


/**
 * @param {!string} string
 * @param {!string} icon
 * @return {!Element}
 */
bad.utils.getIconString = function(string, icon) {
  return goog.dom.createDom('span', {}, goog.dom.createDom('i', icon), string);
};


/**
 * Get a list of the raw form elements. That is all the elements in the form
 * with a type.
 * @param {!HTMLFormElement} form
 * @return {!Array<!Element>}
 */
bad.utils.getRawFormElements = function(form) {
  var formElements = [];
  if (form) {
    goog.array.forEach(form.elements, function(el) {
      if (el.type && el.type !== 'fieldset') {
        formElements.push(el);
      }
    });
  }
  return formElements;
};


/**
 * @param {!number} number
 * @param {!string} type
 * @return {boolean}
 */
bad.utils.creditCardValidator = function(number, type) {
  let isValid = false;

  /**
   * @type {!Object}
   */
  let cards = {
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

  const validateStructure = function(value, ccType) {
    // ignore dashes and whitespaces
    // We could even ignore all non-numeric chars (/[^0-9]/g)
    value = String(value).replace(/[^0-9]/g, '');

    const results = [];
    if (ccType) {
      const expr = '^' + cards[ccType.toLowerCase()] + '$';
      return expr ? !!value.match(expr) : false;  // boolean
    }

    goog.object.forEach(cards, function(pattern, name) {
      const matchpat = '^' + pattern + '$';
      if (value.match(matchpat)) {
        results.push(name);
      }
    });

    // String | boolean
    return results.length ? results.join('|') : false;
  };

  // Add the Luhn validator
  // http://en.wikipedia.org/wiki/Luhn_algorithm
  const validateChecksum = function(value) {
    // ignore dashes and whitespaces - We could even ignore
    // all non-numeric chars (/[^0-9]/g)
    value = String(value).replace(/[^0-9]/g, '');

    let sum = 0;
    const parity = value.length % 2;

    for (let i = 0; i <= (value.length - 1); i++) {
      let digit = parseInt(value[i], 10);

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
  const validate = function(value, ccType) {
    if (validateChecksum(value)) {
      isValid = validateStructure(value, ccType);
    }
  };

  validate(number, type);

  return isValid;

  //---------------------------------------------------------------[ Example ]--
  // mc: 5100000000000040
};


/**
 * @param {!Function} callback
 */
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

    var dom = goog.dom.getDocument();
    var script = dom.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp' +
        '&sensor=false' +
        '&callback=' + randName;
    goog.dom.appendChild(dom, script);
  }
};


/**
 * As goog.math.Size object is a struct, we are not allowed to access the with
 * the '[]' notation, which means that if we have a string in hand, we need this
 * utility to be able to set the size property.
 * @param {!goog.math.Size} size
 * @param {!string} prop Only 'width' and 'height' are valid strings
 * @param {!number} value
 */
bad.utils.setGoogSizeProp = (size, prop, value) => {
  switch (prop) {
    case 'width':
      size.width = value;
      break;
    case 'height':
      size.height = value;
      break;
    default:
      throw 'Error: ' + prop + ' is not a valid goog.math.Size property.';
  }
};


/**
 * As goog.math.Size object is a struct, we are not allowed to access the with
 * the '[]' notation, which means that if we have a string in hand, we need this
 * utility to be able to get the size property.
 * @param {!goog.math.Size} size
 * @param {!string} prop Only 'width' and 'height' are valid strings
 * @return {!number}
 */
bad.utils.getGoogSizeProp = (size, prop) => {
  switch (prop) {
    case 'width':
      return size.width;
    case 'height':
      return size.height;
    default:
      throw 'Error: ' + prop + ' is not a valid goog.math.Size property.';
  }
};


/**
 * As goog.math.Rect object is a struct, we are not allowed to access the with
 * the '[]' notation, which means that if we have a string in hand, we need this
 * utility to be able to set the size property.
 * @param {!goog.math.Rect} rect
 * @param {string} prop Only 'left', 'top', 'width' and 'height'
 *  are valid strings.
 * @param {number} value
 */
bad.utils.setGoogRectProp = (rect, prop, value) => {
  switch (prop) {
    case 'left':
      rect.left = value;
      break;
    case 'top':
      rect.top = value;
      break;
    case 'width':
      rect.width = value;
      break;
    case 'height':
      rect.height = value;
      break;
    default:
      throw 'Error: ' + prop + ' is not a valid goog.math.Rect property.';
  }
};


/**
 * As goog.math.Size object is a struct, we are not allowed to access the with
 * the '[]' notation, which means that if we have a string in hand, we need this
 * utility to be able to get the size property.
 * @param {!goog.math.Rect} rect
 * @param {string} prop Only 'width' and 'height' are valid strings
 * @return {number}
 */
bad.utils.getGoogRectProp = (rect, prop) => {
  switch (prop) {
    case 'left':
      return rect.left;
    case 'top':
      return rect.top;
    case 'width':
      return rect.width;
    case 'height':
      return rect.height;
    default:
      throw 'Error: ' + prop + ' is not a valid goog.math.Rect property.';
  }
};

goog.provide('bad.ui.Panel');

goog.require('bad.CssClassMap');
goog.require('bad.ui.Component');
goog.require('bad.utils');
goog.require('goog.Uri');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.format.JsonPrettyPrinter');



/**
 * @param {?goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @extends {bad.ui.Component}
 * @constructor
 */
bad.ui.Panel = function(opt_domHelper) {
  bad.ui.Component.call(this, opt_domHelper);

  /**
   * @type {goog.Uri}
   * @private
   */
  this.uri_ = new goog.Uri();


  /**
   * Set to true if we can detect that the response from the fetch was
   * redirected. Useful form managing form redirects.
   * @type {boolean}
   */
  this.redirected = false;

  /**
   * @type {?Object}
   * @private
   */
  this.nest_ = null;

  /**
   * @type {number}
   * @private
   */
  this.defaultSlideSize_ = 350;

  /**
   * An array of classes to be added to the panel element when it is created.
   * @type {Array}
   * @private
   */
  this.elementClasses_ = [];

  /**
   * @type {Function}
   */
  this.evalScripts = bad.utils.evalScripts(this);

  /**
   * @type {{html:?Element, scripts:?NodeList}}
   */
  this.responseObject = {html: null, scripts: null};

};
goog.inherits(bad.ui.Panel, bad.ui.Component);


/**
 * Sub-classes should override
 */
bad.ui.Panel.prototype.initDom = goog.nullFunction;


/**
 * @param {boolean} bool
 * @param {?string} url
 */
bad.ui.Panel.prototype.setIsRedirected = function(bool, url) {
  this.redirected = bool;
  if (this.redirected && url) {
    this.uri_ = new goog.Uri(url);
  }
};

/**
 * Expects HTML data from a call to the back.
 * @param {Function=} opt_callback An optional callback to call before rendering
 * the panel. This is useful for when you only want to attach the new panel to
 * the view right before you render it - meaning the existing panel stays in
 * place on the DOM for the duration of the fetch call.
 * @return {Promise} Returns a promise with this panel as value.
 */
bad.ui.Panel.prototype.renderWithTemplate = function(opt_callback) {
  const usr = this.getUser();
  if (usr) {
    return usr.fetch(this.uri_).then(s => {
      if (opt_callback) {
        opt_callback();
      }
      this.onRenderWithTemplateReply(s)
    });
  } else {
    return Promise.reject('No user')
  }
};


/**
 * @return {Promise}
 */
bad.ui.Panel.prototype.refreshTemplateFromServer = function() {
  const usr = this.getUser();
  const uri = this.getUri();
  if (usr && uri) {
    return usr.fetch(uri).then(s => this.replacePanelContent(s));
  } else {
    return Promise.reject('No user or no uri')
  }
};


/**
 * @param {string} reply
 */
bad.ui.Panel.prototype.replacePanelContent = function(reply) {
  this.responseObject = bad.utils.splitScripts(reply);
  if (this.responseObject.html) {
    const el = this.getElement();
    el.replaceChild(this.responseObject.html, el.firstElementChild);
    this.enterDocument();
    }
  if (this.responseObject.scripts) {
    this.evalScripts(this.responseObject.scripts);
  }
};


/**
 * Equivalent to the @code{renderWithTemplate} method in that it is guaranteed
 * that a reply from the callback is received before @code{render} is called.
 * @param {function(?goog.events.EventLike)} callback The callback function
 *      that will receive the reply event.
 */
bad.ui.Panel.prototype.renderWithJSON = function(callback) {
  const usr = this.getUser();
  if (usr) {
    return usr.fetchJson(this.uri_).then(
        json => this.onRenderWithJSON(json, callback));
  } else {
    return Promise.reject('No user')
  }
};


/**
 * @param {string} s
 * @private
 * @return {Promise}
 */
bad.ui.Panel.prototype.onRenderWithTemplateReply = function(s) {

  return new Promise(x => {
    this.responseObject = bad.utils.splitScripts(s);
    this.render();
    return x(this);
  })
};



/**
 * On reply from a GET call to the panel URI
 * @param {function(?goog.events.EventLike)} callback The callback function
 *      that will receive the reply event.
 * @param {?goog.events.EventLike} e Event object.
 * @return {Promise}
 */
bad.ui.Panel.prototype.onRenderWithJSON = function(callback, e) {

  return new Promise((res, rej) => {
    callback(e);
    this.render();
    return res(this);
  })
};


/**
 * @param {string} zCode
 * @param {Object} json
 */
bad.ui.Panel.prototype.onAsyncJsonReply = function(zCode, json) {
  // Stub
};


/**
 * @inheritDoc
 */
bad.ui.Panel.prototype.createDom = function() {
  bad.ui.Panel.superClass_.createDom.call(this);

  const classes = this.elementClasses_.reduce(
      (p, c) => `${p} ${c}`, bad.CssClassMap.PANEL_WRAPPER);

  this.setElementInternal(goog.dom.createDom(
      goog.dom.TagName.DIV, classes, this.responseObject.html));
};


/**
 * @inheritDoc
 */
bad.ui.Panel.prototype.enterDocument = function() {

  const panel = this.getElement();
  this.initDom();
  this.evalScripts(this.responseObject.scripts);

  // Activate buttons
  const tst = panel.querySelectorAll('.tst_button');
  const tstZv = panel.querySelectorAll('.tst_zv');
  const allBut = [...Array.from(tst), ...Array.from(tstZv)];
  allBut.forEach(el => {
    this.listenToThis(el, 'click', e => {
      e.stopPropagation();
      const trg = e.currentTarget;
      this.dispatchCompEvent(trg.getAttribute('data-zv'), {
        custom: e.event_['detail'],
        trigger: trg,
        href: trg.href || trg.getAttribute('data-href')
      });
    });
  });

  // Activate toggle icons
  // We intercept the click on these as well, as we want to stop its
  // propagation.
  const togIcons = panel.querySelectorAll('.mdc-icon-toggle');
  Array.from(togIcons).forEach(
      el => this.listenToThis(el, 'click', e => e.stopPropagation()));
  Array.from(togIcons).forEach(el => {
    this.listenToThis(el, 'MDCIconToggle:change', e => {
      e.stopPropagation();
      const trg = e.currentTarget;
      const isOn = e.event_['detail']['isOn'];
      const hrefAt = isOn ? '__on' : '__off';
      const hrefTog = trg.getAttribute(`data-href${hrefAt}`);
      this.dispatchCompEvent(trg.getAttribute('data-zv'), {
        custom: e.event_['detail'],
        trigger: trg,
        href: trg.href || trg.getAttribute('data-href'),
        hrefTog: hrefTog
      });
    });
  });

  // Activate Menu items
  const ms = panel.querySelectorAll('.mdc-simple-menu');
  Array.from(ms).forEach(el => {
    this.listenToThis(el, 'MDCSimpleMenu:selected', e => {
      e.stopPropagation();
      const trg = e.currentTarget;
      let v = e.event_['detail']['item'].getAttribute('data-zv');
      this.dispatchCompEvent(v, {
        custom: e.event_['detail'],
        trigger: e.event_['detail']['item'],
        href: trg.href || trg.getAttribute('data-href')
      });
    });
  });

  // Hijack elements with a straight-up "href" attribute.
  // Make them emit a 'href' event with the original
  // href or a href data attribute.
  const links = panel.querySelectorAll('[href]');
  Array.from(links).forEach(el => {
    this.listenToThis(el, 'click', e => {
      const trg = e.currentTarget;
      e.preventDefault();
      e.stopPropagation();
      let v = trg.getAttribute('data-zv') || 'href';
      this.dispatchCompEvent(v, {
        custom: e.event_['detail'],
        trigger: e.target,
        href: trg.href || trg.getAttribute('data-href')
      });
    });
  });

  //-------------------------------------------------------------[ Drag Drop ]--
  const dropEls = Array.from(panel.querySelectorAll('.folder_drop_zone'));
  const dragEls = Array.from(panel.querySelectorAll('[draggable]'));

  const activate = e => {
    e.preventDefault();
    e.target.classList.add('drag_over');
  };
  const onDragOver = e => {
    e.preventDefault();
  };
  const onDragLeave = e => {
    e.preventDefault();
    e.target.classList.remove('drag_over');
  };
  const onDragExit = e => {
    e.preventDefault();
    e.target.classList.remove('drag_over');
  };
  const deactivate = e => {
    e.preventDefault();
    e.target.classList.remove('drag_over');
  };
  const onDragStart = e => {
    e.dataTransfer.dropEffect = 'move';
    let o = bad.utils.getElDataMap(e.target);
    e.dataTransfer.setData('text/plain', JSON.stringify(o));
  };
  const justLog = e => {
    //    console.log(e)
  };
  const onDrop = e => {
    deactivate(e);
    e.stopPropagation();
    let data = JSON.parse(e.dataTransfer.getData('text/plain'));
    let o = bad.utils.getElDataMap(e.target);
    this.dispatchCompEvent('drop_on', {custom: {'on': o, 'from': data}});
    return false;
  };

  dropEls.forEach(el => {
    el.addEventListener('dragover', onDragOver, false);
    el.addEventListener('dragenter', activate, false);
    el.addEventListener('dragexit', onDragExit, false);
    el.addEventListener('dragleave', onDragLeave, false);
    el.addEventListener('drop', onDrop, false);
  }, false);

  dragEls.forEach(el => {
    el.addEventListener('dragstart', onDragStart, false);
    el.addEventListener('dragend', justLog, false);

  }, false);


  //--------------------------------------------------------[ Async Populate ]--
  // Grab all elements with a 'zoo_async_json' class.
  // Call the given url, and then dispatch a panel event with the results.
  const async_json_els = panel.querySelectorAll('.zoo_async_json');
  Array.from(async_json_els).forEach(el => {
    let href = el.getAttribute('data-href');
    let event_value = el.getAttribute('data-zv');
    let onReply = goog.bind(this.onAsyncJsonReply, this, event_value);
    this.getUser().fetchJson(new goog.Uri(href)).then(onReply);
  });

  // Grab all elements with a 'zoo_async_html' class.
  // Call the given url, and then dispatch a panel event with the results.
  const async_html_els = panel.querySelectorAll('.zoo_async_html');
  Array.from(async_html_els).forEach(el => {
    let href = el.getAttribute('data-href');
    let event_value = el.getAttribute('data-zv');
    this.dispatchCompEvent(event_value, {trigger: el, href: href});
  });



  // Calling this last makes sure that the final PANEL-READY event really is
  // dispatched right at the end of all of the enterDocument calls.
  bad.ui.Panel.superClass_.enterDocument.call(this);

};


/**
 * @param {bad.ui.Layout.CellType|undefined} nest
 */
bad.ui.Panel.prototype.setNestAsTarget = function(nest) {
  if (nest) {
    this.nest_ = nest;
    this.setTarget(this.nest_.element);
  }
};


/**
 * @param {bad.ui.Layout.CellType|undefined} nest
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
 * @param {number} size
 */
bad.ui.Panel.prototype.setSlideSize = function(size) {
  this.defaultSlideSize_ = size;
};


/**
 * @return {number}
 */
bad.ui.Panel.prototype.getSlideSize = function() {
  return this.defaultSlideSize_;
};


/**
 * @param {goog.Uri} uri
 */
bad.ui.Panel.prototype.setUri = function(uri) {
  this.uri_ = uri;
};


/**
 * @return {goog.Uri}
 */
bad.ui.Panel.prototype.getUri = function() {
  return this.uri_;
};


/**
 * @param {bad.UserManager} user
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
 * @param {string} className
 */
bad.ui.Panel.prototype.addElementClass = function(className) {
  this.elementClasses_.push(className);
};


/**
 * @return {boolean}
 */
bad.ui.Panel.prototype.isOpen = function() {
  return this.slideNest_.isOpen();
};


/**
 * Listen to an event on a Listenable.  If the function is omitted then the
 * EventHandler's handleEvent method will be used.
 * @param {goog.events.ListenableType} src Event source.
 * @param {string|!Array<string>|
 *     !goog.events.EventId<EVENTOBJ>|
 *     !Array<!goog.events.EventId<EVENTOBJ>>} type Event type to listen
 *     for or array of event types.
 * @param {function(EVENTOBJ):?|{handleEvent:function(?):?}|null=} opt_fn
 *     Optional callback function to be used as the listener or an object with
 *     handleEvent function.
 * @param {boolean=} opt_capture Optional whether to use capture phase.
 * @return {goog.events.EventHandler} This object, allowing for
 *     chaining of calls.
 * @template EVENTOBJ
 */
bad.ui.Panel.prototype.listenToThis = function(
    src, type, opt_fn, opt_capture = false) {
  return this.getHandler().listen(src, type, opt_fn, opt_capture);
};


/**
 * @return {goog.format.JsonPrettyPrinter}
 */
bad.ui.Panel.prototype.getPrettyPrinter = function() {
  return new goog.format.JsonPrettyPrinter(
      new goog.format.JsonPrettyPrinter.SafeHtmlDelimiters());
};


/**
 * @param {*} val
 * @param {!Node|!Element} el The element
 *    where this is added to.
 */
bad.ui.Panel.prototype.parsePrettyJson = function(val, el) {

  const pre = goog.dom.createDom('pre');
  pre.innerHTML = this.getPrettyPrinter().format(val);
  goog.dom.append(el, pre);
};

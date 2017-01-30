goog.provide('bad.UserLike');
goog.provide('bad.UserManager');

/** @typedef {{
*     first_name: (!string|undefined),
*     last_name: (!string|undefined),
*     email: (!string|undefined),
*     username: (!string|undefined),
*     id: (!number|undefined),
*     is_active: (!boolean|undefined),
*     is_staff: (!boolean|undefined),
*     is_superuser: (!boolean|undefined)
*     }}
 */
bad.UserLike;


/**
 * A class to manage the setting and getting of permissions.
 * @constructor
 */
bad.UserManager = function() {
  /**
   * @type {!bad.UserLike}
   * @private
   */
  this.user_ = {};

  /**
   * @type {!string}
   * @private
   */
  this.jwToken_ = '';

  /**
   * @type {!Function}
   */
  this.fireChangeCb_ = goog.nullFunction;


  /**
   * @type {!Headers}
   */
  this.headers = new Headers();

};


/**
 * @param {!Function} cb
 */
bad.UserManager.prototype.setOnChangeCallback = function(cb) {
  this.fireChangeCb_ = cb;
};


/**
 * @param {!Response} response
 * @return {!IThenable}
 * @private
 */
bad.UserManager.prototype.updateProfile_ = function(response) {

  return response.json().then(data => {
    let result = false;
    switch(response.status) {
      case 200:
        this.jwToken_ = data['token'];
        this.headers.append('Authorization', `bearer ${this.jwToken_}`);
        this.updateProfile(data['user']);
        result =  true;
        break;
      default:
        console.log(
          'Looks like there was a problem. Status Code: ' +
          response.status);}
    return result;
  });
};


/**
 * @param {bad.UserLike} data
 */
bad.UserManager.prototype.updateProfile = function(data) {
  this.user_ = data;
  this.fireChangeCb_(data);
};


/**
 * @param {string} t
 */
bad.UserManager.prototype.updateToken = function(t) {
  this.jwToken_ = t;
};


/**
 * @return {!number|undefined}
 */
bad.UserManager.prototype.getId = function() {
  return this.user_['id'];
};


/**
 * @return {string|undefined}
 */
bad.UserManager.prototype.getName = function() {
  return this.user_['name'];
};


/**
 * @return {string|undefined}
 */
bad.UserManager.prototype.getSurname = function() {
  return this.user_['surname'];
};


/**
 * @return {string|undefined}
 */
bad.UserManager.prototype.getSalutation = function() {
  let salutation = this.getName();
  const surname = this.getSurname();
  if (surname) {
    salutation = salutation + ' ' + surname;
  }
  return salutation;
};


/**
 * @param {!goog.Uri} uri
 * @param {!Function} callback
 * @param {!Function=} opt_errCb
 */
bad.UserManager.prototype.fetch = function(uri, callback, opt_errCb) {

  /**
   * @type {!RequestInit}
   */
  const reqInit = {
    headers: this.headers,
    credentials: 'include'
  };

  fetch(uri.toString(), reqInit)
      .then(function(response) {
        if (response.status !== 200) {
          console.log(
              'Looks like there was a problem. Status Code: ' +
              response.status);
          opt_errCb && response.text().then(opt_errCb);
        } else {
          response.text().then(callback);
        }
      })
      .catch(function(err) { console.log('Fetch Error :-S', err); });
};


/**
 * @param {!Object} cred
 * @param {!bad.ui.Form} formPanel
 * @param {!Function} onSuccess
 */
bad.UserManager.prototype.login = function(cred, formPanel, onSuccess) {
  let processAsFormPanel = goog.bind(formPanel.processSubmitReply, formPanel);
  let processJWTResponse = goog.bind(this.updateProfile_, this);


  function status(response) {
    if (response.status >= 200 && response.status < 300) {
      return Promise.resolve(response);
    } else {
      return Promise.reject(new Error(response.statusText));
    }
  }

  function json(response) {
    return response.json();
  }

  const jHeaders = new Headers();
  jHeaders.append('Content-type', 'application/json');
  /**
   * @type {!RequestInit}
   */
  const reqJson = {
    method: 'post',
    headers: jHeaders,
    body: JSON.stringify(cred)
  };
  const f1 = fetch('/api/v3/tokens/login/', reqJson)
      .then(status)
      .then(processJWTResponse);


  /**
   * @type {!RequestInit}
   */
  const reqForm = {
    method: 'post',
    body: new FormData(formPanel.getForm()),
    credentials: 'include'
  };
  const f2 = fetch('/login/', reqForm)
      .then(status)
      .then(processAsFormPanel);

  Promise.all([f1, f2]).then(responses => {
    if (!responses.includes(false)) {
      onSuccess();
    }
  });

};

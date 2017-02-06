goog.provide('bad.UserManager');


/**
 * @param {!Response} response
 * @return {!Promise}
 */
const checkStatus = response => {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  } else {
    return Promise.reject(new Error(
        `${response.url} ${response.status} (${response.statusText})`));
  }
};


/**
 * @param {!Response} response
 * @return {!Promise}
 */
const getJson = response => {
  return response.json().then(
      data => Promise.resolve(data),
      err => Promise.reject(`Could not get JSON from response: ${err}`));
};


/**
 * @param {!Response} response
 * @return {!Promise}
 */
const getText = response => {
  return response.text().then(
      text => Promise.resolve(text),
      err => Promise.reject(`Could not get text from response: ${err}`));
};


/**
 * @param {!string} jwt A JWT token
 * @param {!Object} obj
 * @return {!Object}
 */
const jsonPostInit = (jwt, obj) => {
  const h = new Headers();
  h.append('Content-type', 'application/json');
  h.append('X-Requested-With', 'XMLHttpRequest');
  jwt && jwt !== '' && h.append('Authorization', `bearer ${jwt}`);
  return {
    cache: 'no-cache',
    method: 'POST',
    headers: h,
    credentials: 'include',
    body: JSON.stringify(obj),
  };
};


/**
 * @param {!string} jwt A JWT token
 * @param {!bad.ui.Form} formPanel
 * @return {!Object}
 */
const formPostInit = (jwt, formPanel) => {
  const h = new Headers();
  jwt && jwt !== '' && h.append('Authorization', `bearer ${jwt}`);
  h.append('X-Requested-With', 'XMLHttpRequest');
  return {
    cache: 'no-cache',
    method: 'POST',
    headers: h,
    body: new FormData(formPanel.getForm()),
    credentials: 'include'
  };
};


/**
 * @param {!string} jwt A JWT token
 * @return {!Object}
 */
const basicGetInit = jwt => {
  const h = new Headers();
  h.append('Authorization', `bearer ${jwt}`);
  h.append('X-Requested-With', 'XMLHttpRequest');
  return {cache: 'no-cache', headers: h, credentials: 'include'};
};


/**
 * A class to manage the setting and getting of permissions.
 * @param {?Object} data
 * @constructor
 */
bad.UserManager = function(data) {
  /**
   * @type {!bad.UserLike}
   * @private
   */
  this.user_ = {};

  /**
   * @type {!string}
   * @private
   */
  this.jwt = '';

  /**
   * @type {!Request}
   */
  this.JWTTokenRequest = new Request('/api/v3/tokens/login/');


  /**
   * @type {!Request}
   */
  this.loginRequest = new Request('/accounts/login/');

  if (data) {
    this.updateProfile_(data);
  }
};


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
 * @param {!Object} data
 * @return {!Promise}
 * @private
 */
bad.UserManager.prototype.updateProfile_ = function(data) {
  if (data['non_field_errors']) {
    return Promise.reject(new Error(`JWT ${data['non_field_errors']}`));
  } else {
    this.updateToken(data['token']);
    this.updateProfile(data['user']);
    return Promise.resolve('User Profile Updated');
  }
};


/**
 * @param {bad.UserLike} data
 */
bad.UserManager.prototype.updateProfile = function(data) {
  this.user_ = data;
};


/**
 * @param {string} t
 */
bad.UserManager.prototype.updateToken = function(t) {
  this.jwt = t;
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
 * @param {!bad.ui.Form} formPanel
 */
bad.UserManager.prototype.formSubmit = function(formPanel) {
  const req = new Request(formPanel.getUri().toString());
  const processSubmitReply = goog.bind(formPanel.processSubmitReply, formPanel);
  fetch(req, formPostInit(this.jwt, formPanel))
      .then(checkStatus)
      .then(getText)
      .then(processSubmitReply)
      .catch(err => console.error('Form submit error', err));
};


/**
 * @param {!goog.Uri} uri
 * @return {!Promise}
 */
bad.UserManager.prototype.fetch = function(uri) {
  const req = new Request(uri.toString());
  return fetch(req, basicGetInit(this.jwt))
      .then(checkStatus)
      .then(getText)
      .catch(err => console.error('UMan Text Fetch:', err));
};


/**
 * @param {!goog.Uri} uri
 * @return {!Promise}
 */
bad.UserManager.prototype.fetchJson = function(uri) {
  const req = new Request(uri.toString());
  return fetch(req, basicGetInit(this.jwt))
      .then(checkStatus)
      .then(getJson)
      .catch(err => console.error('UMan Json Fetch:', err));
};


/**
 * @param {!Object} cred
 * @param {!bad.ui.Form} formPanel
 * @param {!Function} onSuccess
 */
bad.UserManager.prototype.login = function(cred, formPanel, onSuccess) {
  let processAsFormPanel = goog.bind(formPanel.processSubmitReply, formPanel);
  let processJWTResponse = goog.bind(this.updateProfile_, this);

  // Get a JWT token
  const f1 = fetch(this.JWTTokenRequest, jsonPostInit(this.jwt, cred))
      .then(checkStatus)
      .then(getJson)
      .then(processJWTResponse);

  // Log into Django
  const f2 = fetch(this.loginRequest, formPostInit(this.jwt, formPanel))
      .then(checkStatus)
      .then(getText)
      .then(processAsFormPanel);

  // Only fire OK if both those came back OK
  Promise.all([f1, f2])
      .then(bothRes => onSuccess && onSuccess())
      .catch(err => console.error(`Some requests failed: ${err}`));

};

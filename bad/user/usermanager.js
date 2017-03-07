goog.provide('bad.UserManager');

goog.require('goog.net.cookies');
goog.require('goog.uri.utils');

const cookies = goog.net.cookies;

/**
 * The spinner should not be started or stopped by fetch calls while there
 * are other longer fetch calls in flight. To do that, we create a spinner
 * that only acts when it changes to and from 0
 * @return {function(!number)}
 */
const spinner = id => {
  /**
   * @type {!number}
   */
  let wrapped = 0;

  /**
   * {?Element|undefined}
   */
  let e;

  /**
   * @param {!number} v
   * @return {boolean}
   */
  const change = v => {
    const inc = v > 0;
    inc ? wrapped += 1 : wrapped -= 1;
    return inc ? wrapped === 1 : wrapped === 0;
  };

  return val => {
    e = e || document.getElementById(id);
    e && change(val) && e.classList.toggle('viz', wrapped > 0);
  };
};

const spin = spinner('the_loader');
const startSpin = () => Promise.resolve(spin(1));
const stopSpin = x => {
  spin(0);
  return Promise.resolve(x);
};


/**
 * @param {!Response} response
 * @return {!Promise}
 */
const checkStatus = response => {
  if (response.ok) {
    return Promise.resolve(response);
  } else {
    return Promise.reject(new Error(
        `${response.url} ${response.status} (${response.statusText})`));
  }
};


/**
 * @param {!bad.ui.Panel} panel
 * @return {!function(!Response):!Promise}
 */
const checkStatusTwo = panel => response => {
  const panelUri = panel.getUri().getPath().toString();
  const responseUri = goog.uri.utils.getPath(response.url);
  const isRedirected = panelUri !== responseUri;
  panel.setIsRedirected(isRedirected, responseUri);
  return checkStatus(response);
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
 * @param {!string} method One of PATCH, PUT, POST etc.
 * @return {!Object}
 */
const jsonInit = (jwt, obj, method = 'POST') => {
  const h = new Headers();
  h.append('Content-type', 'application/json');
  h.append('X-Requested-With', 'XMLHttpRequest');
  jwt && jwt !== '' && h.append('Authorization', `bearer ${jwt}`);
  return {
    cache: 'no-cache',
    method: method,
    headers: h,
    credentials: 'include',
    body: JSON.stringify(obj),
  };
};

/**
 * @param {!string} jwt A JWT token
 * @param {!Object} obj
 * @return {!Object}
 */
const jsonPostInit = (jwt, obj) => jsonInit(jwt, obj, 'POST');

/**
 * @param {!string} jwt A JWT token
 * @param {!Object} obj
 * @return {!Object}
 */
const jsonPatchInit = (jwt, obj) => jsonInit(jwt, obj, 'PATCH');

/**
 * @param {!string} jwt A JWT token
 * @param {!Object} obj
 * @return {!Object}
 */
const jsonPutInit = (jwt, obj) => jsonInit(jwt, obj, 'PUT');


/**
 * @param {!string} method PUT, POST, PATCH
 * @param {!string} jwt A JWT token
 * @param {!boolean} useDocumentCookies If set to true, we look for cookies
 *    in the document. In almost all cases where we are posting a form, this
 *    should be 'false' as the form itself carries the CSRF token.
 *    In cases where we are using AJAX, we need to grab the cookie from
 *    the document, so set this to 'true'
 * @return {!Object}
 */
const basicPutPostPatchInit = (method, jwt, useDocumentCookies=false) => {
  const h = new Headers();
  jwt && jwt !== '' && h.append('Authorization', `bearer ${jwt}`);
  h.append('X-Requested-With', 'XMLHttpRequest');
  if (useDocumentCookies) {
    const token = cookies.get('csrftoken');
    token && useDocumentCookies && h.append('X-CSRFToken', token);
  }
  return {
    cache: 'no-cache',
    method: method,
    headers: h,
    redirect: 'follow',  // This is anyway the default.
    credentials: 'include'
  };
};


/**
 * @param {!string} jwt A JWT token
 * @param {!boolean} useDocumentCookies
 * @return {!Object}
 */
const basicPostInit = (jwt, useDocumentCookies=true) => basicPutPostPatchInit(
  'POST', jwt, useDocumentCookies);


/**
 * @param {!string} jwt A JWT token
 * @param {!boolean} useDocumentCookies
 * @return {!Object}
 */
const basicPutInit = (jwt, useDocumentCookies=true) => basicPutPostPatchInit(
  'PUT', jwt, useDocumentCookies);


/**
 * @param {!string} jwt A JWT token
 * @param {!boolean} useDocumentCookies
 * @return {!Object}
 */
const basicPatchInit = (jwt, useDocumentCookies=true) => basicPutPostPatchInit(
  'PATCH', jwt, useDocumentCookies);


/**
 * @param {!string} jwt A JWT token
 * @param {!bad.ui.Form} formPanel
 * @return {!Object}
 */
const formPostInit = (jwt, formPanel) => {
  const useDocumentCookies = false;
  const resp = basicPostInit(jwt, useDocumentCookies);
  resp['body'] = new FormData(formPanel.getForm());
  return resp;
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
    this.updateProfileFromJwt(data).then(() => {});
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
bad.UserManager.prototype.updateProfileFromJwt = function(data) {
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
 * @return {!Promise}
 */
bad.UserManager.prototype.formSubmit = function(formPanel) {
  const req = new Request(formPanel.getUri().toString());
  const processSubmitReply = goog.bind(formPanel.processSubmitReply, formPanel);
  return startSpin()
    .then(() => fetch(req, formPostInit(this.jwt, formPanel)))
    .then(checkStatusTwo(formPanel))
    .then(stopSpin)
    .then(getText)
    .then(processSubmitReply)
    .catch(err => console.error('Form submit error', err));
};


/**
 * @param {!goog.Uri} uri
 * @return {!Promise}
 */
bad.UserManager.prototype.putPostPatchNobody = function(uri, init) {
  const req = new Request(uri.toString());
  return fetch(req, init)
    .then(checkStatus)
    .then(getText)
    .catch(err => console.error('Form submit error', err));
};


/**
 * @param {!goog.Uri} uri
 * @return {!Promise}
 */
bad.UserManager.prototype.putNoBody = function(uri) {
  return this.putPostPatchNobody(uri, basicPutInit(''))
};

/**
 * @param {!goog.Uri} uri
 * @return {!Promise}
 */
bad.UserManager.prototype.fetch = function(uri) {
  const req = new Request(uri.toString());
  return startSpin()
    .then(() => fetch(req, basicGetInit(this.jwt)))
    .then(checkStatus)
    .then(stopSpin)
    .then(getText)
    .catch(err => console.error('UMan Text Fetch:', err));
};

/**
 * Use this if you want to directly get a parsed template that does not go
 * through panel logic.
 * @param {!goog.Uri} uri
 * @return {!Promise}
 */
bad.UserManager.prototype.fetchAndSplit = function(uri) {
  return this.fetch(uri).then(bad.utils.handleTemplateProm)
};

/**
 * @param {!goog.Uri} uri
 * @return {!Promise}
 */
bad.UserManager.prototype.fetchJson = function(uri) {
  const req = new Request(uri.toString());
  return startSpin()
    .then(() => fetch(req, basicGetInit(this.jwt)))
    .then(checkStatus)
    .then(stopSpin)
    .then(getJson)
    .catch(err => console.error('UMan Json Fetch:', err));
};

/**
 * @param {!goog.Uri} uri
 * @return {!Promise}
 */
bad.UserManager.prototype.patchJson = function(uri, payload) {
  const req = new Request(uri.toString());
  return fetch(req, jsonPatchInit(this.jwt, payload))
      .then(checkStatus)
      .then(getJson)
      .catch(err => console.error('UMan Json Patch Fetch:', err));
};
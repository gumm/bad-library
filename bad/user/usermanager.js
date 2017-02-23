goog.provide('bad.UserManager');

goog.require('goog.net.cookies');
goog.require('goog.uri.utils');

const cookies = goog.net.cookies;


/**
 * @param {!Response} response
 * @return {!Promise}
 */
const checkStatus = response => {
  //  console.warn('This is a redirected response!!!', response.redirected);
  //  console.warn('This is the final url', response.url);
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
  if (response.ok) {
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
      .then(checkStatusTwo(formPanel))
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

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

};


/**
 * @param {!Function} cb
 */
bad.UserManager.prototype.setOnChangeCallback = function(cb) {
  this.fireChangeCb_ = cb;
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
  fetch(uri.toString())
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
 * @param {!Function=} opt_onSuccess
 * @param {!Function=} opt_onFail
 */
bad.UserManager.prototype.login = function(cred, opt_onSuccess, opt_onFail) {
  let updateProfile = goog.bind(function(d) {
    this.jwToken_ = d['token'];
    this.updateProfile(d['user']);
  }, this);
  fetch('./api/v3/tokens/login/', {
    method: 'post',
    headers: {'Content-type': 'application/json'},
    body: JSON.stringify(cred)
  })
      .then(response => {
        response.json()
            .then(data => {
              switch(response.status) {
                case 200:
                  updateProfile(data);
                  opt_onSuccess && opt_onSuccess(data);
                  break;
                case 400:
                  opt_onFail && opt_onFail(data);
                  break;
                default:
                  console.log(
                    'Looks like there was a problem. Status Code: ' +
                    response.status);
              }
            });
      })
      .catch(function(err) { console.log('Fetch Error :-S', err); });
};

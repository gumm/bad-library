goog.provide('bad.UserLike');
goog.provide('bad.UserManager');


/** @typedef {{
*     name: (string|undefined),
*     surname: (string|undefined),
*     email: (string|undefined),
*     user: (string|undefined),
*     _id: (string|undefined)
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
};


/**
 * @param {bad.UserLike} data
 */
bad.UserManager.prototype.updateProfile = function(data) {
  this.user_ = data;
};


/**
 * @return {string|undefined}
 */
bad.UserManager.prototype.getId = function() {
  return this.user_['_id'];
};


/**
 * @param {string} id
 */
bad.UserManager.prototype.setId = function(id) {
  this.user_['_id'] = id;
};


/**
 * @return {!bad.UserLike}
 */
bad.UserManager.prototype.getProfile = function() {
  return this.user_;
};


/**
 * @return {string|undefined}
 */
bad.UserManager.prototype.getName = function() {
  return this.getProfile()['name'];
};


/**
 * @return {string|undefined}
 */
bad.UserManager.prototype.getSurname = function() {
  return this.getProfile()['surname'];
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
 */
bad.UserManager.prototype.login = function(cred) {
  fetch('./api/v3/tokens/login/', {
    method: 'post',
    headers: {'Content-type': 'application/json'},
    body: JSON.stringify(cred)
  })
      .then(function(response) {
        if (response.status !== 200) {
          console.log(
              'Looks like there was a problem. Status Code: ' +
              response.status);
          return;
        }

        // Examine the text in the response
        response.json().then(function(data) { console.log(data); });
      })
      .catch(function(err) { console.log('Fetch Error :-S', err); });
};

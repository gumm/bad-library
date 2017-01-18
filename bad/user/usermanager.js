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
  var salutation = this.getName();
  var surname = this.getSurname();
  if (surname) {
    salutation = salutation + ' ' + surname;
  }
  return salutation;
};

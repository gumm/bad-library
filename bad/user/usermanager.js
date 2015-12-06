/**
 * Created by gumm on 2015/12/06.
 */

goog.provide('bad.UserManager');

/** @typedef {{
*     name: (null|string),
*     surname: (null|string),
*     email: (null|string),
*     user: (null|string)
*     }}
 */
bad.UserLike;

/**
 * A class to manage the setting and getting of permissions.
 * @constructor
 */
bad.UserManager = function() {
  /**
   * @type {bad.UserLike}
   * @private
   */
  this.user_ =  {
        name: null,
        surname: null,
        email: null,
        user: null
    }
};

bad.UserManager.prototype.updateProfile = function(data) {
  this.user_ = data;
};

bad.UserManager.prototype.getId = function() {
  return this.user_['_id'];
};

bad.UserManager.prototype.setId = function(id) {
  this.user_['_id'] = id;
};

bad.UserManager.prototype.getProfile = function() {
  return this.user_;
};

bad.UserManager.prototype.getName = function() {
  return this.getProfile()['name'];
};

bad.UserManager.prototype.getSurname = function() {
  return this.getProfile()['surname'];
};

bad.UserManager.prototype.getSalutation = function() {
  var salutation = this.getName();
  var surname = this.getSurname();
  if (surname) {
    salutation = salutation + ' ' + surname;
  }
  return salutation;
};


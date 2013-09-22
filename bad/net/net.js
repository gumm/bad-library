goog.provide('bad.Net');

goog.require('goog.net.XhrIo');

/**
 * A convenience wrapper around goog.xhrMananger
 * @param {!goog.net.XhrManager} xhrManager
 * @constructor
 */
bad.Net = function(xhrManager) {
  this.xhrMan_ = xhrManager;
};

/**
 * @return {!goog.net.XhrManager}
 */
bad.Net.prototype.getXhrMan = function() {
  return this.xhrMan_;
};

/**
 * @param {goog.Uri} url
 * @param {ArrayBuffer|Blob|Document|FormData|null|string|undefined} content
 * @param {Function=} opt_callback
 * @param {goog.net.XhrIo.ResponseType.<string>=} opt_responseType
 * @return {goog.net.XhrManager.Request}
 */
bad.Net.prototype.post =
  function(url, content, opt_callback, opt_responseType) {

    var uriString = url.toString();
    var id = this.makeId_(uriString);
    var responseType = opt_responseType || goog.net.XhrIo.ResponseType.TEXT;

    return this.xhrMan_.send(
      id,
      uriString,
      'POST',
      content,
      null,
      10,
      opt_callback,
      0,
      responseType);
  };

/**
 * @param {goog.Uri} url
 * @param {Function=} opt_callback
 * @param {goog.net.XhrIo.ResponseType.<string>=} opt_responseType
 * @return {goog.net.XhrManager.Request}
 */
bad.Net.prototype.get = function(url, opt_callback, opt_responseType) {

  var uriString = url.toString();
  var id = this.makeId_(uriString);
  var responseType = opt_responseType || goog.net.XhrIo.ResponseType.TEXT;

  return this.xhrMan_.send(
    id,
    uriString,
    'GET',
    null,
    null,
    10,
    opt_callback,
    0,
    responseType);
};

bad.Net.prototype.makeId_ = function(uriString) {
  return Math.floor(Math.random() * 2147483648).toString(36) + uriString;
};

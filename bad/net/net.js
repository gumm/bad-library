'use strict';

goog.provide('bad.Net');

goog.require('goog.Uri');
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
 * @param {Object|goog.structs.Map=} opt_headers Map of headers to add to the
 *     request.
 * @return {goog.net.XhrManager.Request}
 */
bad.Net.prototype.post =
  function(url, content, opt_callback, opt_responseType, opt_headers) {

    var headers = opt_headers || null;
    var uriString = url.toString();
    var id = this.makeId_(uriString);
    var responseType = opt_responseType || goog.net.XhrIo.ResponseType.TEXT;

    return this.xhrMan_.send(
      id,
      uriString,
      'POST',
      content,
      headers,
      10,
      opt_callback,
      0,
      responseType);
  };

/**
 * @param {goog.Uri} url
 * @param {ArrayBuffer|Blob|Document|FormData|null|string|undefined} content
 * @param {Function=} opt_callback
 * @param {goog.net.XhrIo.ResponseType.<string>=} opt_responseType
 * @param {Object|goog.structs.Map=} opt_headers Map of headers to add to the
 *     request.
 * @return {goog.net.XhrManager.Request}
 */
bad.Net.prototype.put =
  function(url, content, opt_callback, opt_responseType, opt_headers) {

    var headers = opt_headers || null;
    var uriString = url.toString();
    var id = this.makeId_(uriString);
    var responseType = opt_responseType || goog.net.XhrIo.ResponseType.TEXT;

    return this.xhrMan_.send(
      id,
      uriString,
      'PUT',
      content,
      headers,
      10,
      opt_callback,
      0,
      responseType);
  };

/**
 * @param {goog.Uri} url
 * @param {ArrayBuffer|Blob|Document|FormData|null|string|undefined} content
 * @param {Function=} opt_callback
 * @param {goog.net.XhrIo.ResponseType.<string>=} opt_responseType
 * @param {Object|goog.structs.Map=} opt_headers Map of headers to add to the
 *     request.
 * @return {goog.net.XhrManager.Request}
 */
bad.Net.prototype.del = function(url, content, opt_callback,
                                    opt_responseType, opt_headers) {

    var headers = opt_headers || null;
    var uriString = url.toString();
    var id = this.makeId_(uriString);
    var responseType = opt_responseType || goog.net.XhrIo.ResponseType.TEXT;

    return this.xhrMan_.send(
      id,
      uriString,
      'DELETE',
      content,
      headers,
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

// fetch function is implemented in order to follow the
// standard Adapter pattern
bad.Net.prototype.fetch = function(url) {

  // A small example of object
  var core = {

    // Method that performs the ajax request
    ajax : function (method, url, args) {

      // Creating a promise
      var promise = new Promise( function (resolve, reject) {

        // Instantiates the XMLHttpRequest
        var client = new XMLHttpRequest();
        var uri = url;

        if (args && (method === 'POST' || method === 'PUT')) {
          uri += '?';
          var argcount = 0;
          for (var key in args) {
            if (args.hasOwnProperty(key)) {
              if (argcount++) {
                uri += '&';
              }
              uri += encodeURIComponent(key) + '=' + encodeURIComponent(args[key]);
            }
          }
        }

        client.open(method, uri);
        client.send();

        client.onload = function () {
          if (this.status >= 200 && this.status < 300) {
            // Performs the function "resolve" when this.status is equal to 2xx
            resolve(this.response);
          } else {
            // Performs the function "reject" when this.status is different than 2xx
            reject(this.statusText);
          }
        };
        client.onerror = function () {
          reject(this.statusText);
        };
      });

      // Return the promise
      return promise;
    }
  };

  // Adapter pattern
  return {
    'get' : function(args) {
      return core.ajax('GET', url, args);
    },
    'post' : function(args) {
      return core.ajax('POST', url, args);
    },
    'put' : function(args) {
      return core.ajax('PUT', url, args);
    },
    'delete' : function(args) {
      return core.ajax('DELETE', url, args);
    }
  };
};

    //// B-> Here you define its functions and its payload
    //var mdnAPI = 'https://developer.mozilla.org/en-US/search.json';
    //var payload = {
    //  'topic' : 'js',
    //  'q'     : 'Promise'
    //};
    //
    //var callback = {
    //  success : function(data){
    //     console.log(1, 'success', JSON.parse(data));
    //  },
    //  error : function(data){
    //     console.log(2, 'error', JSON.parse(data));
    //  }
    //};
    //// End B
    //
    //// Executes the method call
    //$http(mdnAPI)
    //  .get(payload)
    //  .then(callback.success)
    //  .catch(callback.error);
    //
    //// Executes the method call but an alternative way (1) to handle Promise Reject case
    //$http(mdnAPI)
    //  .get(payload)
    //  .then(callback.success, callback.error);
    //
    //// Executes the method call but an alternative way (2) to handle Promise Reject case
    //$http(mdnAPI)
    //  .get(payload)
    //  .then(callback.success)
    //  .then(undefined, callback.error);

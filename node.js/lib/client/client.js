/*
 * client.js: Client for the RESTful provisioner service.
 *
 * (C) 2010, Nodejitsu Inc.
 *
 */
 
var events = require('events'),
    utile = require('utile'),
    request = require('request'),
    base64 = utile.base64;

//
// ### function Client (options)
// #### @options {Object} Options to use for this instance.
// Constructor function for the Client to the Nodejitsu provisioner server.
//
var Client = exports.Client = function (options) {
  events.EventEmitter.call(this);
  this.options = options || {};
    
  if (typeof this.options.get !== 'function') {
    this.options.get = function (key) {
      return this[key];
    };
  }
  
  // 
  // TODO (indexzero): Configure the provisioner port globally somewhere.
  //
  this.config = {
    host: options.host || 'localhost',
    port: options.port || 9000,
    protocol: options.protocol || 'http',
    rejectUnauthorized: options.rejectUnauthorized,
    proxy: options.proxy,
    auth: options.auth,
    cert: options.cert,
    key: options.key
  };
  
  if (options.auth && options.auth.username && options.auth.password) {
    this._auth = 'Basic ' + base64.encode([options.auth.username, options.auth.password].join(':'));
  }
};

//
// Inherit from `events.EventEmitter`
//
utile.inherits(Client, events.EventEmitter);

// Failure HTTP Response codes based
// off of `/lib/composer/provisioner/service.js`
Client.prototype.failCodes = {
  400: 'Bad Request',
  401: 'Not authorized',
  403: 'Forbidden',
  404: 'Item not found',
  409: 'Conflict',
  500: 'Internal Server Error'
};

// Success HTTP Response codes based
// off of `/lib/composer/provisioner/service.js`
Client.prototype.successCodes = {
  200: 'OK',
  201: 'Created'
};

//
// ### @remoteUri {string}
// Full URI for the remote Haibu server this client
// is configured to request against.
//
Client.prototype.__defineGetter__('remoteUri', function () {
  return (this.config.protocol || 'http') + '://' + this.config.host + ':' + this.config.port;
});

//
// ### @private _request (method, uri, [body], callback, success)
// #### @options {Object} Outgoing request options.
// #### @callback {function} Continuation to short-circuit to if request is unsuccessful.
// #### @success {function} Continuation to call if the request is successful
// Core method for making requests against the haibu Drone API. Flexible with respect
// to continuation passing given success and callback.
//
Client.prototype._request = function (options, callback, success) {
  var self = this;
  
  if (typeof options === 'string') {
    options = { path: options };
  }
  
  options.method  = options.method || 'GET';
  options.uri     = this.remoteUri + options.path;
  options.headers = options.headers || {};
  options.headers['content-type'] = options.headers['content-type'] || 'application/json';
    
  if (!this._auth && this.config.auth.username && this.config.auth.password) {
    this._auth = 'Basic ' + base64.encode([this.config.auth.username, this.config.auth.password].join(':'));
  }
  
  if (this._auth) {
    options.headers['Authorization'] = this._auth;
  }
  
  if (this.config.proxy) {
    options.proxy = this.proxy;
  }

  if (this.config.cert && this.config.key) {
    options.key = this.config.key;
    options.cert = this.config.cert;
  }

  if (typeof this.config.rejectUnauthorized !== 'undefined') {
    options.rejectUnauthorized = this.config.rejectUnauthorized;
  }

  if (options.headers['content-type'] === 'application/json'
    && options.body) {
    options.body = JSON.stringify(options.body);
  }

  //
  // Emit options for debug purpose
  //
  this.emit('debug::request', options);

  //
  // Helper function for checking response codes
  //
  function isOk(err, res, body) {
    if (err) {
      return callback(err);
    }

    var statusCode = res.statusCode.toString(),
        error;

    //
    //  Emit response for debug purpose
    //
    self.emit('debug::response', { statusCode: statusCode, result: body });

    if (Object.keys(self.failCodes).indexOf(statusCode) !== -1) {
      error = new Error('composer Error (' + statusCode + '): ' + self.failCodes[statusCode]);
      if (body) {
        try { error.result = JSON.parse(body) }
        catch (ex) {}
      }
      error.status = res.statusCode;
      callback(error);
      return false
    }

    return true;
  }

  if (success) {
    return request(options, function onComplete(err, res, body) {
      if (!isOk(err, res, body)) {
        return;
      }

      var result;

      try { result = JSON.parse(body) }
      catch (ex) { }

      //
      //  Emit response for debug purpose
      //
      self.emit('debug::response', { statusCode: res.statusCode, result: result });

      success(res, result);
    });
  }

  //
  // If no `success` function is supplied then
  // just return the raw `request` stream, but check
  // the response against any `failCodes`.
  //
  return request(options)
    .on('response', isOk.bind(null, null));
};

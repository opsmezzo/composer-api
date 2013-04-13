/*
 * config.js: Client for the `config` resource.
 *
 * (C) 2010, Nodejitsu Inc.
 *
 */
 
var utile = require('utile'),
    client = require('./client');

//
// ### function Config (options)
// #### @options {Object} Options to use for this instance.
// Constructor function for the Config client to the Conservatory REST API.
//
var Config = exports.Config = function (options) {
  client.Client.call(this, options);
};

//
// Inherit from `client.Client`
//
utile.inherits(Config, client.Client);

//
// ### function create (name, env, callback)
// #### @name {string} Name of the environment to create.
// #### @env {Object} Env settings to create.
// #### @callback {function} Continuation to pass control back to when complete.
// Creates the specified `env`.
//
Config.prototype.create = function (name, env, callback) {
  if (typeof env === 'function') {
    callback = env;
    env = {};
  }

  this._request({
    method: 'POST', 
    path: '/config/' + name, 
    body: env
  }, callback, function (res, result) {
    callback(null, result);
  });
};

//
// ### function get (name, callback)
// #### @name {string} Name of the env to retrieve.
// #### @callback {function} Continuation to pass control back to when complete.
// Responds with information about the env with the specified `name`.
//
Config.prototype.get = function (name, callback) {
  this._request('/config/' + name, callback, function (res, result) {
    callback(null, result.config);
  });
};

//
// ### function list (callback)
// #### @callback {function} Continuation to pass control back to when complete.
// Lists all config managed by the provisioner associated with this instance. 
//
Config.prototype.list = function (callback) {
  this._request('/config', callback, function (res, result) {
    callback(null, result.config);
  });
};

//
// ### function destroy (name)
// #### @name {object} Name of the env to destroy.
// #### @callback {function} Continuation to pass control back to when complete.
// Destroys the Env for the server with the specified name.
//
Config.prototype.destroy = function (name, callback) {
  this._request({
    method: 'DELETE', 
    path: '/config/' + name
  }, callback, function (res, result) {
    callback(null, result);
  });
};

//
// ### function set (name, path, value, callback)
// #### @name {string} Name of the environment to set the `value` in.
// #### @path {Array} Key path in the `settings` for `value`
// #### @value {*} Value to set
// #### @callback {function} Continuation to respond to when complete.
//
// Sets the `value` at the key `path` in the environment with the specified
// name.
//
Config.prototype.set = function (name, key, value, callback) {
  this._request({
    method: 'PUT',
    path: '/config/' + name + '/' + key,
    body: value
  }, callback, function (res, result) {
    callback(null, result);
  });
};

//
// ### function clear (name, path, callback)
// #### @name {string} Name of the environment to set the `value` in.
// #### @path {Array} Key path in the `settings` to clear
// #### @callback {function} Continuation to respond to when complete.
//
// Clears the key `path` in the environment with the specified name.
//
Config.prototype.clear = function (name, key, callback) {
  this._request({
    method: 'DELETE',
    path: '/config/' + name + '/' + key
  }, callback, function (res, result) {
    callback(null, result);
  });
};

//
// ### function servers (group, callback)
// #### @group {string} **Optional** Group to fetch server config for
// #### @callback {function} Continuation to respond to when complete.
//
// Gets the server configuration for the specified `group` (if any).
//
Config.prototype.servers = function (group, callback) {
  if (!callback && typeof group === 'function') {
    callback = group;
    group = null;
  }

  this._request({
    method: 'GET',
    path: '/' + ['config', 'servers', group].filter(Boolean).join('/')
  }, callback, function (res, result) {
    callback(null, result);
  });
};

/*
 * users.js: Client for the composer `users` resource.
 *
 * (C) 2010, Nodejitsu Inc.
 *
 */
 
var utile = require('utile'),
    client = require('./client');

//
// ### function Users (options)
// #### @options {Object} Options to use for this instance.
// Constructor function for the Users client to the 
// Conservatory provisioner server.
//
var Users = exports.Users = function (options) {
  client.Client.call(this, options);
};

//
// Inherit from `client.Client`
//
utile.inherits(Users, client.Client);

//
// ### function auth (callback)
// #### @callback {function} Continuation to pass control to when complete
// Tests the authentication of the user identified in this process.
//
Users.prototype.auth = function (callback) {
  this._request('/auth', callback, function (res, body) {
    callback(null, true);
  });
};

//
// ### function create (user, callback)
// #### @user {string} User to create.
// #### @callback {function} Continuation to pass control back to when complete.
// Creates a user with the data specified.
//
Users.prototype.create = function (user, callback) {
  this._request({
    method: 'POST', 
    path: '/users/' + user.username, 
    body: user
  }, callback, function (res, result) {
    callback(null, result);
  });
};

//
// ### function get (name, callback)
// #### @name {string} Name of the user to retrieve.
// #### @callback {function} Continuation to pass control back to when complete.
// Responds with information about the user with the specified `name`.
//
Users.prototype.get = function (name, callback) {
  this._request('/users/' + name, callback, function (res, result) {
    callback(null, result.user);
  });
};

//
// ### function list (callback)
// #### @callback {function} Continuation to pass control back to when complete.
// Lists all users managed by the provisioner associated with this instance. 
//
Users.prototype.list = function (callback) {
  this._request('/users', callback, function (res, result) {
    callback(null, result.users);
  });
};

//
// ### function update (user, callback)
// #### @user {object} Properties to update the user with.
// #### @callback {function} Continuation to pass control back to when complete.
// Updates the user with the properties specified.
//
Users.prototype.update = function (user, callback) {
  this._request({
    method: 'PUT', 
    path: '/users/' + (user._id || user.username),
    body: user
  }, callback, function (res, result) {
    callback(null, result);
  });
};

//
// ### function destroy (name)
// #### @name {object} Name of the user to destroy.
// #### @callback {function} Continuation to pass control back to when complete.
// Destroys the Group for the server with the specified name.
//
Users.prototype.destroy = function (name, callback) {
  this._request({
    method: 'DELETE', 
    path: '/users/' + name
  }, callback, function (res, result) {
    callback(null, result);
  });
};

//
// ### function available (username, callback) 
// #### @username {string} Username to check availability for.
// #### @callback {function} Continuation to pass control to when complete
// Checks the availability of the specified `username`.
//
Users.prototype.available = function (username, callback) {
  this._request('/users/' + username + '/available', callback, function (res, result) {
    callback(null, result);
  });
};

//
// ### function forgot (username, callback) 
// #### @username {Object} username requesting password reset.
// #### @params {Object} Object containing shake and new password, if applicable.
// #### @callback {function} Continuation to pass control to when complete
// Request an password reset email.
//
Users.prototype.forgot = function (username, params, callback) {
  if (!callback && typeof params == 'function') {
    callback = params;
    params = {};
  }

  this._request({
    method: 'POST', 
    path: '/users/' + username + '/forgot', 
    body: params
  }, callback, function (res, result) {
    return callback(null, result);
  });
};

//
// ### function addKey | updateKey (name, keyname, data, callback)
// #### @name {string} Name of the user to add or update keys for.
// #### @keyname {string} **Optional** Keyname to add or update.
// #### @data {string} Data for the key
// #### @callback {function} Continuation to respond to when complete.
// Adds or updates `keyname` for the specified user `name` with the `data`.
// If no `keyname` is supplied then `publicKey` will be used.
//
Users.prototype.addKey = Users.prototype.updateKey = function (name, keyname, data, callback) {
  if (arguments.length === 3) {
    callback = data;
    data = keyname;
    keyname = 'publicKey';
  }
  
  this._request({
    method: 'PUT', 
    path: '/' + ['users', name, 'keys', keyname].join('/'), 
    body: { key: data }
  }, callback, function (res, result) {
    callback(null);
  });
};

//
// ### function getKey (name, keyname, data, callback)
// #### @name {string} Name of the user to add or update keys for.
// #### @keyname {string} **Optional** Keyname to add or update.
// #### @callback {function} Continuation to respond to when complete.
// Retrieves `keyname` for the specified user `name`. If no `keyname` is supplied 
// then `publicKey` will be retrieved.
//
Users.prototype.getKey = function (name, keyname, callback) {
  if (arguments.length === 2) {
    callback = keyname;
    keyname = 'publicKey';
  }
  
  this._request('/' + ['users', name, 'keys', keyname].join('/'), callback, function (res, result) {
    callback(null, result && result.key);
  });
};

//
// ### function getKeys (name, callback)
// #### @name {string} **Optional** Name of the user to get all keys for.
// #### @callback {function} Continuation to respond to when complete.
// Retrieves all keys for the user with the specified `name`. If no `name`
// is supplied then all keys for all users will be returned.
//
Users.prototype.getKeys = function (name, callback) {
  if (!callback && typeof name === 'function') {
    callback = name;
    name = null;
  }
  
  this._request('/' + ['keys', name].filter(Boolean).join('/'), callback, function (res, result) {
    callback(null, result && result.keys);
  });
};

//
// ### function servers (name, callback)
// #### @name {string} **Optional** Name of the user to get servers created by.
// #### @callback {function} Continuation to respond to when complete.
// Retrieves all servers created by the user with the specified `name`.
//
Users.prototype.servers = function (name, callback) {
  if (!callback && typeof name === 'function') {
    callback = name;
    return callback(new Error('username is required.'))
  }

  this._request('/' + ['users', name, 'servers'].join('/'), callback, function (res, result) {
    callback(null, (result && result.servers) || []);
  });
};
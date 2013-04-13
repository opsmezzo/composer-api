/*
 * systems.js: Client for the `systems` resource.
 *
 * (C) 2010, Nodejitsu Inc.
 *
 */
 
var utile = require('utile'),
    client = require('./client');

//
// ### function Systems (options)
// #### @options {Object} Options to use for this instance.
// Constructor function for the Systems client to the Conservatory REST API.
//
var Systems = exports.Systems = function (options) {
  client.Client.call(this, options);
};

//
// Inherit from `client.Client`
//
utile.inherits(Systems, client.Client);

//
// ### function create (system, callback)
// #### @system {Object} System to create.
// #### @callback {function} Continuation to pass control back to when complete.
// Creates the specified `system`.
//
Systems.prototype.create = function (system, callback) {
  this._request({
    method: 'POST', 
    path: '/systems/' + system.name, 
    body: system
  }, callback, function (res, result) {
    callback(null, result);
  });
};

//
// ### function get (name, callback)
// #### @name {string} Name of the system to retrieve.
// #### @callback {function} Continuation to pass control back to when complete.
// Responds with information about the system with the specified `name`.
//
Systems.prototype.get = function (name, callback) {
  this._request('/systems/' + name, callback, function (res, result) {
    callback(null, result.system);
  });
};

//
// ### function list (callback)
// #### @callback {function} Continuation to pass control back to when complete.
// Lists all systems managed by the provisioner associated with this instance. 
//
Systems.prototype.list = function (callback) {
  this._request('/systems', callback, function (res, result) {
    callback(null, result.systems);
  });
};

//
// ### function destroy (name)
// #### @name {object} Name of the system to destroy.
// #### @callback {function} Continuation to pass control back to when complete.
// Destroys the System for the server with the specified name.
//
Systems.prototype.destroy = function (name, callback) {
  this._request({
    method: 'DELETE', 
    path: '/systems/' + name
  }, callback, function (res, result) {
    callback(null, result);
  });
};

//
// ### function removeVersion (name, version, callback)
// #### @name {string} Name of the system to remove `version`.
// #### @version {string} Version to remove from the system
// #### @callback {function} Continuation to pass control back to when complete.
// Removes the `version` from the specified `system`.
//
Systems.prototype.removeVersion = function (name, version, callback) {
  this._request({
    method: 'DELETE', 
    path: '/systems/' + name + '/' + version
  }, callback, function (res, result) {
    callback(null, result);
  });
};

//
// ### function addVersion (system, callback)
// #### @system {object} Properties for the new system version.
// #### @callback {function} Continuation to pass control back to when complete.
// Adds the version represented by `system` to the system.
//
Systems.prototype.addVersion = function (system, callback) {
  this._request({
    method: 'PUT', 
    path: '/systems/' + (system._id || system.name),
    body: system
  }, callback, function (res, result) {
    callback(null, result);
  });  
};

//
// ### function removeOwner (name, owners, callback)
// #### @name {string} Name of the system to remove owners from.
// #### @owners {string|Array} Owners to remove from the system
// #### @callback {function} Continuation to pass control back to when complete.
// Removes the `owners` from the system with the specified `name`.
//
Systems.prototype.removeOwner = function (name, owners, callback) {
  owners = typeof owners === 'string'
    ? [owners]
    : owners;

  this._request({
    method: 'DELETE',
    path: '/systems/' + name + '/owners',
    body: owners
  }, callback, function (res, result) {
    callback(null, result);
  });
};

//
// ### function addOwner (name, owners, callback)
// #### @name {string} Name of the system to add owners to.
// #### @owners {string|Array} Owners to add to the system
// #### @callback {function} Continuation to pass control back to when complete.
// Adds the `owners` to the system with the specified `name`.
//
Systems.prototype.addOwner = function (name, owners, callback) {
  owners = typeof owners === 'string'
    ? [owners]
    : owners;

  this._request({
    method: 'PUT',
    path: '/systems/' + name + '/owners',
    body: owners
  }, callback, function (res, result) {
    callback(null, result);
  });
};

//
// ### function upload (name, version, callback)
// #### @name {string} Name of the system to upload.
// #### @version {string} Version of the system to upload.
// #### @callback {function} Continuation to pass control back to when complete.
// Returns an HTTP stream for uploading the `version` to the `system`.
//
Systems.prototype.upload = function (name, version, callback) {
  return this._request({
    method: 'PUT', 
    path: '/systems/' + name + '/' + version, 
    headers: { 'content-type': 'application/x-tar-gz' }
  }, callback, function (res, result) {
    callback(null, res);
  });
};

//
// ### function download (name, version, callback)
// #### @name {string} Name of the system to download.
// #### @version {string} Version of the system to download.
// #### @callback {function} Continuation to pass control back to when complete.
// Returns an HTTP stream for downloading the `version` from the `system`.
//
Systems.prototype.download = function (name, version, callback) {
  var responded,
      request;

  //
  // Helper function for checking multiple
  // return conditions.
  //
  function respond() {
    if (!responded) {
      responded = true;
      if (callback) {
        callback.apply(null, arguments);
      }
    }
  }

  request = this._request('/systems/' + name + '/' + version, respond)
    .on('error', respond);

  if (callback) {
    request
      .on('response', function (res_) { res = res_ })
      .on('end', function () { respond(null, res) });
  }

  return request;
};
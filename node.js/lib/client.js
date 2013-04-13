/*
 * client.js: Top-level include for the provisioner API client.
 *
 * (C) 2010, Nodejitsu Inc.
 *
 */
 
exports.Client  = require('./client/client').Client;
exports.Config  = require('./client/config').Config;
exports.Systems = require('./client/systems').Systems;
exports.Users   = require('./client/users').Users;

exports.createClient = function (options) {
  return {
    config:  new exports.Config(options),
    systems: new exports.Systems(options),
    users:   new exports.Users(options)
  };
};

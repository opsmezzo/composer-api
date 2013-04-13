# composer-api/node.js

The node.js composer-api library enables access to the RESTful API for [`composer`](https://github.com/nodejitsu/composer).

## Example:

```js
var composer = require('composer-api');

var client = composer.createClient({
  host: 'api.nodejitsu.com',
  port: 80,
  auth: {
    username: 'charlie',
    password: 'foobar',
  }
});

client.groups.list(function (err, result) {
  if (err) {
    console.log(err);
    return;
  }
  
  console.log(JSON.stringify(result, null, 2, true));
});
```

## Usage:

### api.createClient(options)

This method sets up a client for connecting to `composer`. Here's a minimal example for connecting to composer as `charlie`:

``` js
var client = composer.createClient({
  host: 'api.nodejitsu.com',
  port: 80,
  auth: {
    username: 'charlie',
    password: 'foobar',
  }
});
```

The options object contains three required properties:

* `auth.username`: The username for your composer account
* `auth.password`: The password for your composer account
* `host`: The api host (typically http://composer.nodejitsu.com.

### client

Method calls are generally structured as `resource` and `action`.

``` js
client.resource.action("data", function (err, result) {
  if (err) {
    throw err;
  }

  //
  // use the result
  //
});
```

Most actions take a string argument and a callback, though a few actions only take a callback.

The client's methods are reflective of [`composer`](https://github.com/opsmezzo/composer/tree/master/lib/resources) resources. Here's a broad overview:

* **client.config**: Manage your composer accounts. Methods include:
  * `config.create`
  * `config.get`
  * `config.list`
  * `config.update`
  * `config.destroy`
* **client.system**: Manage your composer accounts. Methods include:
  * `system.create`
  * `system.get`
  * `system.list`
  * `system.update`
  * `system.destroy`
  * `system.removeVersion`
  * `system.addVersion`
  * `system.addOwner`
  * `system.removeOwner`
  * `system.upload`
  * `system.download`
* **client.users**: Manage your composer accounts. Methods include:
  * `users.create`
  * `users.get`
  * `users.list`
  * `users.update`
  * `users.destroy`
  * `users.getKey`
  * `users.getKeys`
  * `users.addKey`
  * `users.updateKey`

## Installation

This library may be installed using npm:

``` bash
  $ npm install composer-api
```

## Tests
All tests are included in [`composer`](https://github.com/opsmezzo/composer/tree/master/tests) to facilitate integration tests and to avoid the need for complex mocking.

## License
Proprietary. Copyright (c) 2011 Nodejitsu Inc.

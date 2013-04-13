var fs = require('fs'),
    path = require('path'),
    https = require('https'),
    assert = require('assert'),
    cb = require('assert-called'),
    conservatory = require('../');

var fixtures = path.join(__dirname, 'fixtures'),
    servers = [ { name: 'slave-a0' } ];

var server = https.createServer({
  key: fs.readFileSync(path.join(fixtures, 'https-server.key')),
  cert: fs.readFileSync(path.join(fixtures, 'https-server.crt')),
  requestCert: true
}, cb(function (req, res) {
  var cert = req.connection.getPeerCertificate();

  assert.equal(req.url, '/servers');

  assert.equal(cert.subject.O, 'Nodejitsu, Inc.');
  assert.equal(cert.issuer.O, 'Nodejitsu, Inc.');

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.write(JSON.stringify({
    servers: servers
  }));
  res.end();

  server.close();
})).listen(8443, cb(function () {
  var client = conservatory.createClient('provisioner', {
    auth: {
      username: 'mmalecki',
      password: 'foobar'
    },
    host: 'localhost',
    protocol: 'https',
    rejectUnauthorized: false,
    port: 8443,
    key: fs.readFileSync(path.join(__dirname, 'fixtures', 'https-client.key')),
    cert: fs.readFileSync(path.join(__dirname, 'fixtures', 'https-client.crt'))
  });

  client.servers.list(function (err, data) {
    assert(!err);
    assert.deepEqual(data, servers);
  });
}));

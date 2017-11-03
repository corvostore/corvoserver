var net = require('net');

var client = new net.Socket();
client.connect(6379, '127.0.0.1', function() {
  console.log('Connected');
  // client.write('*3\r\n$3\r\nSET\r\n$1\r\nz\r\n$3\r\nabc\r\n');
  // client.write('*4\r\n$3\r\nSET\r\n$1\r\nz\r\n$3\r\ndef\r\n$2\r\nXX\r\n');
  // client.write('*2\r\n$3\r\nGET\r\n$1\r\nz\r\n');

  // client.write('*4\r\n$3\r\nSET\r\n$1\r\nz\r\n$3\r\nghi\r\n$2\r\nNX\r\n');
  // client.write('*4\r\n$3\r\nSET\r\n$1\r\ny\r\n$3\r\nghi\r\n$2\r\nNX\r\n');
  // client.write('*2\r\n$3\r\nGET\r\n$1\r\ny\r\n');

  // parse error
  // client.write('*0\r\n$3\r\nGET\r\n$1\r\nz\r\n');

  // invalid command
  client.write('*2\r\n$3\r\nZET\r\n$1\r\nz\r\n');
  
});

client.on('data', function(data) {
  console.log('Received: ' + data);
  client.destroy(); // kill client after server's response
});

client.on('close', function() {
  console.log('Connection closed');
});

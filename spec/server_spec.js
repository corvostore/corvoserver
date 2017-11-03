import Store from '../store.js';
import CorvoServer from '../corvo_server.js';
import Net from 'net';

describe("CorvoServer", () => {
  function runClient(request, expectedVal) {
    const client = new Net.Socket();
    client.connect(6379, '127.0.0.1', function() {
      client.setEncoding('utf8');
      client.write(request);
    });

    client.on('data', function(data) {
      expect(data).toBe(expectedVal);
      client.destroy(); // kill client after server's response
    });
  }

  it("exists as a class", () => {
    const server = new CorvoServer();
    expect(server.constructor).toBe(CorvoServer);
  });

  it("instantiates a store", () => {
    const server = new CorvoServer();
    expect(server.store.constructor).toBe(Store);
  });

  it("returns (nil) for GET command with non-existant key", () => {
    const request = '*2\r\n$3\r\nGET\r\n$1\r\nz\r\n';
    const expectedVal = '(nil)';
    runClient(request, expectedVal);
  });

  it("returns OK for SET command", () => {
    const request = '*3\r\n$3\r\nSET\r\n$1\r\nz\r\n$1\r\nv\r\n';
    const expectedVal = 'OK';
    runClient(request, expectedVal);
  });

  it("returns (nil) for SET NX if key already exists", () => {
    const setRequest = '*3\r\n$3\r\nSET\r\n$1\r\nx\r\n$1\r\nv\r\n';
    const setNXRequest = '*4\r\n$3\r\nSET\r\n$1\r\ny\r\n$1\r\nz\r\n$2\r\nNX\r\n';
    const expectedVal = '(nil)';
    runClient(setRequest);
    runClient(setNXRequest, expectedVal);
  });
});

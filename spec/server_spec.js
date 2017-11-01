import Store from '../store.js';
import CorvoServer from '../corvo_server.js';

describe("CorvoServer", () => {
  it("exists as a class", () => {
    const server = new CorvoServer();
    expect(server.constructor).toBe(CorvoServer);
  });

  it("instantiates a store", () => {
    const server = new CorvoServer();
    expect(server.store.constructor).toBe(Store);
  });

});

// describe("Server test", () => {
//   let server;
//   beforeEach(function() {
//     server = new CorvoServer();
//   });
//   afterEach(function() {
//     server.tempServer.close();
//   });
//
//   it("starts a server", () => {
//     let started = false;
//     server.tempServer.on('listening', function() {
//       started = true;
//     });
//     server.startServer();
//     expect(started).toBe(true);
//   });
//
// });

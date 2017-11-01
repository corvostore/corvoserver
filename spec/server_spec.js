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

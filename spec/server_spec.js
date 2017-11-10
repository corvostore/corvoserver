import Store from '../store.js';
import CorvoServer from '../corvo_server.js';
import Net from 'net';

describe("CorvoServer", () => {
  it("exists as a class", () => {
    const server = new CorvoServer();
    expect(server.constructor).toBe(CorvoServer);
  });

  it("instantiates a store", () => {
    const server = new CorvoServer();
    expect(server.store.constructor).toBe(Store);
  });

  it("prepareRespReturn returns Resp response for a null", () => {
    const corvoServer = new CorvoServer();
    expect(corvoServer.prepareRespReturn(null)).toBe("$-1\r\n");
  });

  it("prepareRespReturn returns Resp response for an empty string", () => {
    const corvoServer = new CorvoServer();
    expect(corvoServer.prepareRespReturn("")).toBe("$0\r\n\r\n");
  });

  it("prepareRespReturn returns Resp response for a string", () => {
    const corvoServer = new CorvoServer();
    expect(corvoServer.prepareRespReturn("some-str")).toBe("+some-str\r\n");
  });

  it("prepareRespReturn returns Resp response for a number", () => {
    const corvoServer = new CorvoServer();
    expect(corvoServer.prepareRespReturn(345)).toBe(":345\r\n");
  });

  it("prepareRespReturn returns Resp response for an empty array", () => {
    const corvoServer = new CorvoServer();
    expect(corvoServer.prepareRespReturn([])).toBe("*0\r\n");
  });

  it("prepareRespReturn returns Resp response for an array", () => {
    const corvoServer = new CorvoServer();
    const arr = ['abc', 22, 'defghi'];
    const response = "*3\r\n$3\r\nabc\r\n:22\r\n$6\r\ndefghi\r\n";
    expect(corvoServer.prepareRespReturn(arr)).toBe(response);
  });

  // it("returns (nil) for GET command with non-existant key", () => {
  //   const request = '*2\r\n$3\r\nGET\r\n$1\r\nz\r\n';
  //   const expectedVal = '(nil)';
  //   runClient(request, expectedVal);
  // });
  //
  // it("returns OK for SET command", () => {
  //   const request = '*3\r\n$3\r\nSET\r\n$1\r\nz\r\n$1\r\nv\r\n';
  //   const expectedVal = 'OK';
  //   runClient(request, expectedVal);
  // });
  //
  // it("returns (nil) for SET NX if key already exists", () => {
  //   const setRequest = '*3\r\n$3\r\nSET\r\n$1\r\nx\r\n$1\r\nv\r\n';
  //   const setNXRequest = '*4\r\n$3\r\nSET\r\n$1\r\ny\r\n$1\r\nz\r\n$2\r\nNX\r\n';
  //   const expectedVal = '(nil)';
  //   runClient(setRequest);
  //   runClient(setNXRequest, expectedVal);
  // });
});

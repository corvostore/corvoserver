import { commandMap, Parser } from '../parser';

describe("Parser", () => {
  it("processes incoming GET command", () => {
    const command = '*2\r\n$3\r\nGET\r\n$1\r\nk\r\n';
    const result = Parser.convertRespStringToTokens(command);

    expect(result).toEqual(["GET", "k"]);
  });

  it("processes incoming SET command", () => {
    const command = '*3\r\n$3\r\nSET\r\n$1\r\nk\r\n$5\r\n10000\r\n';
    const result = Parser.convertRespStringToTokens(command);

    expect(result).toEqual(["SET", "k", "10000"]);
  });

  it("process incoming SET XX command", () => {
    const command = '*4\r\n$3\r\nSET\r\n$1\r\nk\r\n$5\r\n10000\r\n$2\r\nXX\r\n';
    const result = Parser.convertRespStringToTokens(command);

    expect(result).toEqual(['SET', 'k', '10000', 'XX']);
  });

  it("process incoming SET NX command", () => {
    const command = '*4\r\n$3\r\nSET\r\n$1\r\nk\r\n$5\r\n10000\r\n$2\r\nNX\r\n';
    const result = Parser.convertRespStringToTokens(command);

    expect(result).toEqual(['SET', 'k', '10000', 'NX']);
  });

  it("process incoming APPEND command", () => {
    const command = '*3\r\n$6\r\nAPPEND\r\n$1\r\nk\r\n$5\r\n10000\r\n';
    const result = Parser.convertRespStringToTokens(command);

    expect(result).toEqual(['APPEND', 'k', '10000']);
  });

  it("process incoming TOUCH command", () => {
    const command = '*2\r\n$5\r\nTOUCH\r\n$1\r\nk\r\n';
    const result = Parser.convertRespStringToTokens(command);

    expect(result).toEqual(['TOUCH', 'k']);
  });

  it("process incoming STRLEN command", () => {
    const command = '*2\r\n$6\r\nSTRLEN\r\n$1\r\nk\r\n';
    const result = Parser.convertRespStringToTokens(command);

    expect(result).toEqual(['STRLEN', 'k']);
  });

  it("process incoming INCR command", () => {
    const command = '*3\r\n$4\r\nINCR\r\n$1\r\nk\r\n\$2\r\n10\r\n';
    const command2 = '*2\r\n$4\r\nINCR\r\n$1\r\nk\r\n';
    const result = Parser.convertRespStringToTokens(command);
    const result2 = Parser.convertRespStringToTokens(command2);

    expect(result).toEqual(['INCR', 'k', '10']);
    expect(result2).toEqual(['INCR', 'k']);
  });

  it("process incoming DECR command", () => {
    const command = '*3\r\n$4\r\nDECR\r\n$1\r\nk\r\n\$2\r\n10\r\n';
    const command2 = '*2\r\n$4\r\nDECR\r\n$1\r\nk\r\n';
    const result = Parser.convertRespStringToTokens(command);
    const result2 = Parser.convertRespStringToTokens(command2);

    expect(result).toEqual(['DECR', 'k', '10']);
    expect(result2).toEqual(['DECR', 'k']);
  });

  it("command without CRLF suffix throws error", () => {
    const command = '*2\r\n$3\r\nGET\r\n$1\r\nk';
    const errorMessage = "ParserError: doesn't have CRLF suffix.";

    expect(function() { Parser.convertRespStringToTokens(command) }).toThrow(new Error(errorMessage));
  });

  it("command without * after first CRLF throws error", () => {
    const command = '2\r\n$3\r\nGET\r\n$1\r\nk\r\n';
    const errorMessage = "ParserError: doesn't start with *.";

    expect(function() { Parser.convertRespStringToTokens(command) }).toThrow(new Error(errorMessage));
  });

  it("command with mismatch between specified number of elements and actual number of elements throws error", () => {
    const command = '*10\r\n$3\r\nGET\r\n$1\r\nk\r\n';
    const errorMessage = "ParserError: mismatch between specified number of elements and actual number of elements";

    expect(function() { Parser.convertRespStringToTokens(command) }).toThrow(new Error(errorMessage));
  });

  it("command with non-number after * throws error", () => {
    const command = '*Z\r\n$3\r\nGET\r\n$1\r\nk\r\n';
    const errorMessage = "ParserError: * followed by non-number.";

    expect(function() { Parser.convertRespStringToTokens(command) }).toThrow(new Error(errorMessage));
  });

  it("throws error if no $ when reading length of n+1th element in RespArray", () => {
    const command = '*2\r\n3\r\nGET\r\n$1\r\nk\r\n';
    const errorMessage = "$ sign expected when reading length of array elem 1";

    expect(function() { Parser.convertRespStringToTokens(command) }).toThrow(new Error(errorMessage));
  });

  it("throws error if non-number following $ when reading length of n+1th element in RespArray", () => {
    const command = '*2\r\n$Z\r\nGET\r\n$1\r\nk\r\n';
    const errorMessage = "non-number following $ for array elem 1";

    expect(function() { Parser.convertRespStringToTokens(command) }).toThrow(new Error(errorMessage));
  });

  it("length of string at (idx+2)th location not matching the expected length specified with $", () => {
    const command = '*2\r\n$3\r\nGET\r\n$1\r\nmyKey\r\n';
    const errorMessage = "mismatch between length of RespArray element and element itself at elem 4";

    expect(function() { Parser.convertRespStringToTokens(command) }).toThrow(new Error(errorMessage));
  });

  it("commandMap returns an object", () => {
    expect(commandMap.constructor).toBe(Object);
  });

  it("processIncomingString returns an object", () => {
    const command = '*2\r\n$3\r\nGET\r\n$1\r\nk\r\n';
    expect(Parser.processIncomingString(command)).toEqual({
      isValid: true,
      error: "",
      tokens: ['GET', 'k']
    });
  });
});

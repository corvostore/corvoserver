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
    expect(Parser.processIncomingString(command)).toEqual(['GET', 'k']);
  });

  it("throws an error if number of arguments for GET command is not valid", () => {
    const command = '*1\r\n$3\r\nGET\r\n';
    const errorMessage = "ParseError: Wrong number of arguments for GET command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("throws an error if flag is invalid for SET command", () => {
    const command = '*4\r\n$3\r\nSET\r\n$1\r\nk\r\n$1\r\n2\r\n$2\r\nXN\r\n';
    const errorMessage = "ParseError: syntax error - invalid flag on SET command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("returns array of tokens for valid flag for SET command", () => {
    const command = '*4\r\n$3\r\nSET\r\n$1\r\nk\r\n$1\r\n2\r\n$2\r\nNX\r\n';

    expect(Parser.processIncomingString(command)).toEqual(['SET', 'k', '2', 'NX']);
  });

  it("throws an error if number of arguments for SET command is not valid", () => {
    const command = '*1\r\n$3\r\nSET\r\n';
    const errorMessage = "ParseError: Wrong number of arguments for SET command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("returns array of tokens for valid number of arguments for SET command", () => {
    const command = '*3\r\n$3\r\nSET\r\n$1\r\nk\r\n$1\r\n2\r\n';
    expect(Parser.processIncomingString(command)).toEqual(['SET', 'k', '2']);
  });

  it("returns an error if number of arguments for APPEND command is more than expected", () => {
    const command = '*4\r\n$6\r\nAPPEND\r\n$1\r\na\r\n$1\r\n1\r\n$3\r\naaa\r\n';
    const errorMessage = "ParseError: Wrong number of arguments for APPEND command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("throws an error if number of arguments for APPEND command is less than expected", () => {
    const command = '*1\r\n$6\r\nAPPEND\r\n';
    const errorMessage = "ParseError: Wrong number of arguments for APPEND command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("returns array of tokens for valid APPEND command", () => {
    const command = '*3\r\n$6\r\nAPPEND\r\n$1\r\nk\r\n$1\r\n2\r\n';
    expect(Parser.processIncomingString(command)).toEqual(['APPEND', 'k', '2']);
  });

  it("throws an error if number of arguments for STRLEN command is less than expected", () => {
    const command = '*1\r\n$6\r\nSTRLEN\r\n';
    const errorMessage = "ParseError: Wrong number of arguments for STRLEN command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("returns array of tokens for valid STRLEN command", () => {
    const command = '*2\r\n$6\r\nSTRLEN\r\n$1\r\nk\r\n';
    expect(Parser.processIncomingString(command)).toEqual(['STRLEN', 'k']);
  });

  it("throws an error if number of arguments for TOUCH command is not valid", () => {
    const command = '*1\r\n$5\r\nTOUCH\r\n';
    const errorMessage = "ParseError: Wrong number of arguments for TOUCH command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("returns array of tokens for valid TOUCH command", () => {
    const command = '*2\r\n$5\r\nTOUCH\r\n$1\r\nk\r\n';
    expect(Parser.processIncomingString(command)).toEqual(['TOUCH', 'k']);
  });

  it("throws an error if number of arguments for INCR command is not valid", () => {
    const command = '*1\r\n$4\r\nINCR\r\n';
    const errorMessage = "ParseError: Wrong number of arguments for INCR command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("returns array of tokens for valid INCR command", () => {
    const command = '*2\r\n$4\r\nINCR\r\n$1\r\nk\r\n';
    expect(Parser.processIncomingString(command)).toEqual(['INCR', 'k']);
  });

  it("throws an error if number of arguments for DECR command is not valid", () => {
    const command = '*1\r\n$4\r\nDECR\r\n';
    const errorMessage = "ParseError: Wrong number of arguments for DECR command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("returns array of tokens for valid DECR command", () => {
    const command = '*2\r\n$4\r\nDECR\r\n$1\r\nk\r\n';
    expect(Parser.processIncomingString(command)).toEqual(['DECR', 'k']);
  });

  it("throws an error if number of arguments for EXISTS command is not valid", () => {
    const command = '*3\r\n$6\r\nEXISTS\r\n$1\r\nk\r\n$1\r\nv\r\n';
    const errorMessage = "ParseError: Wrong number of arguments for EXISTS command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("returns array of tokens for valid EXISTS command", () => {
    const command = '*2\r\n$6\r\nEXISTS\r\n$1\r\nk\r\n';
    expect(Parser.processIncomingString(command)).toEqual(['EXISTS', 'k']);
  });

  it("throws an error if number of arguments for RENAME command is not valid", () => {
    const command = '*4\r\n$6\r\nRENAME\r\n$1\r\nk\r\n$1\r\nv\r\n$4\r\nblah\r\n';
    const errorMessage = "ParseError: Wrong number of arguments for RENAME command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("returns array of tokens for valid RENAME command", () => {
    const command = '*3\r\n$6\r\nRENAME\r\n$2\r\nkA\r\n$2\r\nkB\r\n';
    expect(Parser.processIncomingString(command)).toEqual(['RENAME', 'kA', 'kB']);
  });

  it("throws an error if number of arguments for RENAMEX command is not valid", () => {
    const command = '*2\r\n$8\r\nRENAMENX\r\n$1\r\nk\r\n';
    const errorMessage = "ParseError: Wrong number of arguments for RENAMENX command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("returns array of tokens for valid RENAMENX command", () => {
    const command = '*3\r\n$8\r\nRENAMENX\r\n$1\r\nk\r\n$1\r\na\r\n';
    expect(Parser.processIncomingString(command)).toEqual(['RENAMENX', 'k', 'a']);
  });

  it("throws an error if number of arguments for TYPE command is not valid", () => {
    const command = '*3\r\n$4\r\nTYPE\r\n$1\r\nk\r\n$1\r\na\r\n';
    const errorMessage = "ParseError: Wrong number of arguments for TYPE command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("returns array of tokens for valid TYPE command", () => {
    const command = '*2\r\n$4\r\nTYPE\r\n$1\r\nk\r\n';
    expect(Parser.processIncomingString(command)).toEqual(['TYPE', 'k']);
  });

  it("throws an error if number of arguments for DEL command is not valid", () => {
    const command = '*1\r\n$3\r\nDEL\r\n';
    const errorMessage = "ParseError: Wrong number of arguments for DEL command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("returns array of tokens for valid DEL command", () => {
    const command = '*2\r\n$3\r\nDEL\r\n$1\r\nk\r\n';
    expect(Parser.processIncomingString(command)).toEqual(['DEL', 'k']);
  });

  it("throws an error if number of arguments for LINDEX command is not valid", () => {
    const command = '*2\r\n$6\r\nLINDEX\r\n$1\r\nk\r\n';
    const errorMessage = "ParseError: Wrong number of arguments for LINDEX command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("returns array of tokens for valid LINDEX command", () => {
    const command = '*3\r\n$6\r\nLINDEX\r\n$1\r\nk\r\n$1\r\n1\r\n';
    expect(Parser.processIncomingString(command)).toEqual(['LINDEX', 'k', '1']);
  });

  it("throws an error if number of arguments for LREM command is not valid", () => {
    const command = '*2\r\n$4\r\nLREM\r\n$1\r\nk\r\n';
    const errorMessage = "ParseError: Wrong number of arguments for LREM command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("returns array of tokens for valid LREM command", () => {
    const command = '*4\r\n$4\r\nLREM\r\n$1\r\nk\r\n$1\r\n1\r\n$1\r\n1\r\n';
    expect(Parser.processIncomingString(command)).toEqual(['LREM', 'k', '1', '1']);
  });

  it("throws an error if number of arguments for LLEN command is not valid", () => {
    const command = '*1\r\n$4\r\nLLEN\r\n';
    const errorMessage = "ParseError: Wrong number of arguments for LLEN command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("returns array of tokens for valid LLEN command", () => {
    const command = '*2\r\n$4\r\nLLEN\r\n$1\r\nk\r\n';
    expect(Parser.processIncomingString(command)).toEqual(['LLEN', 'k']);
  });

  it("throws an error if number of arguments for LINSERT command is not valid", () => {
    const command = '*2\r\n$7\r\nLINSERT\r\n$1\r\nk\r\n';
    const errorMessage = "ParseError: Wrong number of arguments for LINSERT command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("returns array of tokens for valid LINSERT command", () => {
    const command = '*5\r\n$7\r\nLINSERT\r\n$1\r\nk\r\n$6\r\nBEFORE\r\n$1\r\n1\r\n$1\r\n1\r\n';
    expect(Parser.processIncomingString(command)).toEqual(['LINSERT', 'k', 'BEFORE', '1', '1']);
  });

  it("throws an error if flag is invalid for LINSERT command", () => {
    const command = '*5\r\n$7\r\nLINSERT\r\n$1\r\nk\r\n$1\r\nX\r\n$1\r\n1\r\n$1\r\n1\r\n';
    const errorMessage = "ParseError: syntax error - invalid flag on LINSERT command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("throws an error if number of arguments for LPUSH command is not valid", () => {
    const command = '*2\r\n$5\r\nLPUSH\r\n$1\r\nk\r\n';
    const errorMessage = "ParseError: Wrong number of arguments for LPUSH command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("returns array of tokens for valid LPUSH command", () => {
    const command = '*3\r\n$5\r\nLPUSH\r\n$1\r\nk\r\n$1\r\nv\r\n';
    expect(Parser.processIncomingString(command)).toEqual(['LPUSH', 'k', 'v']);
  });

  it("throws an error if number of arguments for RPUSH command is not valid", () => {
    const command = '*2\r\n$5\r\nRPUSH\r\n$1\r\nk\r\n';
    const errorMessage = "ParseError: Wrong number of arguments for RPUSH command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("returns array of tokens for valid RPUSH command", () => {
    const command = '*3\r\n$5\r\nRPUSH\r\n$1\r\nk\r\n$1\r\nv\r\n';
    expect(Parser.processIncomingString(command)).toEqual(['RPUSH', 'k', 'v']);
  });

  it("throws an error if number of arguments for LPOP command is not valid", () => {
    const command = '*3\r\n$4\r\nLPOP\r\n$1\r\nk\r\n$1\r\nk\r\n';
    const errorMessage = "ParseError: Wrong number of arguments for LPOP command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("returns array of tokens for valid LPOP command", () => {
    const command = '*2\r\n$4\r\nLPOP\r\n$1\r\nk\r\n';
    expect(Parser.processIncomingString(command)).toEqual(['LPOP', 'k']);
  });

  it("throws an error if number of arguments for RPOP command is not valid", () => {
    const command = '*3\r\n$4\r\nRPOP\r\n$1\r\nk\r\n$1\r\nk\r\n';
    const errorMessage = "ParseError: Wrong number of arguments for RPOP command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("returns array of tokens for valid RPOP command", () => {
    const command = '*2\r\n$4\r\nRPOP\r\n$1\r\nk\r\n';
    expect(Parser.processIncomingString(command)).toEqual(['RPOP', 'k']);
  });

  it("returns array of tokens for valid HDEL command", () => {
    const command = '*2\r\n$4\r\nHDEL\r\n$1\r\nk\r\n';
    expect(Parser.processIncomingString(command)).toEqual(['HDEL', 'k']);
  });

  it("returns array of tokens for valid HGET command", () => {
    const command = '*2\r\n$4\r\nHGET\r\n$1\r\nk\r\n';
    expect(Parser.processIncomingString(command)).toEqual(['HGET', 'k']);
  });

  it("returns array of tokens for valid HGETALL command", () => {
    const command = '*2\r\n$7\r\nHGETALL\r\n$1\r\nk\r\n';
    expect(Parser.processIncomingString(command)).toEqual(['HGETALL', 'k']);
  });

  it("returns array of tokens for valid HLEN command", () => {
    const command = '*2\r\n$4\r\nHLEN\r\n$1\r\nk\r\n';
    expect(Parser.processIncomingString(command)).toEqual(['HLEN', 'k']);
  });

  it("throws an error if number of arguments for HDEL command is not valid", () => {
    const command = '*3\r\n$4\r\nHDEL\r\n$1\r\nk\r\n$1\r\nk\r\n';
    const errorMessage = "ParseError: Wrong number of arguments for HDEL command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("throws an error if number of arguments for HGET command is not valid", () => {
    const command = '*3\r\n$4\r\nHGET\r\n$1\r\nk\r\n$1\r\nk\r\n';
    const errorMessage = "ParseError: Wrong number of arguments for HGET command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("throws an error if number of arguments for HGETALL command is not valid", () => {
    const command = '*3\r\n$7\r\nHGETALL\r\n$1\r\nk\r\n$1\r\nk\r\n';
    const errorMessage = "ParseError: Wrong number of arguments for HGETALL command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });

  it("throws an error if number of arguments for HLEN command is not valid", () => {
    const command = '*3\r\n$4\r\nHLEN\r\n$1\r\nk\r\n$1\r\nk\r\n';
    const errorMessage = "ParseError: Wrong number of arguments for HLEN command";
    expect(function() { Parser.processIncomingString(command) }).toThrow(new Error(errorMessage));
  });
});

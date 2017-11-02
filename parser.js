class Parser {

  static processSetRequest(tokens) {
    if (tokens.length === 4) {
      const flag = tokens[3].toUpperCase();
      if (flag !== 'NX' && flag !== 'XX') {
        throw new Error("ParseError: syntax error - invalid flag on SET command");
      } else {
        return tokens;
      }
    } else if (tokens.length === 3) {
      return tokens;
    } else {
      throw new Error("ParseError: Wrong number of arguments for SET command");
    }
  }

  static processGetRequest(tokens) {
    if (tokens.length === 2) {
      return tokens;
    } else {
      throw new Error("ParseError: Wrong number of arguments for GET command");
    }
  }

  static processAppendRequest(tokens) {
    if (tokens.length === 3) {
      return tokens;
    } else {
      throw new Error("ParseError: Wrong number of arguments for APPEND command");
    }
  }

  static processStrlenRequest(tokens) {
    if (tokens.length === 2) {
      return tokens;
    } else {
      throw new Error("ParseError: Wrong number of arguments for STRLEN command");
    }
  }

  static processTouchRequest(tokens) {
    if (tokens.length >= 2) {
      return tokens;
    } else {
      throw new Error("ParseError: Wrong number of arguments for TOUCH command");
    }
  }

  static processIncrRequest(tokens) {
    if (tokens.length === 2) {
      return tokens;
    } else {
      throw new Error("ParseError: Wrong number of arguments for INCR command");
    }
  }

  static processDecrRequest(tokens) {
    if (tokens.length === 2) {
      return tokens;
    } else {
      throw new Error("ParseError: Wrong number of arguments for DECR command");
    }
  }

  static processExistsRequest(tokens) {
    if (tokens.length ===  2) {
      return tokens;
    } else {
      throw new Error("ParseError: Wrong number of arguments for EXISTS command");
    }
  }

  static processRenameRequest(tokens) {
    if (tokens.length === 3) {
      return tokens;
    } else {
      throw new Error("ParseError: Wrong number of arguments for RENAME command");
    }
  }

  static processRenameNXRequest(tokens) {
    if (tokens.length === 3) {
      return tokens;
    } else {
      throw new Error("ParseError: Wrong number of arguments for RENAMENX command");
    }
  }

  static processTypeRequest(tokens) {
    if (tokens.length === 2) {
      return tokens;
    } else {
      throw new Error("ParseError: Wrong number of arguments for TYPE command");
    }
  }

  static chomp(s) {
    return s.slice().replace(/[\n|\r]*$/, '');
  }

  static convertRespStringToTokens(s) {
    let numElems = 0;

    if(!s.endsWith('\r\n')) {
      throw new Error("ParserError: doesn't have CRLF suffix.");
    }

    s = this.chomp(s);
    let stringArray = s.split('\r\n');

    if (stringArray[0][0] !== '*') {
      throw new Error("ParserError: doesn't start with *.");
    } else {
      const numElemsStr = stringArray[0].slice(1);
      if (numElemsStr.match(/[^0-9]/)) {
        throw new Error("ParserError: * followed by non-number.");
      } else {
        numElems = parseInt(numElemsStr);
      }
    }

    if ((numElems * 2) !== (stringArray.length - 1)) {
      throw new Error("ParserError: mismatch between specified number of elements and actual number of elements");
    } else {
      return this.processRespArrayElems(numElems, stringArray.slice(1));
    }
  }

  static processRespArrayElems(numElems, stringArray) {
    const tokens = [];
    for (let idx = 0; idx < (numElems * 2); idx += 2) {
      const arrayLengthElem = stringArray[idx];
      const arrayStringElem = stringArray[idx + 1];
      let expectedStringLength;

      if (arrayLengthElem[0] !== '$') {
        throw new Error("$ sign expected when reading length of array elem " + (idx + 1));
      } else {
        const numElemsStr = stringArray[idx].slice(1);
        if (numElemsStr.match(/[^0-9]/)) {
          throw new Error("non-number following $ for array elem " + (idx + 1));
        } else {
          expectedStringLength = parseInt(numElemsStr);
        }

        if (arrayStringElem.length !== expectedStringLength) {
          throw new Error("mismatch between length of RespArray element and element itself at elem " + (idx + 2));
        } else {
          tokens.push(arrayStringElem);
        }
      }
    }

    return tokens;
  }

  static processIncomingString(s) {
    const tokens = this.convertRespStringToTokens(s);
    const command = tokens[0].toUpperCase();

    return commandMap[command](tokens);
  }
}

const commandMap = {
  'GET': Parser.processGetRequest,
  'SET': Parser.processSetRequest,
  'APPEND': Parser.processAppendRequest,
  'STRLEN': Parser.processStrlenRequest,
  'TOUCH': Parser.processTouchRequest,
  'INCR': Parser.processIncrRequest,
  'DECR': Parser.processDecrRequest,
  'EXISTS': Parser.processExistsRequest,
  'RENAME': Parser.processRenameRequest,
  'RENAMENX': Parser.processRenameNXRequest,
  'TYPE': Parser.processTypeRequest
};

export { commandMap, Parser };

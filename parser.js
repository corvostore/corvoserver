import ParserError from './parser_error';

class Parser {
  static processSetRequest(tokens) {
    if (tokens.length === 4) {
      const flag = tokens[3].toUpperCase();
      if (flag !== 'NX' && flag !== 'XX') {
        throw new ParserError("ParseError: syntax error - invalid flag on SET command");
      } else {
        return tokens;
      }
    } else if (tokens.length === 3) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for SET command");
    }
  }

  static processGetRequest(tokens) {
    if (tokens.length === 2) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for GET command");
    }
  }

  static processAppendRequest(tokens) {
    if (tokens.length === 3) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for APPEND command");
    }
  }

  static processStrlenRequest(tokens) {
    if (tokens.length === 2) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for STRLEN command");
    }
  }

  static processTouchRequest(tokens) {
    if (tokens.length >= 2) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for TOUCH command");
    }
  }

  static processIncrRequest(tokens) {
    if (tokens.length === 2) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for INCR command");
    }
  }

  static processDecrRequest(tokens) {
    if (tokens.length === 2) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for DECR command");
    }
  }

  static processExistsRequest(tokens) {
    if (tokens.length ===  2) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for EXISTS command");
    }
  }

  static processRenameRequest(tokens) {
    if (tokens.length === 3) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for RENAME command");
    }
  }

  static processRenameNXRequest(tokens) {
    if (tokens.length === 3) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for RENAMENX command");
    }
  }

  static processTypeRequest(tokens) {
    if (tokens.length === 2) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for TYPE command");
    }
  }

  static processDelRequest(tokens) {
    if (tokens.length >= 2) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for DEL command");
    }
  }

  static processLINDEXRequest(tokens) {
    if (tokens.length === 3) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for LINDEX command");
    }
  }

  static processLREMRequest(tokens) {
    if (tokens.length === 4) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for LREM command");
    }
  }

  static processLLENRequest(tokens) {
    if (tokens.length === 2) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for LLEN command");
    }
  }

  static processLINSERTRequest(tokens) {
    if (tokens.length === 5) {
      const flag = tokens[2].toUpperCase();
      if (flag !== 'BEFORE' && flag !== 'AFTER') {
        throw new ParserError("ParseError: syntax error - invalid flag on LINSERT command");
      } else {
        return tokens;
      }
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for LINSERT command");
    }
  }

  static processLPUSHRequest(tokens) {
    if (tokens.length >= 3) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for LPUSH command");
    }
  }

  static processRPUSHRequest(tokens) {
    if (tokens.length === 3) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for RPUSH command");
    }
  }

  static processLPOPRequest(tokens) {
    if (tokens.length === 2) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for LPOP command");
    }
  }

  static processRPOPRequest(tokens) {
    if (tokens.length === 2) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for RPOP command");
    }
  }

  static processLSETRequest(tokens) {
    if (tokens.length === 4) {
      return tokens;
    } else {
      throw new Error("ParseError: Wrong number of arguments for LSET command");
    }
  }

  static processHSETRequest(tokens) {
    if (tokens.length === 4) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for HSET command");
    }
  }

  static processHVALSRequest(tokens) {
    if (tokens.length === 2) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for HVALS command");
    }
  }

  static processHSTRLENRequest(tokens) {
    if (tokens.length === 3) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for HSTRLEN command");
    }
  }

  static processHMSETRequest(tokens) {
    if (tokens.length >= 4 && tokens.length % 2 === 0) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for HMSET command");
    }
  }

  static processHDELRequest(tokens) {
    if (tokens.length >= 3) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for HDEL command");
    }
  }

  static processHGETRequest(tokens) {
    if (tokens.length === 3) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for HGET command");
    }
  }

  static processHGETALLRequest(tokens) {
    if (tokens.length === 2) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for HGETALL command");
    }
  }

  static processHLENRequest(tokens) {
    if (tokens.length === 2) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for HLEN command");
    }
  }

  static processHSETNXRequest(tokens) {
    if (tokens.length === 4) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for HSETNX command");
    }
  }

  static processHMGETRequest(tokens) {
    if (tokens.length >= 3) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for HMGET command");
    }
  }

  static processHINCRBYRequest(tokens) {
    if (tokens.length === 4) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for HINCRBY command");
    }
  }

  static processHKEYSRequest(tokens) {
    if (tokens.length === 2) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for HKEYS command");
    }
  }

  static processZINTERSTORERequest(tokens) {
    if (tokens.length >= 4) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for ZINTERSTORE command");
    }
  }

  static processZUNIONSTORERequest(tokens) {
    if (tokens.length >= 4) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for ZUNIONSTORE command");
    }
  }

  static processZADDRequest(tokens) {
    if (tokens.length >= 4) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for ZADD command");
    }
  }

  static processZREMRequest(tokens) {
    if (tokens.length >= 3) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for ZREM command");
    }
  }

  static processZCARDRequest(tokens) {
    if (tokens.length === 2) {
      return tokens;
    } else {
      throw new ParserError("ParseError: Wrong number of arguments for ZCARD command");
    }
  }

  static checkArgsCombination(tokens) {
    const scoreIdx = tokens[tokens.length - 2];
    const scoreVal = tokens[scoreIdx];
    // score must be string representation of floating-point number
    if (isNaN(parseFloat(scoreVal, 10))) {
      throw new ParserError("ParseError: Invalid score value for ZADD command");
    }
    const flags = tokens.slice(2, scoreIdx);
    if (flags.length > 3) {
      throw new ParserError("ParseError: Invalid number of flags for ZADD command");
    }

    for (let i = 0; i < flags.length; i++) {
      if (['NX', 'CH', 'INCR'].indexOf(flags[i]) < 0 && ['XX', 'CH', 'INCR'].indexOf(flags[i]) < 0 && ['nx', 'ch', 'incr'].indexOf(flags[i]) < 0 && ['xx', 'ch', 'incr'].indexOf(flags[i]) < 0)  {
        throw new ParserError("ParseError: Invalid flag or flags for ZADD command");
      }
    }
    return tokens;
  }

  static chomp(s) {
    return s.slice().replace(/[\n|\r]*$/, '');
  }

  static convertRespStringToTokens(s) {
    let numElems = 0;

    if(!s.endsWith('\r\n')) {
      throw new ParserError("ParserError: doesn't have CRLF suffix.");
    }

    s = this.chomp(s);
    let stringArray = s.split('\r\n');

    if (stringArray[0][0] !== '*') {
      throw new ParserError("ParserError: doesn't start with *.");
    } else {
      const numElemsStr = stringArray[0].slice(1);
      if (numElemsStr.match(/[^0-9]/)) {
        throw new ParserError("ParserError: * followed by non-number.");
      } else {
        numElems = parseInt(numElemsStr);
      }
    }

    if ((numElems * 2) !== (stringArray.length - 1)) {
      throw new ParserError("ParserError: mismatch between specified number of elements and actual number of elements");
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
        throw new ParserError("$ sign expected when reading length of array elem " + (idx + 1));
      } else {
        const numElemsStr = stringArray[idx].slice(1);
        if (numElemsStr.match(/[^0-9]/)) {
          throw new ParserError("non-number following $ for array elem " + (idx + 1));
        } else {
          expectedStringLength = parseInt(numElemsStr);
        }

        if (arrayStringElem.length !== expectedStringLength) {
          throw new ParserError("mismatch between length of RespArray element and element itself at elem " + (idx + 2));
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

    if (!commandMap[command]) {
      throw new ParserError("ParserError: Invalid command.");
    }

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
  'TYPE': Parser.processTypeRequest,
  'DEL': Parser.processDelRequest,
  'LINDEX': Parser.processLINDEXRequest,
  'LREM': Parser.processLREMRequest,
  'LLEN': Parser.processLLENRequest,
  'LINSERT': Parser.processLINSERTRequest,
  'LPUSH': Parser.processLPUSHRequest,
  'RPUSH': Parser.processRPUSHRequest,
  'LPOP': Parser.processLPOPRequest,
  'RPOP': Parser.processRPOPRequest,
  'LSET': Parser.processLSETRequest,
  'HSET': Parser.processHSETRequest,
  'HVALS': Parser.processHVALSRequest,
  'HSTRLEN': Parser.processHSTRLENRequest,
  'HMSET': Parser.processHMSETRequest,
  'HDEL': Parser.processHDELRequest,
  'HGET': Parser.processHGETRequest,
  'HGETALL': Parser.processHGETALLRequest,
  'HLEN': Parser.processHLENRequest,
  'HSETNX': Parser.processHSETNXRequest,
  'HMGET': Parser.processHMGETRequest,
  'HINCRBY': Parser.processHINCRBYRequest,
  'HKEYS': Parser.processHKEYSRequest,
  'ZINTERSTORE': Parser.processZINTERSTORERequest,
  'ZUNIONSTORE': Parser.processZUNIONSTORERequest,
  'ZADD': Parser.processZADDRequest,
  'ZREM': Parser.processZREMRequest,
  'ZCARD': Parser.processZCARDRequest,
};

export { commandMap, Parser };

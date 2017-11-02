class Parser {

  static processSetRequest() {

  }

  static commandProcessor() {
    return commandProcessor;
  }

  static processGetRequest(tokens) {
    if (tokens.length === 2) {
      return {
        isValid: true,
        error: "",
        tokens
      }
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
    let result;

    switch(command) {
      case 'GET':
        result = this.processGetRequest(tokens);
        break;
    }
    return result;
  }
}

const commandMap = {
  'GET': Parser.processGetRequest,
  'SET': Parser.processSetRequest
};

export { commandMap, Parser };

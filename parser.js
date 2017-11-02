class Parser {
  static processSetRequest() {

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
    let idx = 0;
    let numElems = 0;

    const isCRLFSuffixed = s.endsWith('\r\n');
    s = this.chomp(s);
    let stringArray = s.split('\r\n');

    if (stringArray[0][0] !== '*') {
      // error: invalid incoming string, does not start with *
    } else {
      const numElemsStr = stringArray[0].slice(1);
      if (numElemsStr.match(/[^0-9]/)) {
        // error: invalid number following *
      } else {
        numElems = parseInt(numElemsStr);
      }
    }

    if ((numElems * 2) !== (stringArray.length - 1)) {
      // error: mismtach between number of elements specified and actual number
      // of elements
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
        // error: $ sign expected when reading length of (idx+1)th array elem
      } else {
        const numElemsStr = stringArray[idx].slice(1);
        if (numElemsStr.match(/[^0-9]/)) {
          // error: invalid number following $ for (idx+1)th array elem
        } else {
          expectedStringLength = parseInt(numElemsStr);
        }

        if (arrayStringElem.length !== expectedStringLength) {
          // error: length of string at (idx+2)th location not matching the
          // expected length specified with $.
        } else {
          tokens.push(arrayStringElem);
        }
      }
    }

    return tokens;
  }

  static processIncomingString(s) {
    // const tokens = this.chomp(s).split(' ');
    const tokens = convertRespStringToTokens(s);
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

export default Parser;

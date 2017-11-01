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

  static processIncomingString(s) {
    const tokens = this.chomp(s).split(' ');
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

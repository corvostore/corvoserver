import Store from './store';
import { Parser } from './parser';
import Net from 'net';

const DEFAULT_PORT = 6379;
const DEFAULT_HOST = '127.0.0.1';

class CorvoServer {
  constructor() {
    this.store = new Store();
    this.storeCommandMap = {
      'GET': this.store.getString,
      'APPEND': this.store.appendString,
      'STRLEN': this.store.getStrLen,
      'TOUCH': this.store.touch,
      'INCR': this.store.strIncr,
      'DECR': this.store.strDecr,
      'EXISTS': this.store.exists,
      'RENAME': this.store.rename,
      'RENAMENX': this.store.renameNX,
      'TYPE': this.store.type,
      'DEL': this.store.del,
    };
  }

  startServer() {
    const server = Net.createServer();
    server.on('connection', this.handleConnection.bind(this));

    server.listen(DEFAULT_PORT, DEFAULT_HOST, function() {
        console.log('server listening to %j', server.address());
      });
  }

  handleConnection(conn) {
    conn.setEncoding('utf8');
    conn.on('data', function(data) {
      console.log("data =", data);
      try {
        const tokens = Parser.processIncomingString(data);
        const command = tokens[0];
        let result;

        if (command === 'SET') {
          if (tokens.length > 3) {
            // add code to accommodate expiry later
            const flag = tokens[tokens.length - 1];

            if (flag === 'NX') {
              result = this.store.setStringNX(...tokens.slice(1));
            } else if (flag === 'XX') {
              result = this.store.setStringX(...tokens.slice(1));
            }
          } else {
            result = this.store.setString(...tokens.slice(1));
          }
        } else if (this.storeCommandMap[command]) {
          result = this.storeCommandMap[command].apply(this.store, tokens.slice(1));
        } else {
          result = "ParserError: Invalid Command.";
        }
        const newResult = !!result ? "" + result : "(nil)";
        conn.write(newResult);
      } catch(err) {
        const result = err.message;
        conn.write(result);
      }
    }.bind(this));
  };

}

export default CorvoServer;

import Net from 'net';
import Store from './store';
import { Parser } from './parser';
import ParserError from './parser_error';
import StoreError from './store_error';

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
      'LINDEX': this.store.lindex,
      'LREM': this.store.lrem,
      'LLEN': this.store.llen,
      'LPUSH': this.store.lpush,
      'RPUSH': this.store.rpush,
      'LPOP': this.store.lpop,
      'RPOP': this.store.rpop,
      'HSET': this.store.hset,
      'HVALS': this.store.hvals,
      'HSTRLEN': this.store.hstrlen,
      'HMSET': this.store.hmset
    };
  }

  prepareReturnString(result) {
    let newResult;

    if (result === null) {
      return "+(nil)\r\n";
    }

    switch(typeof result) {
      case 'string':
        const stringToReturn = !!result ? "" + result : "(nil)";
        newResult = "+" + stringToReturn + "\r\n";
        break
      case 'number':
        newResult = ":" + result + "\r\n";
        break;
    }

    return newResult;
  }

  startServer(port=DEFAULT_PORT, host=DEFAULT_HOST) {
    const server = Net.createServer();
    server.on('connection', this.handleConnection.bind(this));

    server.listen(port, host, function() {
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
        } else if (command === 'LINSERT') {
          const flag = tokens[2];

          if (flag === 'BEFORE') {
            result = this.store.linsertBefore(...tokens.slice(1));
          } else if (flag === 'AFTER') {
            result = this.store.linsertAfter(...tokens.slice(1));
          }

        } else if (this.storeCommandMap[command]) {
          result = this.storeCommandMap[command].apply(this.store, tokens.slice(1));
        } else {
          result = "ServerError: Command not found in storeCommandMap.";
        }
        const stringToReturn = this.prepareReturnString(result);
        conn.write(stringToReturn);
      } catch(err) {
        if (err instanceof ParserError || err instanceof StoreError) {
          const result = err.message;
          conn.write(result);
        } else {
          throw err;
        }
      }
    }.bind(this));
  };

}

export default CorvoServer;

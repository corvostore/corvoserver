import Net from 'net';
import Store from './store';
import { Parser } from './parser';
import ParserError from './parser_error';
import StoreError from './store_error';
import FS from "fs";

const DEFAULT_PORT = 6379;
const DEFAULT_HOST = '127.0.0.1';
const WRITE_COMMANDS = {
  SET: true, // always write to AOF
  APPEND: true, // always write to AOF when returning integer
  TOUCH: true, // write to AOF when return val integer NOT 0 X
  INCR: true, // always write to AOF when returning integer
  DECR: true, // always write to AOF when returning integer
  RENAME: true, // write to AOF when returning OK
  RENAMENX: true, // write to AOF when returns 1 or 0
  DEL: true, // write for any integer greater than 0 X
  LREM: true, // write for any integer greater than 0 X
  LPUSH: true, // write for any integer value
  RPUSH: true, // write for any integer value
  LPOP: true, // write when not nil X
  RPOP: true, // write when not nil X
  LSET: true, // write when returning OK
  HSET: true, // write for 1 or 0
  HMSET: true, // write when returning OK
  HDEL: true, // write for any integer value
  HSETNX: true, // write for 1 or 0
  HINCRBY: true, // write for any float
  ZINTERSTORE: true, // write for any integer value
  ZUNIONSTORE: true, // write for any integer value
  ZADD: true, // write for integer or bulk string reply
  ZREM: true, // write for any integer value
  ZINCRBY: true, // bulk string reply
};
const DEF_OPTIONS = {
  aofWritePath: 'corvoAOF.aof',
  aofPersistence: true
};

class CorvoServer {
  constructor(options=DEF_OPTIONS) {
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
      'LSET': this.store.lset,
      'HSET': this.store.hset,
      'HVALS': this.store.hvals,
      'HSTRLEN': this.store.hstrlen,
      'HKEYS': this.store.hkeys,
      'HMSET': this.store.hmset,
      'HDEL': this.store.hdel,
      'HGET': this.store.hget,
      'HGETALL': this.store.hGetAll,
      'HLEN': this.store.hlen,
      'HSETNX': this.store.hsetnx,
      'HMGET': this.store.hmget,
      'HINCRBY': this.store.hincrby,
      'ZINTERSTORE': this.store.zinterstore,
      'ZUNIONSTORE': this.store.zunionstore,
      'ZADD': this.store.zadd,
      'ZREM': this.store.zrem,
      'ZCARD': this.store.zcard,
      'ZINCRBY': this.store.zincrby,
      'ZSCORE': this.store.zscore,
    };
    this.aofWritePath = options.aofWritePath;
    this.persist = options.aofPersistence;
    if (this.persist) {
      this.writer = FS.createWriteStream(options.aofWritePath, {'flags': 'a' });
    }
  }

  prepareRespReturn(result, isError=false) {
    // handle error
    if (isError) {
      return "-" + result + "\r\n";
    }

    // handle null
    if (result === null) {
      return "$-1\r\n";
    }

    // handle array
    if (result instanceof Array) {
      let respResult = "*" + result.length + "\r\n";

      result.forEach((elem) => {
        if (elem === null) {
          respResult += "$-1\r\n";
        } else if (typeof elem === 'string') {
          respResult += "$" + elem.length + "\r\n" + elem + "\r\n";
        } else if (typeof elem === 'number') {
          respResult += ":" + elem + "\r\n";
        }
      });

      return respResult;
    }

    // handle string
    if (typeof result === 'string') {
      let respResult;
      if (result.length === 0) {
        respResult = "$0\r\n\r\n";
      } else {
        respResult = "+" + result + "\r\n";
      }

      return respResult;
    }

    // handle number
    if (typeof result === 'number') {
      return ":" + result + "\r\n";;
    }

  }

  startServer(port=DEFAULT_PORT, host=DEFAULT_HOST) {
    const server = Net.createServer();
    server.on('connection', this.handleConnection.bind(this));

    if (this.persist) { this.aofLoadFile(this.aofWritePath); }
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
        const command = tokens[0].toUpperCase();
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
          console.log("TOKENS", tokens);
          result = this.storeCommandMap[command].apply(this.store, tokens.slice(1));
        } else {
          result = "ServerError: Command not found in storeCommandMap.";
        }

        // write to AOF file if command and return val are correct
        if (WRITE_COMMANDS[command]) {
          if (this.persist) {
            this.aofCheckAndWrite(data, command, result);
          }
        }

        const stringToReturn = this.prepareRespReturn(result);
        conn.write(stringToReturn);
      } catch(err) {
        if (err instanceof ParserError || err instanceof StoreError) {
          const stringToReturn = this.prepareRespReturn(err.message, true);
          conn.write(stringToReturn);
        } else {
          throw err;
        }
      }
    }.bind(this));
  };

  aofCheckAndWrite(data, command, result) {
    if (command === 'TOUCH' && result === 0) {
      return;
    } else if (command === 'DEL' && result === 0) {
      return;
    } else if (command === 'LPOP' && result === null) {
      return;
    } else if (command === 'RPOP' && result === null) {
      return;
    } else if (command === 'LREM' && result === 0) {
      return;
    } else {
      console.log("WRITING TO AOF FILE!");
      this.writer.write(data, 'UTF8');
    }
  }

  aofLoadFile(fileName) {
    const buf = new Buffer(1024 * 1024);

    console.log("Going to open an existing file");
    const self = this;
    FS.open(fileName, 'r', function(err, fd) {
      if (err) {
        return console.error(err);
      }
      console.log("File opened successfully!");
      console.log("Going to read the file");
      FS.read(fd, buf, 0, buf.length, 0, function(err, bytes){
          if (err){
            console.log(err);
          }
          console.log(bytes + " bytes read");

          // Print only read bytes to avoid junk.
          if (bytes > 0){
            console.log(buf.slice(0, bytes).toString());
          }

          const inputDataTokens = buf.slice(0, bytes).toString().split('\r\n').slice(0, -1);
          console.log("inputDataTokens.length=", inputDataTokens.length);
          console.log("inputDataTokens[0]=", inputDataTokens[0], ":");
          console.log("inputDataTokens[1]=", inputDataTokens[1], ":");
          while (inputDataTokens.length) {
            const countToken = inputDataTokens.shift();
            const count = parseInt(countToken.slice(1), 10);
            console.log("Inside fs.read, this=", this);
            // extract one command
            const tokens = self.extractOneCommand(count, inputDataTokens);

            // apply that command
            self.aofCallStoreCommands(tokens);
          }
      });
    });
  }

  extractOneCommand(count, inputDataTokens) {
    const tokens = [];
    for (let i = 0; i < count; i += 1) {
      inputDataTokens.shift();
      tokens.push(inputDataTokens.shift());
    }

    return tokens;
  }

  aofCallStoreCommands(tokens) {
    try {
      const command = tokens[0].toUpperCase();
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
        console.log("TOKENS", tokens);
        result = this.storeCommandMap[command].apply(this.store, tokens.slice(1));
      } else {
        result = "ServerError: Command not found in storeCommandMap.";
      }

    } catch(err) {
      throw err;
    }
  }

  static parseCommandLineIntoOptions(args) {
    const options = {};

    while (args.length) {
      const token = args.shift();
      if (token === '--maxMemory') {
        const maxMemory = +args.shift();

        if (isNaN(maxMemory)) {
          throw new Error("Invalid option value for maxMemory.");
        }

        options['maxMemory'] = maxMemory;
      } else if (token === '--aofWritePath') {
        const path = args.shift();

        if (!path.match(/.+\.aof$/i)) {
          throw new Error("Invalid option value for aofWritePath.");
        }

        options['aofWritePath'] = path
      } else if (token === '--aofPersistence') {
        let persistenceBool = args.shift();

        if (persistenceBool !== 'true' && persistenceBool !== 'false') {
          throw new Error("Invalid option value for aofPersistence.");
        }

        persistenceBool = persistenceBool === 'true';

        options['aofPersistence'] = persistenceBool;
      }
    };

    return options;
  }
}

export default CorvoServer;

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
  // SADD: true,
  // SCARD: true,
  // SCARD: true,
  // SDIFF: true,
  // SUNION: true,
  // SINTER: true,
  // SISMEMBER: true,
  // SMEMBERS: true,
  // SPOP: true,
  // SREM: true,
  // SDIFFSTORE: true,
  // SINTERSTORE: true,
  // SUNIONSTORE: true,
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
      'SADD': this.store.sadd,
      'SCARD': this.store.scard,
      'SDIFF': this.store.sdiff,
      'SUNION': this.store.sunion,
      'SINTER': this.store.sinter,
      'SISMEMBER': this.store.sismember,
      'SMEMBERS': this.store.smembers,
      'SPOP': this.store.spop,
      'SREM': this.store.srem,
      'SDIFFSTORE': this.store.sdiffstore,
      'SINTERSTORE': this.store.sinterstore,
      'SUNIONSTORE': this.store.sunionstore,
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
    this.server = Net.createServer();
    this.server.on('connection', this.handleConnection.bind(this));

    if (this.persist) { this.aofLoadFile(this.aofWritePath); }
    const self = this;
    this.server.listen(port, host, function() {
      console.log('server listening to %j', self.server.address());
    });
  }

  handleConnection(conn) {
    const self = this;
    conn.setEncoding('utf8');
    conn.on('data', function(data) {
      console.log("data =", data);
      try {
        const tokens = Parser.processIncomingString(data);
        const command = tokens[0].toUpperCase();
        let result;

        if (command === 'SHUTDOWN') {
          conn.destroy();
          this.shutdownServer();
        } else if (command === 'SET') {
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

        // write to AOF file if command and return val are correct
        if (WRITE_COMMANDS[command]) {
          if (this.persist) {
            this.aofCheckAndWrite(data, command, result);
          }
        }

        const stringToReturn = this.prepareRespReturn(result);
        if (command !== 'SHUTDOWN') {
          conn.write(stringToReturn);
        }
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
      console.log("Above command written to AOF file.");
      this.writer.write(data, 'UTF8');
    }
  }

  aofLoadFile(fileName) {
    // const CHUNK_SIZE = 1024;
    const CHUNK_SIZE = 391;

    console.log("Going to open an existing file");
    const self = this;
    this.prependString = "";
    const readStream = FS.createReadStream(fileName, {encoding: 'utf8', highWaterMark: CHUNK_SIZE});
    readStream.on('data', function(chunk) {
          let bytes = chunk.length;
          let dataToProcess;

          const dataReceived = chunk;
          if (bytes < CHUNK_SIZE) {
            dataToProcess = self.prependString + dataReceived;
          } else {
            const bytesToChop = self.getTrailingCommandBytes(dataReceived);
            dataToProcess = self.prependString + dataReceived.slice(0, -bytesToChop);
            self.prependString = dataReceived.slice(-bytesToChop);
          }
          let inputDataTokens = dataToProcess.split('\r\n').slice(0, -1);
          while (inputDataTokens.length) {
            let countToken = inputDataTokens.shift();
            let count = parseInt(countToken.slice(1), 10);
            // extract one command
            let tokens = self.extractOneCommand(count, inputDataTokens);

            // apply that command
            self.aofCallStoreCommands(tokens);
          }
      }).on('end', function() {
        console.log("end of data reached");
      });
  }

  getTrailingCommandBytes(dataReceived) {
    let count = 0;
    let idx = dataReceived.length - 1;

    while (idx >= 0) {
      count += 1;
      if (dataReceived[idx] === '*') {
        return count;
      }
      idx -= 1;
    }
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

  shutdownServer() {
    console.log("shutting down server...");
    this.server.close();
  }
}

export default CorvoServer;

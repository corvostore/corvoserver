import Store from './store';
import Net from 'net';

const DEFAULT_PORT = 6379;
const DEFAULT_HOST = '127.0.0.1';

class CorvoServer {
  constructor() {
    this.store = new Store();
  }
  startServer() {
    const server = Net.createServer();
    server.on('connection', this.handleConnection.bind(this));

    server.listen(DEFAULT_PORT, DEFAULT_HOST, function() {
      console.log('server listening to %j', server.address());
    });

  }

  handleConnection(conn) {
    return "handleConnection called";
  }


}

export default CorvoServer;

// function chomp(s) {
//   return s.slice().replace(/[\n|\r]*$/, '');
// }
//
// function handleConnection(conn) {
//   function handleCommand(d) {
//     var numItems = 0;
//     var commandArray = chomp(d).split(' ');
//
//     var command = commandArray[0].toUpperCase();
//     var responseText = "";
//
//     switch(command) {
//       case "SET":
//         if (commandArray.length < 3) {
//           responseText = "SET command needs additional arguments"
//         } else {
//           mainHash[commandArray[1]] = commandArray[2];
//           responseText = "OK";
//         }
//         break;
//       case "GET":
//         if (commandArray.length < 2) {
//           responseText = "GET command needs additional arguments"
//         } else {
//           var value = mainHash[commandArray[1]];
//           if (value) {
//             responseText = '"' + value + '"';;
//           } else {
//             responseText = "(nil)";
//           }
//         }
//         break;
//       case "QUIT":
//         conn.end();
//         break;
//       default:
//         responseText = "Command not implemented yet";
//     }
//
//     return responseText + "\r\n";
//    }
//
//   function onConnData(d) {
//     console.log('connection data from %s: %j', remoteAddress, d);
//     var commandResponse = handleCommand(d);
//
//     // do no write if connection was close (due to QUIT command)
//     if (commandResponse.length > 2) {
//       conn.write(commandResponse);
//     }
//   }
//
//   function onConnClose() {
//     console.log('connection from %s closed', remoteAddress);
//   }
//
//   function onConnError(err) {
//     console.log('Connection %s error: %s', remoteAddress, err.message);
//   }
//
//   var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
//   console.log('new client connection from %s', remoteAddress);
//
//   conn.setEncoding('utf8');
//
//   conn.on('data', onConnData);
//   conn.once('close', onConnClose);
//   conn.on('error', onConnError);
//
// }

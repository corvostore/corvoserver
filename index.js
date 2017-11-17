import CorvoServer from './corvo_server';

// const options = {
//   aofWritePath: 'corvoAOF.aof',
//   aofPersistence: true
// };

var options = CorvoServer.parseCommandLineIntoOptions(process.argv);
var server = new CorvoServer(options);
server.startServer();

import CorvoServer from './corvo_server';

var options = CorvoServer.parseCommandLineIntoOptions(process.argv);
var server = new CorvoServer(options);
server.startServer();

process.on('SIGINT', function() {
  server.shutdownServer();
});

import CorvoServer from './corvo_server';

const options = {
  aofWritePath: 'corvoAOF.aof',
  aofPersistence: true
};

var server = new CorvoServer(options);
server.startServer();

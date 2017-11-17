import CorvoServer from './corvo_server';

const options = {
  aofWritePath: 'corvoAOF.txt',
  aofPersistence: true
};

var server = new CorvoServer(options);
server.startServer();

import CorvoServer from './corvo_server';

const options = {
  aofWritePath: 'corvoAOF.txt',
  aofPersistence: false
};

var server = new CorvoServer(options);
server.startServer();

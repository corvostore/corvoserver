import CorvoServer from './corvo_server';

const options = {
  aofWritePath: 'corvoAOF.txt'
};

var server = new CorvoServer(options);
server.startServer();

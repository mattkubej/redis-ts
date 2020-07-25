import { createServer } from 'net';
import { decode } from './resp-decoder';
import { handle } from './command-handler';

const server = createServer();

server.on('connection', function(socket) {
  socket.on('data', function(data) {
    try {
      console.log('-[receive]-> ', data.toString('utf8'));
      const cmd = decode(data);
      console.log('-[cmd]-> ', cmd);
      //handle(socket, cmd);
    } catch (e) {
      console.error(e);
    }
  });
});

server.listen(6379, function() {
  console.log('listening on 6379');
});

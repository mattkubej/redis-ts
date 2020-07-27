import { createServer } from 'net';
import { decode } from './resp-decoder';
import { handle } from './command-handler';

const server = createServer();

server.on('connection', function(socket) {
  socket.on('data', function(data) {
    try {
      const request = decode(data);
      handle(socket, request);
    } catch (e) {
      console.error(e);
    }
  });
});

server.listen(6379, function() {
  console.log('listening on 6379');
});

import RedisServer from './server';

const redisServer = new RedisServer();

// TODO: introduce environment variable to change port
redisServer.listen(6379, function () {
  console.log('listening on 6379');
});

import RedisServer from './server';

const redisServer = new RedisServer();

redisServer.listen(6379, function() {
  console.log('listening on 6379');
});

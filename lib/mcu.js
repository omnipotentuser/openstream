var io = {};

exports.init = function(srv){
  console.log('Socket.io initialized');
  io = require('socket.io').listen(srv);
  io.set('log level', 1);
  io.sockets.on('connection', function(socket){
    console.log('UA connected');
  });
}

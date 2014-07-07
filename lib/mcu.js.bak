var io;
exports.init = function(sock){
  console.log('MCU initialized');
  io = sock;
  io.on('connection', function(socket){
    console.log('UA connected');
  });
}

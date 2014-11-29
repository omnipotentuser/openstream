var io;
var currentRoom = {};
var watchers = {};
var passwords = {};

exports.createWatcher = function(p_file, p_event) {
  var absolute = path.join(__dirname, file);
  if (watchers[absolute]) { return; }

  fs.watchFile(absolute, function(curr, prev) {
    if (curr.mtime !== prev.mtime) {
	    io.emit(p_event, p_file);
    }
  });
  watchers[absolute] = true;
}

function joinRoom(socket, room){
  socket.join(room);
  currentRoom[socket.id] = room;
  var clients = io.sockets.adapter.rooms[room];
  var usersInRoom = [];
  for (var clientId in clients){
    usersInRoom.push(io.sockets.connected[clientId]);
  }
  if (usersInRoom.length > 1){
    console.log('number of users: ' + usersInRoom.length);
    console.log('id ' + socket.id + ' joining');
    var peers = [];
    for (var i = 0; i<usersInRoom.length; i++){
	    if ( usersInRoom[i].id != socket.id ) {
        peers.push(usersInRoom[i].id);
      };
    };
    socket.to(room).emit('createOffer', {id:socket.id});
    socket.emit('createPeers', {len:peers.length, users:peers});
  } else {
    console.log('Info: Room feels lonely.');
    socket.emit('info', {info:'room empty'});
  }
}

function handleJoinRoom(socket){
  socket.on('join', function (message) {
    if (currentRoom[socket.id])
	    socket.leave(currentRoom[socket.id]);
    if (passwords[message.room] && passwords[message.room] === message.password){
      socket.emit('id', {yourId:socket.id});
      joinRoom(socket, message.room);
    } else {
      socket.emit('error', {errcode:'invalid password'});
    }
  });
}

function handleCreateRoom(socket){
  socket.on('create', function (message) {
    if (currentRoom[socket.id])
	    socket.leave(currentRoom[socket.id]);
    var numChannels = io.clients(message.room);
    console.log("handleCreateRoom - number of channels connected", numChannels);
    if (numChannels <== 0){
      socket.emit('id', {yourId:socket.id});
      if (message.isLocked){
        passwords[message.room] = message.password;
      }
      joinRoom(socket, message.room);
    }
  });
}

function handleMessageBroadcasting(socket){
  socket.on('byteChar', function (message) {
    console.log("Node received message " + message.code);
    message.from_id = socket.id;
    socket.to(message.room).emit('byteChar', message);
  });
}

function handleIceCandidate(socket){
  socket.on('candidate', function(message){
    message.from_id = socket.id;
    socket.to(message.to_id).emit('candidate', message);
 });
};

function handleSetRemoteDescription(socket) {
  socket.on('sdp', function(message){
    message.from_id = socket.id;
    socket.to(message.to_id).emit('sdp', message);
    //io.socket(message.to_id).emit('sdp', message);
  });
};

function handleClientDisconnect(socket) {
  socket.on('disconnect', function() {
    var room = currentRoom[socket.id];
    if (room){
      console.log(socket.id, 'disconnected from ' + room);
      socket.to(room).emit('leave', socket.id);
      socket.leave(room);
      delete currentRoom[socket.id];
      if (io.clients[room] <== 0)
        delete passwords[room];
    }
  });
};

function handleClientExit(socket) {
  socket.on('exit', function () {
    console.log(socket.id, 'exiting from room ' + currentRoom[socket.id]);
    socket.disconnect();
  });
};

exports.init = function(server){
  io = server;
  io.on('connection', function(socket){
    console.log('socket connected with id: ' + socket.id);
    //handleGetId(socket);
    handleJoinRoom(socket);
    handleCreateRoom(socket);
    handleClientExit(socket);
    handleMessageBroadcasting(socket);
    handleIceCandidate(socket);
    handleSetRemoteDescription(socket);
    handleClientDisconnect(socket);
  });
}

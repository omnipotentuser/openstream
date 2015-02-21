var io;
var currentRoom = {};
var passwords = {};
var rooms = {}; // { room : { islocked : <bool> } }

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
    var roomName = message.room;
    if (currentRoom[socket.id])
	    socket.leave(currentRoom[socket.id]);
    if (passwords[roomName] && passwords[roomName] === message.password){
      console.log('handleJoinRoom -- joining room, password matched');
      socket.emit('id', {yourId:socket.id});
      joinRoom(socket, roomName);
    } else if (!passwords[roomName]){ // no password assigned
      console.log('handleJoinRoom -- joining room, no password');
      socket.emit('id', {yourId:socket.id});
      joinRoom(socket, roomName);
    } else {
      socket.emit('err', {errcode:'invalid password'});
    }
  });
}

function handleCreateRoom(socket){
  socket.on('createRoom', function (message) {
    if (currentRoom[socket.id])
	    socket.leave(currentRoom[socket.id]);

    //console.log('io.adapter.rooms', io.sockets.adapter.rooms);
    //console.log('typeof io.adapter.rooms', typeof(io.sockets.adapter.rooms));
    var roomObj = io.sockets.adapter.rooms;
    var numUsers = Object.keys(roomObj).length;;
    console.log("handleCreateRoom - number of channels connected", numUsers);

    if (numUsers <= 1){
      console.log('handleCreateRoom - isLocked: '+message.isLocked);
      if (message.isLocked){
        passwords[message.room] = message.password;
      }
      rooms[message.room] = {islocked: message.isLocked};
      socket.emit('roomCreated', {created:true});

      // NICK - Should not be calling joinRoom. Let the client call this 
      // once it is ready to join after creating the room.
      //
      //joinRoom(socket, message.room);
      
    } else {
      console.log(message.room + ' exists already');
      socket.emit('roomCreated', {created:false});
    }
  });
}

function handleSendRooms(socket){
  socket.on('getRooms', function(){
    console.log('Client asking for room list, sending');
    socket.emit('roomsSent', rooms);
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
      console.log(socket.id + 'disconnected from ' + room);
      socket.in(room).emit('leave', socket.id);
      console.log('before leaving, socket.rooms.length: '+socket.rooms.length);
      socket.leave(room);
      delete currentRoom[socket.id];
      console.log('after leaving, socket.rooms.length: '+socket.rooms.length);
      if (socket.rooms.length <= 0){
        if (passwords[room]) delete passwords[room];
        socket.broadcast.emit('deleteRoom', {'room': room});
        delete rooms[room];
      }
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
    handleSendRooms(socket);
    handleClientExit(socket);
    handleMessageBroadcasting(socket);
    handleIceCandidate(socket);
    handleSetRemoteDescription(socket);
    handleClientDisconnect(socket);
  });
}

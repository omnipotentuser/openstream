/* globals LoungeViews:true, RTCEngine:true */

function Lounge(){
  var rtc_engine = new RTCEngine();
	var loungeViews = new LoungeViews();
  var localId = null;
  var roomName = '';
  var rooms = {};
  var $input = $('#lounge-input-roomname');
  var $create = $('#lounge-btn-create');
  var $join = $('#lounge-btn-join');
  var $lock = $('#lounge-ck-lock');
  var $password = $('#lounge-input-pw');
  var isLocked = false;
  var password = '';

  //var $join = $('#lounge-list .join');

  var handleLoungeSocketEvents = function(signaler, data){
    if (signaler){
      var pid = '';
      switch (signaler) {
        case 'connected':
          console.log('rtc engine connected');
          rtc_engine.getRooms();
          break;
        case 'id':
          console.log('client id: '+data.id);
          localId = data.id;
          loungeViews.openGallery();
          loungeViews.openMediaViews();
          break;
        case 'create': // creating peer user
          pid = data.id;
          console.log(
            'creating new media element', 
            pid
          );
          loungeViews.appendPeerMedia(pid);
          break;
        case 'peerDisconnect':
          pid = data.id;
          loungeViews.deletePeerMedia(data.id);
          break;
        case 'readbytechar':
          loungeViews.updateTextArea(data.from_id, data.code);
          break;
        case 'info':
          console.log(data.msg);
          break;
        case 'roomsSent':
          handleCreateRoomList(data);
          break;
        case 'addRoom':
          handleAddRoomItem(data);
          break;
        case 'deleteRoom':
          handleDeleteRoomFromList(data);
          break;
        case 'roomCreated':
          if (data.created){
            rtc_engine.join();
          } else {
            alert("Room Exists. Please join the room instead.");
            console.log(data.msg);
            
            // left to be handled by the coder at some other time
            // for now, destroy the rtc engine
            destroyEngine();
          }
          loungeViews.closeCreateModal();
          break;
        case 'err':
          // need to handle error for room full
          // by exiting room
          console.log(data.msg);
          break;
        default:
          break;
      }
    }
  };

  function handleCreateRoomList(list){
    console.log('handleCreateRoomList',list);
    rooms = list;
    loungeViews.generateRoomList(rooms, function(name){
      roomName = name;
      rtc_engine.join({room: roomName});
      loungeViews.updateTitle(roomName);
      window.history.replaceState({}, "OpenStream "+roomName, "#"+roomName);
    });
  }

  function handleDeleteRoomFromList(data){
    var name = data.room;
    console.log('handleDeleteRoomFromList');
    if (rooms[name]) delete rooms[name];
    loungeViews.deleteRoomFromList(name);
  }

  function handleAddRoomItem(data){
    if (!data) return;
    Object.keys(data).forEach(function(name){
      rooms[name] = data;
    });
    loungeViews.addRoomItem(data, function(name){
      roomName = name;
      rtc_engine.join({room: roomName});
      loungeViews.updateTitle(roomName);
      window.history.replaceState({}, "OpenStream "+roomName, "#"+roomName);
    });
  }

  var handleCreateBtn = function(event){

    roomName = roomName || $input.val();
    isLocked = $lock.is(':checked');
    password = isLocked ? $password.val() : '';

    if (roomName === ''){
      alert('Cannot have empty room name');
    } else {

      event.preventDefault();

      (function(room, engine){

        console.log('starting rtc engine');

        var engineData = { 
          room:room, 
          createRoom:true,
          isLocked:isLocked, 
          password:password 
        };

        engine.createRoom(engineData);

      })(roomName, rtc_engine);

      loungeViews.updateTitle(roomName);
      window.history.replaceState({}, "OpenStream "+roomName, "#"+roomName);
      $create.unbind('click', handleCreateBtn);
    }
  }

  var handleJoinBtn = function (event){
    event.preventDefault();
    console.log('coming soon');
    $join.unbind('click', handleJoinBtn);
  }

  var destroyEngine = function(){
    if (rtc_engine){
      rtc_engine.leave();
      rtc_engine = null;
    }
  }

  this.leave = function(destroyCallback, next){
    $input.val('');
    $create.unbind('click', handleCreateBtn);
    $join.unbind('click', handleJoinBtn);
    destroyEngine();
    if (loungeViews){
      loungeViews.closeMediaViews(destroyCallback, next);
      loungeViews = null;
    }
    console.log('Lounge exiting');
  };

  $create.bind('click', handleCreateBtn);
  $join.bind('click', handleJoinBtn);
  loungeViews.setListeners(rtc_engine);
  
  // Determine if we automatically go into the room from the URL value
  (function queryUrl(){
    var hashurl = window.location.hash;
    var hashpos = hashurl.lastIndexOf('#');
    if (hashpos !== -1){
      hashurl = hashurl.substring(hashpos + 1);
    }
    if (hashpos === -1){
      roomName = '';
    } else if (hashurl.length > 0){
      roomName = hashurl;
    } else {
      roomName = '';
    }

    console.log('room name:',roomName);

    rtc_engine.connect(handleLoungeSocketEvents);

    if (roomName !== ''){
      $create.trigger('join');
    }

  })();

}

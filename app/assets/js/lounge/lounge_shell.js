/* globals LoungeViews:true, RTCEngine:true */

function Lounge(){
  var rtc_engine = new RTCEngine();
	var loungeViews = new LoungeViews(rtc_engine);
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
          loungeViews.galleryAddImage(data.from_id, data.code);
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
            loungeViews.updateTitle(roomName);
            window.history.replaceState({}, "OpenStream "+roomName, "#"+roomName);
            rtc_engine.join();
          } else {
            swal({ 
              title: "Room Exists.",
              text: "Please join the room instead.",
              type: "error",
              confirmButtonText: "Cool"
            });
            console.log(data.msg);
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

  function generateRoom(rooms){
    loungeViews.generateRoomList(rooms, function(name, encoded){
      if (rtc_engine){
        roomName = name;
        rtc_engine.join({room: roomName, password: encoded });
        loungeViews.updateTitle(roomName);
        window.history.replaceState({}, "OpenStream "+roomName, "#"+roomName);
      } else {
        console.log('rtc_engine is not defined',rtc_engine);
      }
    });
  }

  function handleCreateRoomList(list){
    console.log('handleCreateRoomList',list);
    rooms = list;
    generateRoom(rooms);
  }

  function handleAddRoomItem(data){
    if (!data) return;
    Object.keys(data).forEach(function(name){
      rooms[name] = data;
    });
    generateRoom(rooms);
  }

  function handleDeleteRoomFromList(data){
    var name = data.room;
    console.log('handleDeleteRoomFromList');
    if (rooms[name]) delete rooms[name];
    loungeViews.deleteRoomFromList(name);
  }

  function validateInput(str){
    if (str){
      var re = /^\w*$/g;
      var cond = re.test(str) ? str : '';
      return cond;
    }
  }

  var handleCreateBtn = function(event){

    roomName = validateInput(roomName) || validateInput($input.val());
    isLocked = $lock.is(':checked');
    password = isLocked ? $password.val() : '';


    if (! roomName){
      swal({
        title: "Invalid Entry",
        text: 'Cannot have empty room name and can only accept alphanumeric and underscore characters.',
        type: "warning",
        confirmTextButton: "cool"
      });
    } else if (isLocked && !validateInput(password)){
      swal({ 
        title: "What Password?",
        text: "Please enter valid password of alphanumeric and/or underscore characters.",
        type: "warning",
        confirmButtonText: "Cool"
      });
    } else {

      event.preventDefault();

      (function(room, engine){

        console.log('starting rtc engine');

        var engineData = { 
          room:room, 
          createRoom:true,
          isLocked:isLocked, 
          password:window.btoa(password)
        };

        engine.createRoom(engineData);

      })(roomName, rtc_engine);
    }
  }

  var handleJoinBtn = function (event){
    event.preventDefault();
    //$join.unbind('click', handleJoinBtn);
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
      loungeViews.destroyListeners();
      loungeViews = null;
    }
    console.log('Lounge exiting');
  };

  $create.bind('click', handleCreateBtn);
  $join.bind('click', handleJoinBtn);
  
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

    rtc_engine.connect(handleLoungeSocketEvents);

    if (roomName !== ''){
      console.log('Hashurl triggered room query');
      setTimeout(function(){
        var placeholder = $('#lounge-room-item-' + roomName);
        if ( placeholder.length ){
          console.log('triggering room item click to', roomName);
          $('#lounge-room-item-'+roomName).trigger('click');
        } else {
          swal({
            title: "This room \""+roomName+"\" has not been created yet.",
            text: "Do you want to create it?",
            type: "info",
            showCancelButton: true,
            cancelButtonText: "No, I am fine",
            confirmButtonText: "Yes, please"
          }, function(isConfirm){
            if (isConfirm){
              handleCreateBtn(new Event('click'));              
            } else {
              var page = window.location.protocol 
                + window.location.pathname;
              window.history.replaceState({}, "OpenStream", page);
            }
          });
        }
      }, 2000)
    }

  })();
 
}

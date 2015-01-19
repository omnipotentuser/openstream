/* globals LoungeViews:true, RTCEngine:true */

function Lounge(){
  var rtc_engine = new RTCEngine();
	var loungeViews = new LoungeViews();
  var localId = null;
  var roomName = '';
  var $input = $('#lounge-input-roomname');
  var $create = $('#lounge-btn-create');
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
          rtc_engine.join();
          break;
        case 'id':
          console.log('client id: '+data.id);
          localId = data.id;
          break;
        case 'create': // creating peer user
          pid = data.id;
          loungeViews.openMediaViews();
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
        case 'roomCreated':
          if (data.created){
            loungeViews.closeCreateModal();
            loungeViews.openMediaViews();
          } else {
            alert("Room Exists. Please join the room instead.");
            console.log(data.msg);
            loungeViews.closeMediaViews();
            destroyEngine();
          }
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

  var handleCreateBtn = function(event){

    roomName = $input.val();
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

        engine.connect(engineData, handleLoungeSocketEvents);
      })(roomName, rtc_engine);

      loungeViews.updateTitle(roomName);
      window.history.replaceState({}, "OpenStream "+roomName, "#"+roomName);
      $create.unbind('click', handleCreateBtn);
    }
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
    destroyEngine();
    if (loungeViews){
      loungeViews.closeMediaViews(destroyCallback, next);
      loungeViews = null;
    }
    console.log('Lounge exiting');
  };

  $create.bind('click', handleCreateBtn);
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
    console.log('roomName',roomName);
    if (roomName !== ''){
      $create.trigger('click');
    }
  })();

}

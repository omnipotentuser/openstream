function Hallway(){
  var rtc_engine = new RTCEngine();
	var hallwayViews = new HallwayViews();
  var localId = null;
  var roomName = '';
  var joinRoomBtn = $('#joinroombtn');

  var handleSocketEvents = function(signaler, data){
    if (signaler){
      switch (signaler) {
        case 'connected':
          console.log('rtc engine connected');
          rtc_engine.join();
          break;
        case 'id':
          localId = data.id;
          break;
        case 'create':
          var pid = data.id;
          console.log(
            'creating new media element', 
            pid
          );
          hallwayViews.appendPeerMedia(pid);
          break;
        case 'peerDisconnect':
          var pid = data.id;
          hallwayViews.deletePeerMedia(data.id);
          break;
        case 'readbytechar':
          hallwayViews.updateTextArea(data.from_id, data.code);
          break;
        case 'info':
          console.log(data.msg);
          break;
        case 'error':
          // need to handle error for room full
          // by exiting room
          console.log(data.msg);
          break;
        default:
          break;
      };
    }
  };

  var handleJoinBtn = function(event){

    var $input = $('#roomnameinput');
    if (roomName === ''){
      roomName = $input.val();
    }
    
    if (roomName === ''){

      alert('Cannot have empty name');

    } else {
      event.preventDefault();
      hallwayViews.openMediaViews();

      (function(room, engine){
        console.log('starting rtc engine');
        engine.connect(room, handleSocketEvents);
      })(roomName, rtc_engine);

      hallwayViews.updateTitle(roomName);
      joinRoomBtn.unbind('click', handleJoinBtn);
    }
  };

  this.leave = function(destroyCallback, next){
    $('#roomnameinput').val('');
    joinRoomBtn.unbind('click', handleJoinBtn);
    rtc_engine.leave();
    hallwayViews.closeMediaViews(destroyCallback, next);
    hallwayViews = null;
    rtc_engine = null;
  };


  joinRoomBtn.bind('click', handleJoinBtn);

  hallwayViews.setListeners(rtc_engine);
  (function queryUrl(){
    var hashurl = window.location.hash;
    var hashpos = hashurl.lastIndexOf('#');
    if (hashpos != -1){
      hashurl = hashurl.substring(hashpos + 1);
    }
    if (hashpos == -1){
      roomName = '';
    } else if (hashurl.length > 0){
      roomName = hashurl;
    } else {
      roomName = '';
    }
    console.log('roomName',roomName);
    if (roomName != ''){
      joinRoomBtn.trigger('click');
    }
  })();
};

function Hallway(){
  var rtc_engine = new RTCEngine();
	var hallwayViews = new HallwayViews();
  var localId = null;

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
    var room = $input.val();
    
    if (room === ''){

      alert('Cannot have empty name');

    } else {

      hallwayViews.openMediaViews();

      (function(room, engine){
        console.log('starting rtc engine');
        engine.connect(room, handleSocketEvents);
      })(room, rtc_engine);

      hallwayViews.updateTitle(room);
      
    }
  };

  this.leave = function(destroyCallback, next){
    $('#roomnameinput').val('');
    $('#joinroombtn').unbind('click', handleJoinBtn);
    rtc_engine.leave();
    hallwayViews.closeMediaViews(destroyCallback, next);
    hallwayViews = null;
    rtc_engine = null;
  };


  $('#joinroombtn').bind('click', handleJoinBtn);

  hallwayViews.setListeners(rtc_engine);
};

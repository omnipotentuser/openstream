/* globals RTCEngine:true, HallwayViews:true */

function Hallway(){
  var rtc_engine = new RTCEngine();
	var hallwayViews = new HallwayViews();
  var localId = null;
  var roomName = '';
  var $input = $('#roomnameinput');
  var joinRoomBtn = $('#joinroombtn');
  var randGenBtn = $('#randomgeneratorbtn');

  var handleSocketEvents = function(signaler, data){
    if (signaler){
      var pid = '';
      switch (signaler) {
        case 'connected':
          console.log('rtc engine connected');

          /*
          $.post("https://api.xirsys.com/getIceServers",{
            ident:"openhack",
            secret:"7ba03da6-d79b-11e5-83d0-057edf23e1c6",
            domain:"openhack.net",
            application:"default",
            room:"default",
            secure: "1"
          },
          function(data, status){
            var icedata = JSON.parse(data);
            //console.log('ice obtained:',icedata.d.iceServers);
            if (status === "success"){
              console.log('post success');
              rtc_engine.join({room:roomName});
            }
          });
          */
          rtc_engine.join({room:roomName});
          break;
        case 'id':
          localId = data.id;
          break;
        case 'create':
          pid = data.id;
          console.log(
            'creating new media element', 
            pid
          );
          hallwayViews.appendPeerMedia(pid);
          break;
        case 'peerDisconnect':
          pid = data.id;
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
      }
    }
  };

  var handleJoinBtn = function(event){

    if (roomName === ''){
      roomName = $input.val();
    }
    
    if (roomName === ''){
      swal({
        title:'',
        text: 'Cannot have empty name',
        type: 'error',
        confirmButtonText: 'Cool'
      });
    } else {
      event.preventDefault();
      hallwayViews.openMediaViews();

      (function(room, engine){
        console.log('starting rtc engine');
        engine.connect(handleSocketEvents);
      })(roomName, rtc_engine);

      hallwayViews.updateTitle(roomName);
      window.history.replaceState({}, "OpenStream "+roomName, "#"+roomName);
      joinRoomBtn.unbind('click', handleJoinBtn);
      randGenBtn.unbind('click', handleRandGenBtn);
    }
  };

  this.leave = function(destroyCallback, next){
    $input.val('');
    joinRoomBtn.unbind('click', handleJoinBtn);
    randGenBtn.unbind('click', handleRandGenBtn);
    rtc_engine.leave();
    hallwayViews.closeMediaViews(destroyCallback, next);
    hallwayViews = null;
    rtc_engine = null;
  };

  var S4 = function(){
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };

  var  generateID = function(){
    return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
  };

  var handleRandGenBtn = function(event){
    $input.val(generateID());
    joinRoomBtn.trigger('click');
  };

  joinRoomBtn.bind('click', handleJoinBtn);
  randGenBtn.bind('click', handleRandGenBtn);

  hallwayViews.setListeners(rtc_engine);
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
      joinRoomBtn.trigger('click');
    }
  })();
}

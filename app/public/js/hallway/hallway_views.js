
function HallwayViews(){

  var shiftKeyCode = {'192':'126', '49':'33', '50':'64', '51':'35', '52':'36', '53':'37', '54':'94', '55':'38', '56':'42', '57':'40', '48':'41', '189':'95', '187':'43', '219':'123', '221':'125', '220':'124', '186':'58', '222':'34', '188':'60', '190':'62', '191':'63'};
  var specialCharCode = {'8':'8', '13':'13', '32':'32', '186':'58', '187':'61', '188':'44', '189':'45', '190':'46', '191':'47', '192':'96', '219':'91', '220':'92', '221':'93', '222':'39'};

  var initialize = function(){
    var $input = $('#roomnameinput');
    $('<div/>', {id:'local-container', class:'media-layout'})
      .append('<video id=\"local-video\" autoplay controls muted>')
      .append('<textarea id=\"local-ta\" placeholder="Being typing in real time"></textarea>')
      .appendTo('#video-container');

    $input.focus();
    $input.keypress(function(event){
      if (event.which === 13){
        event.preventDefault();
        $('#joinroombtn').trigger("click");
      }
    });
  };

  this.setListeners = function(engine){
    var sc = engine.sendChar;
    $('#local-ta').on('keydown', function textareaByteChar(e) {
      var code = (e.keyCode ? e.keyCode : e.which);
      //console.log(e.type, e.which, e.keyCode);

      if( code == '37' || code == '38' || code == '39' || code == '40' ){
        e.preventDefault();
        return;
      }

      if( code  != 16 ) {// ignore shift
        if( code >= 65 && code <= 90 ) {
          if(!e.shiftKey){
            code = code + 32;
          }
          sc(code);
        } else if(e.shiftKey && (shiftKeyCode[code] !== undefined) ){
          code = shiftKeyCode[code];
          sc(code);
        } else if(specialCharCode[code] !== undefined){
          code = specialCharCode[code];
          sc(code);
        } else if ( code >= 48 && code <= 57 ) {
          sc(code);
        } else {
          console.log('keycode not accepted');
        };
      }
    })

  };

  this.openMediaViews = function(){
    $('#room-input').css('display','none');
    $('#video-container').css('display','inline-block');
  };

  this.closeMediaViews = function(destroyCallback, next){
    $('#hallway-room-title').empty();
    $('#video-container').fadeOut(function(){
      $('#room-input').fadeIn( 200, function destroyCB(){
        destroyCallback(next);
      });
    });
    this.deleteAllMedia();
  };

  this.appendPeerMedia = function(pid){
    console.log('appendPeerMedia', pid);
    $('<div/>', {class:'media-layout'})
      .append('<video id="'+pid+'" autoplay controls>')
      .append('<textarea id="'+pid+'-ta" class="remote-textarea" readonly></textarea>')
      .appendTo('#video-container');
    var $ml = $('.media-layout');
    var percent = (100 / $ml.length);
    $ml.css('width',percent+'%');
  }

  this.deletePeerMedia = function(pid){
    $('#'+pid).parent().remove();
    var $ml = $('.media-layout');
    var percent = (100 / $ml.length);
    $ml.css('width',percent+'%');
    console.log('deletePeerMedia', pid);
  }

  this.deleteAllMedia = function(){
    $('#video-container').empty(); 
  }

  this.updateTextArea = function(pid, bytechar){
    var $ta = $('#'+pid+'-ta');
    if (bytechar == '8'){
      $ta.val( $ta.val().slice(0,-1)); 
    } else{
      var ch = String.fromCharCode(bytechar);
      $ta.val($ta.val() + ch);
    }
    $ta.scrollTop($ta[0].scrollHeight);
  }

  this.updateTitle = function(room){
    $('#hallway-room-title').append('<p>Room: '+room+'</p>');
  }

  initialize();
};

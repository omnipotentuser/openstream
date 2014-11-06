
function LoungeViews(){

  var initialize = function(){

    $('<div/>', {id:'local-container', class:'media-layout'})
      .append('<video id=\"local-video\" autoplay controls muted>')
      .appendTo('#video-container');

    var $input = $('#lounge-input-roomname');
    $input.focus();
    $input.keypress(function(event){
      if (event.which === 13){
        event.preventDefault();
        $('#lounge-btn-create').trigger("click");
      }
    });
  };

  this.setListeners = function(engine){
    // todo set any event listeners to bind to at initialization of views
  };

  this.openMediaViews = function(){
    $('#room-input').css('display','none');
    $('#video-container').css('display','inline-block');
  };

  this.closeMediaViews = function(destroyCallback, next){
    $('#lounge-room-title').empty();
    $('#video-container').fadeOut(function(){
      this.deleteAllMedia();
    });
    destroyCallback(next);
  };

  this.appendPeerMedia = function(pid){
    console.log('appendPeerMedia', pid);
    $('<div/>', {class:'media-layout'})
      .append('<video id="'+pid+'" autoplay controls>')
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

  this.updateTitle = function(room){
    $('#lounge-room-title').append('<p>Room: '+room+'</p>');
  }

  initialize();
};

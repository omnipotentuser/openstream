
function LoungeViews(){

  var initialize = function(){

    $('<div/>', {id:'local-container', class:'lounge-media-layout'})
      .append('<video id=\"local-video\" autoplay controls muted>')
      .appendTo('#lounge-video-container');

    var $input = $('#lounge-input-roomname');
    $input.focus();
    $input.keypress(function(event){
      if (event.which === 13){
        event.preventDefault();
        $('#lounge-btn-create').trigger("click");
      }
    });
    $('#lounge-ck-lock').bind('click', handleCreatePasswordCheck);
    $('#lounge-btn-cancel').bind('click', handleCancelCreateRoom);
  };

  var handleCreatePasswordCheck = function(event){
    if (event.target.checked){
      $('#lounge-input-pw').fadeIn(200);
    } else {
      $('#lounge-input-pw').fadeOut(200);
    }
  };

  var handleCancelCreateRoom = function(event){
    console.log('handleCancelCreateRoom');
    this.closeCreateModal();
  };

  this.setListeners = function(engine){
    // todo set any RTC listeners to bind to at initialization of views
  };

  this.destroyListeners = function(engine){
    // todo destroy any RTC listeners to bind to at initialization of views
  };

  this.closeCreateModal = function(){
    console.log('closing create room modal');
    $('#lounge-modal-create').removeClass('show').addClass('hide');
  }

  this.openMediaViews = function(){
    $('#lounge-modal-create').removeClass('show').addClass('hide');
    //$('#lounge-video-container').removeClass('hide').addClass('show');
    $('#lounge-video-container').fadeIn();
  };

  this.closeMediaViews = function(destroyCallback, next){
    $('#lounge-room-title').empty();
    $('#lounge-video-container').fadeOut(function(){
      //$('#lounge-video-container').removeClass('show').addClass('hide');
      $('#lounge-modal-create').removeClass('hide').addClass('show');
      if (destroyCallback) destroyCallback(next);
    });
    this.deleteAllMedia();
  };

  this.appendPeerMedia = function(pid){
    console.log('appendPeerMedia', pid);
    $('<div/>', {class:'media-layout'})
      .append('<video id="'+pid+'" autoplay controls>')
      .appendTo('#lounge-video-container');
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
    $('#lounge-video-container').empty(); 
    $('#lounge-ck-lock').unbind('click', handleCreatePasswordCheck);
    $('#lounge-btn-cancel').unbind('click', handleCancelCreateRoom);
  }

  this.updateTitle = function(room){
    $('#lounge-room-title').append('<p>Room: '+room+'</p>');
  }

  initialize();
}

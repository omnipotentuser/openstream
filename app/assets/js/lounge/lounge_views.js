
function LoungeViews(){

  var $lock = $('#lounge-ck-lock');
  var $password = $('#lounge-input-pw');
  var $createModal = $('#lounge-modal-create');
  var $listContainer = $('#lounge-container-list');
  var $galleryContainer = $('#lounge-container-gallery');
  var $btnCancelCreate = $('#lounge-btn-cancel');
  var $btnCreate = $('#lounge-btn-create');
  var $room = $('#lounge-input-roomname');
  var $video = $('#lounge-video-container');
  var $title = $('#lounge-room-title');
  var $callCreateModal = $('#lounge-list-menu');

  var handleCreatePasswordCheck = function(event){
    if (event.target.checked){
      $password.fadeIn(200, function(){
        $password.removeProp('disabled');
      });
    } else {
      $password.fadeOut(200, function(){
        $password.prop('disabled');
      });
    }
  };

  var handleOpenCreateModal = function(event){
    if (!$createModal.hasClass('show')){
      console.log('handleOpenCreateModal');
      openCreateModal();
    }
  };

  var handleCancelCreateModal = function(event){
    console.log('handleCancelCreateModal');
    closeCreateModal();
  };

  var initialize = function(){

    $('<div/>', {id:'local-container', class:'lounge-media-layout'})
      .append('<video id=\"local-video\" autoplay controls muted>')
      .appendTo('#lounge-video-container');

    $room.focus();
    $room.keypress(function(event){
      if (event.which === 13){
        event.preventDefault();
        $btnCreate.trigger("click");
      }
    });
    $lock.bind('click', handleCreatePasswordCheck);
    $callCreateModal.bind('click', handleOpenCreateModal);
    $btnCancelCreate.bind('click', handleCancelCreateModal);
  };

  function openCreateModal(){
    console.log('opening create room modal');
    $createModal.removeClass('hide').addClass('show');
    $lock.attr('checked',false);
    $password.val('').fadeOut();
  }

  function closeCreateModal(){
    console.log('closing modal to create room');
    $createModal.removeClass('show').addClass('hide');
    $lock.attr('checked',false);
    $password.val('').fadeOut();
  }

  function openGalleryContainer(){
    console.log('opening gallery container');
    $galleryContainer.removeClass('hide').addClass('show');
    $listContainer.removeClass('show').addClass('hide');
  }

  function openListContainer(){
    console.log('opening room list container');
    $listContainer.removeClass('hide').addClass('show');
    $galleryContainer.removeClass('show').addClass('hide');
  }

  function setListeners(engine){
    // todo set any RTC listeners to bind to at initialization of views
  }

  function destroyListeners(engine){
    // todo destroy any RTC listeners to bind to at initialization of views
  }

  function roomItemClicked(roomName, callback){
    console.log(roomName+"selected");
    callback(roomName);
  }

  function generateRoomList(rooms, callback){
    $('#lounge-room-list-items').empty();
    Object.keys(rooms).forEach(function(name){
      (function(roomName){
        var classtype = rooms[roomName].isLocked ? 'lounge-room-item locked'
          : 'lounge-room-item unlocked';
        var attribs = {
          id: 'lounge-room-item-'+roomName,
          class: classtype
        };
        $('<li>', attribs)
          .bind('click', function(){
            roomItemClicked(roomName, callback);
          })
          .append(name)
          .appendTo('#lounge-room-list-items');
      })(name, callback);
    });
  }

  function deleteRoomFromList(name){
    $('#lounge-room-item-'+name).remove();
  }

  function openMediaViews(){
    $createModal.removeClass('show').addClass('hide');
    //$('#lounge-video-container').removeClass('hide').addClass('show');
    $video.fadeIn();
  }

  function closeMediaViews(destroyCallback, next){
    $title.empty();
    $video.fadeOut(function(){
      if (destroyCallback) destroyCallback(next);
    });
    this.deleteAllMedia();
  }

  function appendPeerMedia(pid){
    console.log('appendPeerMedia', pid);
    $('<div/>', {class:'media-layout'})
      .append('<video id="'+pid+'" autoplay controls>')
      .appendTo('#lounge-video-container');
    var $ml = $('.media-layout');
    var percent = (100 / $ml.length);
    $ml.css('width',percent+'%');
  }

  function deletePeerMedia(pid){
    $('#'+pid).parent().remove();
    var $ml = $('.media-layout');
    var percent = (100 / $ml.length);
    $ml.css('width',percent+'%');
    console.log('deletePeerMedia', pid);
  }

  function deleteAllMedia(){
    $video.empty(); 
    $lock.unbind('click', handleCreatePasswordCheck);
    $btnCancelCreate.unbind('click', handleCancelCreateModal);
    $callCreateModal.unbind('click', handleOpenCreateModal);
    openListContainer();
  }

  function updateTitle(room){
    $title.append('<p>Room: '+room+'</p>');
  }

  initialize();

  return {
    generateRoomList: generateRoomList,
    deleteRoomFromList: deleteRoomFromList,
    openGallery: openGalleryContainer,
    openList: openListContainer,
    openCreateModal: openCreateModal,
    closeCreateModal: closeCreateModal,
    updateTitle: updateTitle,
    deleteAllMedia: deleteAllMedia,
    deletePeerMedia: deletePeerMedia,
    appendPeerMedia: appendPeerMedia,
    closeMediaViews: closeMediaViews,
    openMediaViews: openMediaViews,
    destroyListeners: destroyListeners,
    setListeners: setListeners
  };
}

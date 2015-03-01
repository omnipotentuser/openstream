
function LoungeViews(){

  var $lock = $('#lounge-ck-lock');
  var $password = $('#lounge-input-pw');
  var $createModal = $('#lounge-modal-create');
  var $joinModal = $('#lounge-modal-join');
  var $listContainer = $('#lounge-container-list');
  var $galleryContainer = $('#lounge-container-gallery');
  var $btnCancelCreate = $('#lounge-btn-cancel');
  var $btnCreate = $('#lounge-btn-create');
  var $joinModalBtnCancel = $('#lounge-btn-cancel-join')
  var $joinModalBtnJoin = $('#lounge-btn-join')
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
      .append('<video id="local-video" autoplay controls muted>')
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

  function handleJoinPrivate(roomName, callback){
    var pwd = $('#lounge-input-verify').val();
    console.log('password given', pwd);
    if (!pwd){
      alert('Cannot have empty password');
      return false;
    }
    var encoded = window.btoa(pwd);
    callback(roomName, encoded);
  }

  function roomItemClicked(roomName, isLocked, callback){
    console.log(roomName+"selected");
    if (isLocked){
      $joinModal.removeClass('hide').addClass('show');
      $joinModalBtnJoin.bind('click', function(){
        $joinModal.removeClass('show').addClass('hide');
        handleJoinPrivate(roomName, callback);
      });
      $joinModalBtnCancel.bind('click', function(){
        $joinModal.removeClass('show').addClass('hide');
      })
    } else {
      callback(roomName);
    }
  }

  function roomGenerateList(rooms, callback){
    Object.keys(rooms).forEach(function(name){
      (function(roomName, rooms, callback){

        var isLocked = rooms[roomName].isLocked;
        var classtype = isLocked ? 'list-item locked' : 'list-item unlocked';
        var attribs = {
          id: 'lounge-room-item-'+roomName,
          class: classtype,
          title: roomName
        };
        $('<li>', attribs)
        .bind('click', function(){
          roomItemClicked(roomName, isLocked, callback);
        })
        .append(roomName)
        .appendTo('#list-items');
      })(name, rooms, callback);
    });
  }

  function generateRoomList(rooms, callback){
    $('#list-items').empty();
    roomGenerateList(rooms, callback);
  }

  function deleteRoomFromList(name){
    var encoded = window.btoa(name);
    $('#lounge-room-item-'+encoded).remove();
  }

  function addRoomItem(room, callback){
    roomGenerateList(room, callback);
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
    $('<div/>', {class:'lounge-media-layout'})
      .append('<video id="'+pid+'" autoplay controls>')
      .appendTo('#lounge-video-container');
    var $ml = $('.lounge-media-layout');
    var percent = (100 / $ml.length);
    $ml.css('width',percent+'%');
  }

  function deletePeerMedia(pid){
    $('#'+pid).parent().remove();
    var $ml = $('.lounge-media-layout');
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
    addRoomItem: addRoomItem,
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

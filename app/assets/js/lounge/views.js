
function LoungeViews(engine){

  var $lock = $('#lounge-ck-lock');
  var $password = $('#lounge-input-pw');
  var $createModal = $('#lounge-modal-create');
  var $joinModal = $('#lounge-modal-join');
  var $listContainer = $('#lounge-container-list');
  var $galleryContainer = $('#lounge-container-gallery');
  var $imageList = $('#lounge-list-image');
  var $btnSnapshot = $('#lounge-btn-snapshot');
  var $btnCancelCreate = $('#lounge-btn-cancel');
  var $btnCreate = $('#lounge-btn-create');
  var $joinModalBtnCancel = $('#lounge-btn-cancel-join')
  var $joinModalBtnJoin = $('#lounge-btn-join')
  var $room = $('#lounge-input-roomname');
  var $video = $('#lounge-video-container');
  var $title = $('#lounge-room-title');
  var $callCreateModal = $('#lounge-list-menu');
  var $imageModal = $('#lounge-modal-image-fullsize');
  var $imageModalCanvas = $('.lounge-fullsize');
  var engine = engine; // rtc engine


  function handleSnapshot(){
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var video = $('#local-video');
    //var width = video.innerWidth();
    //var height = video.innerHeight();
    var width = 640;
    var height = 480;
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(video[0], 0, 0, width, height);
    var data = canvas.toDataURL("image/jpeg");
    swal({
      title: 'Good to go?',
      text: 'Hit \'c\' to take another one.',
      showCancelButton: true,
      cancelButtonText: 'Don\'t Send!',
      confirmButtonText: 'Yes, please send.',
      imageUrl: data,
      imageSize: "320x240"
    }, function(ok){
      if (ok){
        if (engine){
          console.log('sending data through datachannel');
          engine.sendString(data, false);
        }
      }
    });
  }

  function bindSnapshotKeypress(event){
    // press 'c' to trigger
    if (event.charCode === 99){
      handleSnapshot();
    }
  }

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
    $btnSnapshot.bind('click', handleSnapshot);
  };

  function openCreateModal(){
    console.log('opening create room modal');
    $createModal.removeClass('hide').addClass('show');
    $lock.attr('checked',false);
    $password.val('').fadeOut();
  }

  function closeCreateModal(){
    console.log('closing room create modal');
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
  }

  function destroyListeners(engine){
    engine = null;
  }

  function onModalRoomJoin(event){
    var data = event.data;
    handleJoinPrivate(data.roomName, data.loungeCallback);
    onModalRoomAction();
  }

  function onModalRoomAction(){
    $joinModal.removeClass('show').addClass('hide');
  }

  function handleJoinPrivate(roomName, callback){
    var pwd = $('#lounge-input-verify').val();
    $joinModalBtnJoin.unbind('click', onModalRoomJoin);
    $joinModalBtnCancel.unbind('click', onModalRoomAction);
    if (!pwd){
      swal({ 
        title: "Empty Password",
        text: "Please enter a password.",
        type: "error",
        confirmButtonText: "Cool"
      });
      return false;
    }
    var encoded = window.btoa(pwd);
    callback(roomName, encoded);
  }

  function roomItemClicked(roomName, isLocked, callback){
    console.log(roomName + " selected");
    if (isLocked){
      $joinModal.removeClass('hide').addClass('show');
      $joinModalBtnJoin.bind('click', {
        roomName: roomName,
        loungeCallback: callback
      }, onModalRoomJoin);
      $joinModalBtnCancel.bind('click', onModalRoomAction);
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
    $('#lounge-room-item-'+name).remove();
  }

  function addRoomItem(room, callback){
    roomGenerateList(room, callback);
  }

  function openMediaViews(){
    $createModal.removeClass('show').addClass('hide');
    //$('#lounge-video-container').removeClass('hide').addClass('show');
    $video.fadeIn();
    document.addEventListener('keypress', bindSnapshotKeypress, false);
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
    document.removeEventListener('keypress', bindSnapshotKeypress, false);
    $video.empty(); 
    $lock.unbind('click', handleCreatePasswordCheck);
    $btnCancelCreate.unbind('click', handleCancelCreateModal);
    $callCreateModal.unbind('click', handleOpenCreateModal);
    openListContainer();
    $imageList.empty();
  }

  function updateTitle(room){
    $title.empty();
    if (room && room !== ""){
      $title.append('<p>Room: '+room+'</p>');
    }
  }

  function onImageMouseOver(event){
    $imageModal.removeClass('hide').addClass('show');
    $imageModalCanvas.prop({'src' : event.target.currentSrc});
  }

  function onImageMouseOut(){
    $imageModal.removeClass('show').addClass('hide');
  }

  function galleryAddImage(fromId, code){
    console.log('updating gallery list');
    swal({
      title: 'Received Image',
      text: 'Looks good?',
      showCancelButton: true,
      cancelButtonText: 'Yuck!',
      confirmButtonText: 'Lovely!',
      imageUrl: code,
      imageSize: "320x240"
    }, function(ok){
      if (ok){
        $('<img src="'+code+'" width="100%"/>') 
        .mouseenter(onImageMouseOver)
        .mouseleave(onImageMouseOut)
        .appendTo($imageList);
      }
    });
  }

  initialize();

  return {
    galleryAddImage: galleryAddImage,
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

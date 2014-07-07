
function HallwayViews(){

  var localId;

  this.openMediaViews = function(){
    $('#room-input').css('display','none');
    $('#video-container').css('display','block');
  };

  this.closeMediaViews = function(destroyCallback){
    $('#video-container').fadeOut(function(){
      $('#room-input').fadeIn(200, destroyCallback);
    });
  };

  this.appendMedia = function(pid){
    $('<div/>', {class:'media-layout'})
      .append('<video id=\"'+pid+'\" autoplay="autoplay" controls="controls">')
      .append('<textarea id=\"'+pid+'-ta\"></textarea>')
      .appendTo('#video-container');
  }

  this.updateTextArea = function(pid, code){
    var $ta = $('#'+pid+'_ta');
    if (code == '8'){
      $ta.val( val( $ta.val().slice(0,-1) );); 
    } else{
      var ch = String.fromCharCode(code);
      $ta.val($ta.val() + ch);
    }
    $ta.scrollTop($ta[0].scrollHeight);
  }
};

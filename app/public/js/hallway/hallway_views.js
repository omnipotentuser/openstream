
function HallwayViews(){

  this.openMediaViews = function(){
    $('#room-input').css('display','none');
    $('#video-container').css('display','inline-block');
  };

  this.closeMediaViews = function(destroyCallback, next){
    $('#video-container').fadeOut(function(){
      $('#room-input').fadeIn( 200, function destroyCB(){
        destroyCallback(next);
      });
    });
  };

  this.appendPeerMedia = function(pid){
    console.log('appendPeerMedia', pid);
    $('<div/>', {class:'media-layout'})
      .append('<video id=\"'+pid+'\" autoplay="autoplay" controls="controls">')
      .append('<textarea id=\"'+pid+'-ta\"></textarea>')
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

  this.updateTextArea = function(pid, code){
    var $ta = $('\"#'+pid+'_ta\"');
    if (code == '8'){
      $ta.val( val( $ta.val().slice(0,-1) )); 
    } else{
      var ch = String.fromCharCode(code);
      $ta.val($ta.val() + ch);
    }
    $ta.scrollTop($ta[0].scrollHeight);
  }
};

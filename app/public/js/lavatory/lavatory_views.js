
function LavatoryViews(){
  // todo build echo app!
  var $startbtn = $('.lavatory-engage');
  var $bitratebtn = $('#lavatory-btn-bitrate');
  var $container = $('.lavatory-container-location'); 
  var $bitratedropdown = $('#lavatory-dropdown-bitrate');
  var engage = false;
  var bitratevisible = false;

  $startbtn.on('click', function(e){
    engage = !engage;
    if (engage){
      $startbtn.html('stop');
      $container.css('display','inline-block');
    } else {
      $startbtn.html('start');
      $container.css('display','none');
    }
    console.log('engaged', engage);
  });

  $bitratebtn.on('click', function(e){
    bitratevisible = !bitratevisible;
    if (bitratevisible){
      $bitratedropdown.css('display','block');
    } else {
      $bitratedropdown.css('display','none');
    }
    console.log('bitratevisible', bitratevisible);
  });
};

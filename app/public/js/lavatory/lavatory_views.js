
function LavatoryViews(){
  // todo build echo app!
  var $startbtn = $('.lavatory-engage');
  var $local = $('#lavatory-local');
  var $remote = $('#lavatory-remote');
  var engage = false;

  $startbtn.on('click', function(e){
    engage = !engage;
    if (engage){
      $startbtn.html('stop');
      $('.lavatory-container-location').css('display','inline-block');
      //$local.css('display','inline-block');
      //$remote.css('display','inline-block');
    } else {
      $startbtn.html('start');
      $('.lavatory-container-location').css('display','none');
      //$local.css('display','none');
      //$remote.css('display','none');
    }
    console.log('engaged', engage);
  });
};

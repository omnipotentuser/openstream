
function ModularViews(){
  var link = $('#lobby-link');
  var linkClick = function(){
    link.click(function(){
      log('clicked');
      $('#lobby-main').fadeOut(function(){
          $('#lobby-main').fadeIn();
      });
    });
  }

  linkClick();

};

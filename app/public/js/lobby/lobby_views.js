
function LobbyViews(){
  var lobby = $('#lobby-link');
  var lavatory = $('#lavatory-link');
  var conference = $('#conference-link');
  var lounge = $('#lounge-link');
  var stage = $('#stage-link');
  var hallway = $('#hallway-link');
  var modular = $('#modular-link');

  var linkClick = function(){
    lobby.click(function(){
      log('clicked');
      $('#lobby-main').fadeOut(function(){
          $('#lobby-main').fadeIn();
      });
    });

    lavatory.click(function(){
      log('lavatory clicked');
      $('#lobby-main').fadeOut(function(){
          $('#lavatory-main').fadeIn();
      });
    });

    conference.click(function(){
      log('Conference clicked');
      $('#lobby-main').fadeOut(function(){
          $('#conference-main').fadeIn();
      });
    });

    lounge.click(function(){
      log('Lounge clicked');
      $('#lobby-main').fadeOut(function(){
          $('#lounge-main').fadeIn();
      });
    });

    stage.click(function(){
      log('Stage clicked');
      $('#lobby-main').fadeOut(function(){
          $('#stage-main').fadeIn();
      });
    });

    modular.click(function(){
      log('Modular clicked');
      $('#lobby-main').fadeOut(function(){
          $('#modular-main').fadeIn();
      });
    });

    hallway.click(function(){
      log('Hallway clicked');
      $('#lobby-main').fadeOut(function(){
          $('#hallway-main').fadeIn();
      });
    });
  }

  linkClick();

};

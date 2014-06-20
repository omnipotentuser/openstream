
function LobbyViews(){

  var lobby = $('#lobby-banner'),
      lavatory = $('#lavatory-link'),
      conference = $('#conference-link'),
      lounge = $('#lounge-link'),
      stage = $('#stage-link'),
      hallway = $('#hallway-link'),
      modular = $('#modular-link'),
      lobbyMain = $('#lobby-main'),
      currentPage = lobbyMain;

  var linkClick = function(){

    lobby.click(function(){
      console.log('Lobby banner clicked');
      lobby.fadeOut();
      currentPage.fadeOut( function(){
        lobbyMain.fadeIn();
      });
    });

    lavatory.click(function(){
      console.log('lavatory clicked');
      currentPage = $('#lavatory-main');
      lobbyMain.fadeOut(function(){
        $('#lavatory-main').fadeIn();
        lobby.fadeIn();
      });
    });

    conference.click(function(){
      console.log('Conference clicked');
      currentPage = $('#conference-main');
      lobbyMain.fadeOut(function(){
        $('#conference-main').fadeIn();
        lobby.fadeIn();
      });
    });

    lounge.click(function(){
      console.log('Lounge clicked');
      currentPage = $('#lounge-main');
      lobbyMain.fadeOut(function(){
        $('#lounge-main').fadeIn();
        lobby.fadeIn();
      });
    });

    stage.click(function(){
      console.log('Stage clicked');
      currentPage = $('#stage-main');
      lobbyMain.fadeOut(function(){
        $('#stage-main').fadeIn();
        lobby.fadeIn();
      });
    });

    modular.click(function(){
      console.log('Modular clicked');
      currentPage = $('#modular-main');
      lobbyMain.fadeOut(function(){
        $('#modular-main').fadeIn();
        lobby.fadeIn();
      });
    });

    hallway.click(function(){
      console.log('Hallway clicked');
      currentPage = $('#hallway-main');
      lobbyMain.fadeOut(function(){
        $('#hallway-main').fadeIn();
        lobby.fadeIn();
      });
    });


  }

  linkClick();

};

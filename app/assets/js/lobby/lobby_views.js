
function LobbyViews(cb){

  var LARGE = 1400;
  var MID = 1024;
  var SMALL = 800;
  var $body = $('body');
  var $banner = $('#lobby-banner');

  window.addEventListener('resize', function(){
    var wwidth = window.innerWidth;
    if ( wwidth < MID ){
      $body.css('left',0);
      $body.css('right',0);
      $banner.css('right', 0);
    } else {
      $body.css('left',200);
      $body.css('right',200);
      $banner.css('right', -150);
    }
  }, true)
  $(document).ready(function(){
    window.dispatchEvent(new Event('resize'));
  });

  var lobby = $('#lobby-banner'),
      lavatory = $('#lavatory-link'),
      conference = $('#conference-link'),
      lounge = $('#lounge-link'),
      stage = $('#stage-link'),
      hallway = $('#hallway-link'),
      modular = $('#modular-link'),
      lobbyMain = $('#lobby-main'),
      currentPage = lobbyMain;

  var lobbyPage = function(){
    lobby.fadeOut();
    currentPage.fadeOut( function(){
      lobbyMain.fadeIn();
    });
    currentPage = lobbyMain;
    cb('lobby');
  };

  var conferencePage = function(){
    currentPage = $('#conference-main');
    lobbyMain.fadeOut(function(){
      currentPage.fadeIn();
      lobby.fadeIn();
    });
    cb('conference');
  };

  var lavatoryPage = function(){
    currentPage = $('#lavatory-main');
    lobbyMain.fadeOut(function(){
      currentPage.fadeIn();
      lobby.fadeIn();
    });
    cb('lavatory');
  };

  var loungePage = function(){
    currentPage = $('#lounge-main');
    lobbyMain.fadeOut(function(){
      currentPage.fadeIn();
      lobby.fadeIn();
    });
    cb('lounge');
  };

  var stagePage = function(){
    currentPage = $('#stage-main');
    lobbyMain.fadeOut(function(){
      currentPage.fadeIn();
      lobby.fadeIn();
    });
    cb('stage');
  };

  var modularPage = function(){
    currentPage = $('#modular-main');
    lobbyMain.fadeOut(function(){
      currentPage.fadeIn();
      lobby.fadeIn();
    });
    cb('modular');
  };

  var hallwayPage = function(){
    currentPage = $('#hallway-main');
    lobbyMain.fadeOut(function(){
      currentPage.fadeIn(function(){
        $('#roomnameinput').focus();
      });
      lobby.fadeIn();
    });
    cb('hallway');
  }

  var pages = {
    lavatory: lavatoryPage,
    conference: conferencePage,
    lounge: loungePage,
    lobby: lobbyPage,
    stage: stagePage,
    modular: modularPage,
    hallway: hallwayPage
  };

  return {pages: pages};
}

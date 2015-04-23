
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
      $body.css('left',20);
      $body.css('right',20);
      $banner.css('right', 30);
    }
  }, true)
  $(document).ready(function(){
    window.dispatchEvent(new Event('resize'));
  });

  var $lobby_banner = $('#lobby-banner'),
      $lavatory = $('#lavatory-link'),
      $conference = $('#conference-link'),
      $lounge = $('#lounge-link'),
      $stage = $('#stage-link'),
      $hallway = $('#hallway-link'),
      $modular = $('#modular-link'),
      $lobbyPage = $('#lobby-main'),
      currentPage = $lobbyPage;

  var lobbyPage = function(){
    $lobby_banner.fadeOut();
    currentPage.fadeOut( function(){
      $lobbyPage.fadeIn();
    });
    currentPage = $lobbyPage;
    cb('lobby');
  };

  var conferencePage = function(){
    currentPage = $('#conference-main');
    $lobbyPage.fadeOut(function(){
      currentPage.fadeIn();
      $lobby_banner.fadeIn();
    });
    cb('conference');
  };

  var lavatoryPage = function(){
    currentPage = $('#lavatory-main');
    $lobbyPage.fadeOut(function(){
      currentPage.fadeIn();
      $lobby_banner.fadeIn();
    });
    cb('lavatory');
  };

  var loungePage = function(){
    currentPage = $('#lounge-main');
    $lobbyPage.fadeOut(function(){
      currentPage.fadeIn();
      $lobby_banner.fadeIn();
    });
    cb('lounge');
  };

  var stagePage = function(){
    currentPage = $('#stage-main');
    $lobbyPage.fadeOut(function(){
      currentPage.fadeIn();
      $lobby_banner.fadeIn();
    });
    cb('stage');
  };

  var modularPage = function(){
    currentPage = $('#modular-main');
    $lobbyPage.fadeOut(function(){
      currentPage.fadeIn();
      $lobby_banner.fadeIn();
    });
    cb('modular');
  };

  var hallwayPage = function(){
    currentPage = $('#hallway-main');
    $lobbyPage.fadeOut(function(){
      currentPage.fadeIn(function(){
        $('#roomnameinput').focus();
      });
      $lobby_banner.fadeIn();
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

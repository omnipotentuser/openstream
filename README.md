openstream
==========

```
 _______  _______  _______  _        _______ _________ _______  _______  _______  _______ 
(  ___  )(  ____ )(  ____ \( (    /|(  ____ \\__   __/(  ____ )(  ____ \(  ___  )(       )
| (   ) || (    )|| (    \/|  \  ( || (    \/   ) (   | (    )|| (    \/| (   ) || () () |
| |   | || (____)|| (__    |   \ | || (_____    | |   | (____)|| (__    | (___) || || || |
| |   | ||  _____)|  __)   | (\ \) |(_____  )   | |   |     __)|  __)   |  ___  || |(_)| |
| |   | || (      | (      | | \   |      ) |   | |   | (\ (   | (      | (   ) || |   | |
| (___) || )      | (____/\| )  \  |/\____) |   | |   | ) \ \__| (____/\| )   ( || )   ( |
(_______)|/       (_______/|/    )_)\_______)   )_(   |/   \__/(_______/|/     \||/     \|
                                                                                          
```                                                                
                                                                                          

Generic streaming with a MCU to control the connection type and data exchange using WebRTC.

Follows the Single Page Web Application philosophy for building a full stack javascript to javascript front to back platform. In this platform, Videophone is used as the system that takes this philosophy into a good scenario showing that a full enterprise ready application is possible with pure JavaScript custom framework.

I only chose to go pure JavaScript with custom framework my own way to demonstrate the very possibility of building an entire platform without using a popular framework WITHOUT TOO MUCH EFFORT. It takes discipline and organized structure of representing data before proceeding doing things yourself. The reasoning behind customizing is to have complete control of the MVC and easily swap out libraries (sweetalert.js, please.js, and so on) for handling the smaller pieces.

####Styling:
---
Each component shall be broken down into its own style file. For example, the button component shall be written in button.styl (rendered to button.css) and all view applications will use those style files to indicate the size and state such as show/hide and colors to represent meanings.

####Views Logic:
---
All DOM manipulation shall be written in the view.js where it belongs to each application in the platform. For example, in the Hallway app, assets/js/hallway/hallway_views.js, we place DOM logic using jquery to manipulate DOM.

####Controller Logic:
---
All event calls that handle data goes through the shell. I name it shell because it represents the layer that comes between the view and model shell. Each of the MVC piece is its own shell.

####Installation Instruction:
---
Clone the project from github:

```
git clone git@github.com:omnipotentuser/openstream.git
cd openstream
npm install
gulp
npm start
```
You will have to install [http://janus.conf.meetecho.com/](git@github.com:meetecho/janus-gateway.git) server and may want to set up your own proxying rules by using Nginx or Haproxy.

Janus is used for gateway and echo test which is what the Lavatory app uses.

Openstream is set to port 9990.

*notice*
You need to create a config.js file in the root directory. The config file currently only exists for obtaining key from TURN server to be inserted into the ICE config. The config needs to look like this:

```
module.exports = {
  thirdparty : {
    turn_secret : "<your secret key>"
  }
};
```

You can set the turn_secret to empty. MCU will then just use public ICE configs which as expected will have less network penetration power. I use xirsys turn server which is pretty nice and easy to set up for general purpose turn relaying. For more fine control I recommend checking out RFC5766-turn-server at [https://code.google.com/p/rfc5766-turn-server/wiki/newDownloadsSite](https://code.google.com/p/rfc5766-turn-server/wiki/newDownloadsSite).


###Working apps:

---

**Hallway**

The app is found at [openstream.openhack.net/hallway](http://openstream.openhack.net/hallway)

Give the room a name, whatever you desire. The auto room generation is useful if the name needs to be anonymous.

Be sure to allow the browser to accept the webcam permission. Opera, Firefox and Chrome works on Linux, OSX, and Windows, and Android.

---

**Lavatory**

The app is found at [openstream.openhack.net/lavatory](http://openstream.openhack.net/lavatory)

Often measuring the network traffic by using some obscure JavaScript bandwidth assessment test to measure payloads in order to determine latency for video streaming in real time, does not match real world experience. Bandwith varies greatly from hiccups to bursts so the most effective way to determine our streaming experience with respect to our network is to echo back ourselves from the server. This is where the Lavatory application comes in.

We have to keep in mind the hardware limitations for handling encoding and decoding of video and audio compression in real time. Unlike playback video that can be buffered and played at a later time, real time streaming has to have buffered video in the hundreds of milliseconds or lower in order to keep the lag between current time and delivered time as close as possible.

**Lounge**

The app is found at [openstreamopenhack.net/lounge](http://openstream.openhack.net/lounge)

At first glance, nothing out of ordinary, a chatroom with room list to enter from. What makes this app stand out from the typical list-oriented chatroom is that this is also able to send images from screenshots taken through the webcam. The purpose of the screenshot is to broadcast it to everyone in the room.

In other words: a chat room that shares screenshots. A good usage would be playing Magic: The Gathering and take snapshots of our cards and send out to everyone for better viewing of the cards.


---

**Build and Development Tools**

* Gulp
* Uglify
* Livereload
* JSHint
* Karma
* Jasmine
* PhantomJS
* PioneerJS

---

**Versioning**

OpenStream goes by MAJOR.MINOR.PATCH and will be building starting at 1.0.0. For each new app added a MINOR is incremented even numbers. Odd MINOR indicates development. PATCH may include any fixes around the platform not related to any yet developed application within the platform.

MAJOR increment indicates a new architect to the front or back, rather than representing new app introduction.

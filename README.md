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

###Working apps:

---

**Hallway**

The app is found at [openstream.openhack.net/hallway](http://openstream.openhack.net#hallway)

Give the room a name, whatever you desire. The auto room generation is useful if the name needs to be anonymous.

Be sure to allow the browser to accept the webcam permission. Opera, Firefox and Chrome works on Linux, OSX, and Windows, and Android.

---

**Lavatory**

The app is found at [openstream.openhack.net/lavatory](http://openstream.openhack.net/lavatory)

Often measuring the network traffic by using some obscure JavaScript bandwidth assessment test to measure payloads in order to determine latency for video streaming in real time, does not match real world experience. Bandwith varies greatly from hiccups to bursts so the most effective way to determine our streaming experience with respect to our network is to echo back ourselves from the server. This is where the Lavatory application comes in.

We have to keep in mind the hardware limitations for handling encoding and decoding of video and audio compression in real time. Unlike playback video that can be buffered and played at a later time, real time streaming has to have buffered video in the hundreds of milliseconds or lower in order to keep the lag between current time and delivered time as close as possible.

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

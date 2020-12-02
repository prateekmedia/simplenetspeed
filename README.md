<p align="center"><a href="https://extensions.gnome.org/extension/3724/net-speed-simplified/"><img src="https://user-images.githubusercontent.com/41370460/97136201-7d432980-1778-11eb-9c65-4c801a7e8e56.png" height=80px alt="NSS Logo"/></a></p>
<h1 align="center">Net speed Simplified</h1>
<h5 align="center"><i>A Net Speed indicator With Loads of Features.</i></h5>

[<img src="https://raw.githubusercontent.com/andyholmes/gnome-shell-extensions-badge/master/get-it-on-ego.svg?sanitize=true" height="100" alt="Get it on GNOME Extensions">](https://extensions.gnome.org/extension/3724/net-speed-simplified/) or [Install Manually](#installing-manually)

> Forked from : [biji@gnome/simplenetspeed](https://github.com/biji/simplenetspeed)

<p align="center"><img src='https://raw.githubusercontent.com/prateekmedia/netspeedsimplified/main/screenshoot.png' width="500px"  alt="Screenshot"/>

*Screenshots*</p>

**Current Version** : ***22***

***Tested on GNOME 3.36 and 3.38***

#### Whats new in v20 and above:
- [x] Completely revamped whole codebase
- [x] Add Show Upload First button to show upload speed first
- [x] Add Color Customizations to make the extension your own  
- ( Thanks to [m0hithreddy@github](https://github.com/m0hithreddy) for above features )   
- [x] Add Use Monospace Font button in Preferences
- [x] Add Hide when Disconnected button in Preferences

#### Feature Highlights :
- [x] Adjustable Refresh time
- [x] Supports GNOME SHELL 3.38 and Backwards compatible
- [x] More cleaner ui
- [x] Add space b/w speed and their units
- [x] Add [Preference](#Feature-Highlights-for-Prefrences) Menu for extension customization
- [x] Add Vertical Alignment Support
- [x] Add Two Icon sets for Indicators

#### Feature Highlights for Prefrences
- [x] Add Lock Mouse Actions button to Freeze [Mouse Events](#mouse-events)
- [x] Add Position menu(with Advanced option) to pinpoint where to place the indicator on the Panel.
- [x] Add Refresh time field by which you can change refresh time value between 1.0 sec to 10.0 sec.


if you faced a **issue** then you can **[file an issue here](https://github.com/prateekmedia/netspeedsimplified/issues)**
 
#### Modes
- Total net speed in bits per second
- Total net speed in Bytes per second
- Up & down speed in bits per second
- Up & down speed in Bytes per second
- Total of downloaded in Bytes (Right click to reset counter)

#### Mouse Events
- **Left click to change [modes](#modes)**

- **Right click to toggle total data usage visibility** 

- **Right click continuously for 4 times in any mode to toggle vertical alignment**  

- **Middle click to change font size**


<h2 align="center">Installing Manually:</h2>   
  
## Quick install
The extension can be quicky installed as following:

    $ /bin/bash -c "$(curl -sL https://git.io/Jk28b)"


## Installing using Make
The Extension can be managed using Make build system as follows

* Getting the sources from repository

      $ git clone https://github.com/prateekmedia/netspeedsimplified.git

* Running make (install)

      $ make install

Likewise extension can be removed  
```$ make remove```  
OR reinstalled  
```$ make reinstall```  


You can manage the extension using extensions app or [website](https://extensions.gnome.org/local) or Using Gnome tweaks tool's extension tab  

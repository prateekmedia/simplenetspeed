<p align="center"><a href="https://extensions.gnome.org/extension/3724/net-speed-simplified/"><img src="https://raw.githubusercontent.com/prateekmedia/netspeedsimplified/main/images/icon.png" height=80px alt="NSS Logo"/></a></p>
<h1 align="center">Net speed Simplified</h1>
<p align="center"><i><b>A Net Speed extension With Loads of Customization.</b></i></p>
<p align="center">
<a href="https://github.com/prateekmedia/netspeedsimplified/releases"><img alt="GitHub release" src="https://img.shields.io/github/v/release/prateekmedia/netspeedsimplified"/></a> <a href="LICENSE"><img alt="License" src="https://img.shields.io/github/license/prateekmedia/netspeedsimplified?color=blue"/></a>
</p>

[<img src="https://raw.githubusercontent.com/andyholmes/gnome-shell-extensions-badge/master/get-it-on-ego.svg?sanitize=true" height="100" alt="Get it on GNOME Extensions">](https://extensions.gnome.org/extension/3724/net-speed-simplified/) or [Install Manually](#installing-manually)

<p align="center"><img src='https://raw.githubusercontent.com/prateekmedia/netspeedsimplified/main/images/screenshoot.png' width="500px"  alt="Screenshot"/>
</p>

***Tested on GNOME 40***

#### What's new
- [x] Add Limit Unit option
- [x] Add Gnome 40 Support
- [x] Fix a bug where refresh time was getting reset to 6.5
- [x] Used Min Width 3.0 by default

#### Features
- [x] Cleaner UI
- [x] Adjustable Refresh rate
- [x] [Preference](#Feature-Highlights-for-Preferences) Menu for extension customization
- [x] *Vertical Alignment* Support
- [x] *Two Icon sets* for Indicators

#### Feature Highlights for Preferences
- [x] *Lock Mouse Actions* button to Freeze [Mouse Events](#mouse-events)
- [x] *Advance Position* options to pinpoint where to place the indicator on the Panel
- [x] *Refresh time* field by which you can change refresh rate value between 1.0 sec to 10.0 sec
- [x] Show Upload First button to show upload speed first
- [x] Color Customizations to make the extension your own
- [x] *Hide when Disconnected* button in Preference
- [x] *Use Shorten Units* button in Preference
and more...

If you faced an **issue** then you can **[file an issue here](https://github.com/prateekmedia/netspeedsimplified/issues)**
 
#### Modes
1. `Total net speed in b/s, kb/s, ...`
1. `Total net speed in B/s, KB/s, ...`
1. `Up & down speed in b/s, kb/s, ...`
1. `Up & down speed in B/s, KB/s, ...`
1. `Total downloads in B, KB, ... (Right click to reset counter)`

#### Mouse Events
- **Left click**: Cycle through the [modes](#modes).
- **Right click(in first four modes)**: Toggle the visibility of total downloaded.
- **Right click(in fifth mode)**: Reset total downloaded.
- **Right Click(Four consecutive times)**: Toggle through horizantal/vertical alignment.
- **Middle click**: Cycle through the font sizes.

#### *Special Thanks to*
- [biji](https://github.com/biji) for Creating [simplenetspeed](https://github.com/biji/simplenetspeed)
- [m0hithreddy](https://github.com/m0hithreddy) for his support in rewriting extension.js with Clutter and rewriting readme.md, Adopting Make build system and more..
[Know More](https://github.com/prateekmedia/netspeedsimplified/graphs/contributors)

<h2 align="center">Installing Manually</h2>
  
### Quick install
For quick install use below command:

    $ bash -c "$(curl -sL https://git.io/Jk28b)"


### Installing using Make
* Step 1 : Getting the sources from repository

      $ git clone https://github.com/prateekmedia/netspeedsimplified.git

* Step 2 : Running make (install)

      $ make install

Likewise extension can be removed  
```$ make remove```  
OR reinstalled  
```$ make reinstall```  


You can manage the extension using extensions app or [website](https://extensions.gnome.org/local)

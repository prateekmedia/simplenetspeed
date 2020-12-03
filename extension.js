//Imports
const Clutter = imports.gi.Clutter,
 St = imports.gi.St,
 Main = imports.ui.main,
 Gio = imports.gi.Gio,
 PanelMenu = imports.ui.panelMenu,
 Mainloop = imports.mainloop,
 Me = imports.misc.extensionUtils.getCurrentExtension(),
 Convenience = Me.imports.convenience,
 schema = 'org.gnome.shell.extensions.netspeedsimplified',
 ButtonName = "ShowNetSpeedButton",
 rCConst=4; //Right Click 4 times to toggle Vertical Alignment

let settings, timeout,
  lastCount = 0, lastSpeed = 0, lastCountUp = 0,
  resetNextCount=false, resetCount=0,
  hideCount=8;

// Settings
var crStng; //Initialized in enable()

function fetchSettings() {
    crStng = {
        refreshTime: settings.get_double('refreshtime'),
        mode: settings.get_int('mode'),
        fontmode: settings.get_int('fontmode'),
        showTotalDwnld: settings.get_boolean('togglebool'),
        isVertical: settings.get_boolean('isvertical'),
        chooseIconSet: settings.get_int('chooseiconset'),
        revIndicator: settings.get_boolean('reverseindicators'),
        lckMuseAct: settings.get_boolean('lockmouseactions'),
        nsPos: settings.get_int('wpos'),
        nsPosAdv: settings.get_int('wposext'),
        usColor: settings.get_string('uscolor'),
        dsColor: settings.get_string('dscolor'),
        tsColor: settings.get_string('tscolor'),
        tdColor: settings.get_string('tdcolor')
    };

    initNs();
}

function pushSettings() {
    settings.set_int('mode', crStng.mode);
    settings.set_int('fontmode', crStng.fontmode); 
    settings.set_boolean('togglebool', crStng.showTotalDwnld);
    settings.set_boolean('isvertical', crStng.isVertical);

    initNs();
}

//Helper Functions
function DIcons(iNum) {
    return [  ["🡳","🡱","Σ"] , ["↓","↑","∑"]  ][crStng.chooseIconSet][iNum];
}

function nsPos() {
    return ["right", "left", "center"][crStng.nsPos];
}

function nsPosAdv() {
    return [3, 0][crStng.nsPosAdv];
}

function speedToString(amount, rMode = 0) {

    let speed_map = [" B", "KB", "MB", "GB"].map(
        (rMode == 1 && (crStng.mode == 1 || crStng.mode == 3 || crStng.mode == 4)) ? v => v : //KB
        (rMode == 1 && (crStng.mode == 0 || crStng.mode == 2)) ? v => v.toLowerCase() : //kb
        (crStng.mode == 0 || crStng.mode == 2) ? v => v.toLowerCase() + "/s" : //kb/s
        (crStng.mode == 1 || crStng.mode == 3) ? v => v + "/s" : v=>v); //KB/s
    
    if (amount === 0) return "  0.0 "  + speed_map[0];
    if (crStng.mode == 0 || crStng.mode == 2) amount = amount * 8;

    let unit = 0;
    while (amount >= 1000) { // 1M=1024K, 1MB/s=1000MB/s
        amount /= 1000;
        ++unit;
    }

    let digits = (crStng.mode==4 || rMode !=0) ? 2 /* For floats like 21.11 and total speed mode */ : 1 //For floats like 21.2

	let spaceNum = 3 - Math.ceil(Math.log10(amount +1));

    return " ".repeat(spaceNum) + amount.toFixed(digits) + " " + speed_map[unit];
}

// NetSpeed Components
var usLabel, dsLabel, tsLabel, tdLabel, usIcon, dsIcon, tsIcon, tdIcon;

function getStyle(isIcon = false) {
	return (isIcon) ? 'size-' + (String(crStng.fontmode)) : ('forall size-' + String(crStng.fontmode))
}
function initNsLabels() {
    usLabel = new St.Label({
        text: '--',
        y_align: Clutter.ActorAlign.CENTER,
        style_class: getStyle(),
        style: "color: " + crStng.usColor
    });

    dsLabel = new St.Label({
        text: '--',
        y_align: Clutter.ActorAlign.CENTER,
        style_class: getStyle(),
        style: "color: " + crStng.dsColor
    });

    tsLabel = new St.Label({
        text: '--',
        y_align: Clutter.ActorAlign.CENTER,
        style_class: getStyle(),
        style: "color: " + crStng.tsColor
    });

    tdLabel = new St.Label({
        text: '--',
        y_align: Clutter.ActorAlign.CENTER,
        style_class: getStyle(),
        style: "color: " + crStng.tdColor
    });
    usIcon = new St.Label({
        text: DIcons(1),
        y_align: Clutter.ActorAlign.CENTER,
        style_class: getStyle(true),
        style: "color: " + crStng.usColor
    });

    dsIcon = new St.Label({
        text: DIcons(0),
        y_align: Clutter.ActorAlign.CENTER,
        style_class: getStyle(true),
        style: "color: " + crStng.dsColor
    });

    tsIcon = new St.Label({
        text: "⇅",
        y_align: Clutter.ActorAlign.CENTER,
        style_class: getStyle(true),
        style: "color: " + crStng.tsColor
    });

    tdIcon = new St.Label({
        text: DIcons(2),
        y_align: Clutter.ActorAlign.CENTER,
        style_class: getStyle(true),
        style: "color: " + crStng.tdColor
    });
}

function updateNsLabels(up, down, up_down, total) { //UpSpeed, DownSpeed, UpSpeed + DownSpeed, TotalDownloaded
    usLabel.set_text(up);
    dsLabel.set_text(down);
    tsLabel.set_text(up_down);
    tdLabel.set_text(total);
}

// Initalize NetSpeed
var nsButton = null, nsActor = null, nsLayout = null;

function initNs() {

    //Destroy the existing button.
    nsButton != null ? nsButton.destroy() : null;

    //Initialize component Labels
    initNsLabels();

    //Allocate 3 * 3 grid (suited for all modes)
    nsLayout = new Clutter.GridLayout();   
    nsLayout.insert_row(1);
    nsLayout.insert_row(2);
    nsLayout.insert_column(1);
    nsLayout.insert_column(2);

    nsActor = new Clutter.Actor({
        layout_manager: nsLayout,
        y_align: Clutter.ActorAlign.CENTER
    })
 
   let verticalConstant = (crStng.isVertical) ? 1 : 0 ;

    //Attach the components to the grid.
    if (crStng.mode == 0 || crStng.mode == 1) {
        nsLayout.attach(tsIcon, 0, 1, 1, 1);
        nsLayout.attach(tsLabel, 1, 1, 1, 1);

        if (crStng.showTotalDwnld) {
            nsLayout.attach(tdIcon,  2 - 2*verticalConstant, 1 + verticalConstant, 1, 1);
            nsLayout.attach(tdLabel, 3 - 2*verticalConstant, 1 + verticalConstant, 1, 1);
        }
    }
    else if (crStng.mode == 2 || crStng.mode == 3) {
        if (crStng.revIndicator) {
            nsLayout.attach(usIcon,  0, 1, 1, 1);
            nsLayout.attach(usLabel, 1, 1, 1, 1);
            nsLayout.attach(dsIcon,  2 - 2*verticalConstant, 1 + verticalConstant, 1, 1); 
            nsLayout.attach(dsLabel, 3 - 2*verticalConstant, 1 + verticalConstant, 1, 1);
        }
        else {
            nsLayout.attach(dsIcon,  0, 1, 1, 1);
            nsLayout.attach(dsLabel, 1, 1, 1, 1);
            nsLayout.attach(usIcon,  2 - 2*verticalConstant, 1 + verticalConstant, 1, 1); 
            nsLayout.attach(usLabel, 3 - 2*verticalConstant, 1 + verticalConstant, 1, 1);
        }

        if (crStng.showTotalDwnld) {
            nsLayout.attach(tdIcon,  5 - 2*verticalConstant, 1 + verticalConstant, 1, 1); 
            nsLayout.attach(tdLabel, 6 - 2*verticalConstant, 1 + verticalConstant, 1, 1);
        }
    }
    else {
        nsLayout.attach(tdIcon,  0, 1, 1, 1);
        nsLayout.attach(tdLabel, 1, 1, 1, 1);
    }

    //Create the button and add to Main.panel
    nsButton = new PanelMenu.Button(0.0, ButtonName);

    (!crStng.lckMuseAct) ? nsButton.connect('button-press-event', mouseEventHandler) : null;
    nsButton.add_child(nsActor);

    Main.panel.addToStatusArea(ButtonName, nsButton, nsPosAdv(), nsPos());
}

// Mouse Event Handler
var startTime = null, rClickCount = 0;

function mouseEventHandler(widget, event) {
    if (event.get_button() == 3) {
        if (crStng.mode == 4)
            resetNextCount = true; // right click: reset downloaded sum
        else
          crStng.showTotalDwnld = !(crStng.showTotalDwnld); // right click on other modes brings total downloaded sum

       // Logic to toggle crStng.isVertical after rCConstant consequent right clicks.
       if (startTime == null) {
           startTime = new Date();
       }

       if (((new Date() - startTime) / 1000) <= crStng.refreshTime * 2) {
           if (rClickCount == rCConst - 1) {
               crStng.isVertical = !(crStng.isVertical);
               startTime = null;
               rClickCount = 0;
           }
           else {
               rClickCount++;
           }
       }
       else {
           startTime = new Date();
           rClickCount = 1;
       }
    }
    else if (event.get_button() == 2) { // change font
        crStng.fontmode++;
        if (crStng.fontmode > 4) crStng.fontmode = 0;
    }
    else if (event.get_button() == 1) {
        crStng.mode++;
        if (crStng.mode > 4) crStng.mode = 0;
    }

    pushSettings();
}

function parseStat() {
    let toRestart = settings.get_boolean('restartextension');
    try {
        let input_file = Gio.file_new_for_path('/proc/net/dev');
        let fstream = input_file.read(null);
        let dstream = Gio.DataInputStream.new(fstream);

        let count = 0;
        let countUp = 0;
        let line;
        
        while (line = dstream.read_line(null)) {
            line = String(line);
            line = line.trim();
            let fields = line.split(/\W+/);
            if (fields.length<=2) break;

            if (fields[0] != "lo" && 
                !fields[0].match(/^virbr[0-9]+/) &&
                !fields[0].match(/^br[0-9]+/) &&
                !fields[0].match(/^vnet[0-9]+/) &&
                !fields[0].match(/^tun[0-9]+/) &&
                !fields[0].match(/^tap[0-9]+/) &&
                !isNaN(parseInt(fields[1]))) {
                    count = count + parseInt(fields[1]) + parseInt(fields[9]);
                    countUp = countUp + parseInt(fields[9]);
            }
        }
        fstream.close(null);

        if (lastCount === 0) lastCount = count;
        if (lastCountUp === 0) lastCountUp = countUp;

        let speed = (count - lastCount) / crStng.refreshTime, speedUp = (countUp - lastCountUp) / crStng.refreshTime;

        if (resetNextCount == true) {
            resetNextCount = false;
            resetCount = count;
        }
        
        (speed || speedUp) ? hideCount = 0 : hideCount++

        if(hideCount<=8) {
            updateNsLabels(" " + speedToString(speedUp),
            " " + speedToString(speed - speedUp),
            " " + speedToString(speed),
            " " + speedToString(count - resetCount, 1));
        }
        else updateNsLabels('--', '--', '--', " " + speedToString(count - resetCount, 1));

        lastCount = count;
        lastCountUp = countUp;
        lastSpeed = speed;

        if (toRestart == true){
            settings.set_boolean('restartextension', false);
            disable();
            enable();
        }
    } catch (e) {
        usLabel.set_text(e.message);
        tsLabel.set_text(e.message);
        tdLabel.set_text(e.message);
    }

    return true;
}

function init() {
    settings = Convenience.getSettings(schema);
}

function enable() {

    fetchSettings(); // Automatically creates the netSpeed Button.
    
    //Run infinite loop.
    timeout = Mainloop.timeout_add_seconds(crStng.refreshTime, parseStat);
}

function disable() {
    Mainloop.source_remove(timeout);
    nsButton.destroy();
    nsButton = null;
}


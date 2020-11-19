//Imports
const Clutter = imports.gi.Clutter,
 St = imports.gi.St,
 Main = imports.ui.main,
 Gio = imports.gi.Gio,
 Lang = imports.lang,
 PanelMenu = imports.ui.panelMenu,
 Mainloop = imports.mainloop;

 const ExtensionUtils = imports.misc.extensionUtils;
 const Me = ExtensionUtils.getCurrentExtension();
 const Convenience = Me.imports.convenience;

var toRestart;

const schema = 'org.gnome.shell.extensions.netspeedsimplified';

const ButtonName = "ShowNetSpeedButton";

const rCConst=4; //Right Click 4 times to change Vertical Alignment

let settings, timeout,
  spaCe,
  lastCount = 0, lastSpeed = 0, lastCountUp = 0,
  resetNextCount=false, resetCount=0,
  newLine, h=8, tTime=0;

var extRaw;

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
        nsPosAdv: settings.get_int('wposext')
    };

    initNs();
}

function pushSettings() {
    settings.set_double('refreshtime', crStng.refreshTime);
    settings.set_int('mode', crStng.mode);
    settings.set_int('fontmode', crStng.fontmode); 
    settings.set_boolean('togglebool', crStng.showTotalDwnld);
    settings.set_boolean('isvertical', crStng.isVertical);
    settings.set_int('chooseiconset', crStng.chooseIconSet);
    settings.set_boolean('reverseindicators', crStng.revIndicator);
    settings.set_boolean('lockmouseactions', crStng.lckMuseAct);
    settings.set_int('wpos', crStng.nsPos);
    settings.set_int('wposext', crStng.nsPosAdv);

    initNs();
}

// Helper Functions
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

    var speed_map = ["B", "KB", "MB", "GB"].map(
        (rMode == 1 && (crStng.mode == 1 || crStng.mode == 3 || crStng.mode == 4)) ? v => v : //KB
        (rMode == 1 && (crStng.mode == 0 || crStng.mode == 2)) ? v => v.toLowerCase() : //kb
        (crStng.mode == 0 || crStng.mode == 2) ? v => v.toLowerCase() + "/s" : //kb/s
        (crStng.mode == 1 || crStng.mode == 3) ? v => v + "/s" : v=>v); //KB/s
    
    if (amount === 0) return "0 "  + speed_map[0];
    if (crStng.mode == 0 || crStng.mode == 2) amount = amount * 8;

    let unit = 0;
    while (amount >= 1000) { // 1M=1024K, 1MB/s=1000MB/s
        amount /= 1000;
        ++unit;
    }

    function ChkifInt(amnt, digitsToFix = 1){
    	return Number.isInteger(parseFloat(amnt.toFixed(digitsToFix)));
    }

    var digits = ChkifInt(amount) ? 0 : //For Integer like 21.0
     ((crStng.mode==4 || rMode !=0) && !ChkifInt(amount*10)) ? 2 /* For floats like 21.11 */ : 1 //For floats like 21.2

    return String(amount.toFixed(digits)) + " " + speed_map[unit];
}

// NetSpeed Components
var usLabel, dsLabel, tsLabel, tdLabel;

function getStyle() {
    return ('forall size-' + String(crStng.fontmode));
}
function initNsLabels() {
    usLabel = new St.Label({
        text: '---',
        y_align: Clutter.ActorAlign.CENTER,
        style_class: getStyle()
    });

    dsLabel = new St.Label({
        text: '---',
        y_align: Clutter.ActorAlign.CENTER,
        style_class: getStyle()
    });

    tsLabel = new St.Label({
        text: '---',
        y_align: Clutter.ActorAlign.CENTER,
        style_class: getStyle()
    });

    tdLabel = new St.Label({
        text: '---',
        y_align: Clutter.ActorAlign.CENTER,
        style_class: getStyle()
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

    //Attach the components to the grid.
    if (crStng.mode == 0 || crStng.mode == 1) {
        nsLayout.attach(tsLabel, 1, 1, 1, 1);

        if (crStng.showTotalDwnld) {
            (crStng.isVertical) ? nsLayout.attach(tdLabel, 1, 2, 1, 1) : nsLayout.attach(tdLabel, 2, 1, 1, 1);
        }
    }
    else if (crStng.mode == 2 || crStng.mode == 3) {
        if (crStng.revIndicator) {
            nsLayout.attach(usLabel, 1, 1, 1, 1);
            (crStng.isVertical) ? nsLayout.attach(dsLabel, 1, 2, 1, 1) : nsLayout.attach(dsLabel, 2, 1, 1, 1);
        }
        else {
            nsLayout.attach(dsLabel, 1, 1, 1, 1);
            (crStng.isVertical) ? nsLayout.attach(usLabel, 1, 2, 1, 1) : nsLayout.attach(usLabel, 2, 1, 1, 1);
        }

        if (crStng.showTotalDwnld) {
            (crStng.isVertical) ? nsLayout.attach(tdLabel, 2, 2, 1, 1) : nsLayout.attach(tdLabel, 3, 1, 1, 1);
        }
    }
    else {
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
    toRestart = settings.get_boolean('restartextension');
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

        let speed = (count - lastCount) / crStng.refreshTime, speedUp = (countUp - lastCountUp) / crStng.refreshTime, 
        dot = (speed > lastSpeed) ? "⇅" : "";

        if (resetNextCount == true) {
            resetNextCount = false;
            resetCount = count;
        }
        
        (speed || speedUp) ? h = 0 : h++

        if(h<=8) {
            updateNsLabels(DIcons(1) + " " + speedToString(speedUp),
            DIcons(0) + " " + speedToString(speed - speedUp),
            dot + " " + speedToString(speed),
            DIcons(2) + " " + speedToString(count - resetCount, 1));
        }
        else updateNsLabels('--', '--', '--', DIcons(2) + " " + speedToString(count - resetCount, 1));

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
        dsLabel.set_text(e.message);
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

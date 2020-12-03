const Gtk = imports.gi.Gtk,
  Gdk = imports.gi.Gdk;

const Me = imports.misc.extensionUtils.getCurrentExtension(),
  Convenience = Me.imports.convenience,
  schema = "org.gnome.shell.extensions.netspeedsimplified";

function init(){}

function buildPrefsWidget(){
    let prefs = new Prefs(schema);

    return prefs.buildPrefsWidget();
}

function Prefs(schema){
    this.init(schema);
}

Prefs.prototype =
{
    settings: null,
    init: function(schema)
    {
  	let settings = new Convenience.getSettings(schema);
  	this.settings = settings;
    },
    
    buildPrefsWidget: function()
    {
    let thset = this.settings;
    
    function newGtkBox(){
      return new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top : 10, margin_bottom : 10});
    }

    function vBoxSpinBtn(getDouble, whichHbox, getLbl = "", getTooTip = "", lwer , uper, stpInc = 1, digs = 0, nume = true, pgeInc = 1, pgeSiz = 0, clmrate = 1){
        boolComp = (thset.get_double(getDouble) === thset.get_default_value(getDouble).unpack());
        getLbl =  boolComp ? getLbl :
          `<i>${getLbl}</i>`
        whichLbl = new Gtk.Label({label: getLbl, use_markup: true, xalign: 0, tooltip_text: getTooTip });  
      whichSpinBtn = new Gtk.SpinButton({
        adjustment: new Gtk.Adjustment({
          lower: lwer, upper: uper, step_increment: stpInc, page_increment: pgeInc, page_size: pgeSiz 
        }),
        climb_rate: clmrate,
        digits: digs,
        numeric: nume,
        });
        whichSpinBtn.set_value(thset.get_double(getDouble));
        whichSpinBtn.connect('value-changed', () => {
          this.rTValue = parseFloat(whichSpinBtn.get_value().toFixed(1));
          if(thset.get_double(getDouble) !== this.rTValue){
            thset.set_double(getDouble , this.rTValue);
            thset.set_boolean('restartextension' , true);
            }
          });
        whichHbox.pack_start(whichLbl, true, true, 0);
        whichHbox.add(whichSpinBtn);

        vbox.add(whichHbox);
        vbox.add(new Gtk.Separator({visible : true}));
    }
    
    function vBoxAddSeleCt(getInt, whichHbox, getLbl, aRray = [], getTooTip = ""){
      boolComp = (thset.get_int(getInt) == thset.get_default_value(getInt).unpack());
      getLbl =  boolComp ? getLbl :
        `<i>${getLbl}</i>`
      tootext = boolComp ? "" : "The Value is Changed"

      whichLbl = new Gtk.Label({label: getLbl, use_markup: true, xalign: 0,tooltip_text: getTooTip});
      whichVlue =  new Gtk.ComboBoxText({halign: Gtk.Align.END,  tooltip_text: tootext });

	    for (i in aRray){
	  	  whichVlue.append_text(aRray[i]);
      } 
      
      whichVlue.set_active(Math.round(thset.get_int(getInt))); 
      whichVlue.connect('changed', (widget) => {
        let valueMode = widget.get_active();
        thset.set_int(getInt, valueMode);
        thset.set_boolean('restartextension' , true);
      })
      whichHbox.add(whichLbl);
      whichHbox.pack_end(whichVlue, true, true, 0);

      vbox.add(whichHbox);
      vbox.add(new Gtk.Separator({visible : true}));
    }

    function vBoxAddTgglBtn(whichHbox, getLbl, getBool, getTooTip = "", func){
      boolComp = (thset.get_boolean(getBool) == thset.get_default_value(getBool).unpack());
      getLbl =  boolComp ? getLbl :
      `<i>${getLbl}</i>`
      tootext = boolComp ? "" : "The Value is Changed"
      whichLbl = new Gtk.Label({label: getLbl, use_markup: true, xalign: 0, tooltip_text: getTooTip });  
      whichVlue = new Gtk.Switch({active: thset.get_boolean(getBool), tooltip_text: tootext });
      whichVlue.connect('notify::active', (widget) => {
        thset.set_boolean(getBool, widget.active);
        if (func != undefined){ func(widget.active); } 
		else { thset.set_boolean('restartextension' , true); }
      })

      whichHbox.pack_start(whichLbl, true, true, 0);
      whichHbox.add(whichVlue);

      vbox.add(whichHbox);
      vbox.add(new Gtk.Separator({visible : true}));
    }

    function vBoxAddColorButton(whichHbox, getLbl, getColor, getToolTip = "") {
      //Deterime whether the option value is changed from default value
      boolComp = (thset.get_string(getColor) == thset.get_default_value(getColor).unpack());
      getLbl = boolComp ? getLbl : `<i>${getLbl}</i>`
      tootext = boolComp ? "" : "The Value is Changed"

      //Create the option name
      whichLbl = new Gtk.Label({label: getLbl, use_markup: true, xalign: 0, tooltip_text: getToolTip});

      //Create RGBA
      rgba = new Gdk.RGBA();
      rgba.parse(thset.get_string(getColor));

      //Create ColorButton 
      colorButton = new Gtk.ColorButton({tooltip_text: tootext});
      colorButton.set_rgba(rgba);
      colorButton.connect('notify::color', (widget) => {  //On the event of modification
        rgba = widget.get_rgba();
        thset.set_string(getColor, rgba.to_string());
        thset.set_boolean('restartextension', true);
      });

      whichHbox.pack_start(whichLbl, true, true, 0);
      whichHbox.add(colorButton);

      vbox.add(whichHbox);
      vbox.add(new Gtk.Separator({visible : true}));
    }

    function vBoxAddEntry(whichHbox, getLbl, getString, getTooTip = "", func){
      boolComp = (thset.get_string(getString) == thset.get_default_value(getString).unpack());
      getLbl =  boolComp ? getLbl :
      `<i>${getLbl}</i>`
      tootext = boolComp ? "" : "The Value is Changed"
      whichLbl = new Gtk.Label({label: getLbl, use_markup: true, xalign: 0, tooltip_text: getTooTip });  
      whichVlue = new Gtk.Entry({text: thset.get_string(getString), tooltip_text: tootext, placeholder_text: "Press Enter to apply" });
      whichVlue.connect('activate', (widget) => {
        thset.set_string(getString, widget.get_text());
        if (func != undefined){ func(widget.active); } 
		else { thset.set_boolean('restartextension' , true); }
      })

      whichHbox.pack_start(whichLbl, true, true, 0);
      whichHbox.add(whichVlue);

      vbox.add(whichHbox);
      vbox.add(new Gtk.Separator({visible : true}));
    }
    
  	let frame = new Gtk.ScrolledWindow();
  	let label = new Gtk.Label({ label: "<b>General Settings</b>", use_markup: true, xalign:0});
  	let vbox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, margin_left: 20});
  	let mfooter = new Gtk.Label({ label: "<b>Pro Tip : Hover over any Label To know more about it</b>",use_markup: true, margin_top: 20});

	vbox.add(label);
	//For Position
	let hboxWPos = newGtkBox();
	vBoxAddSeleCt("wpos", hboxWPos, "Position on the Panel", ["Right","Left","Center"], "Choose where to Place the extension on the Panel");

	//For Position Extras
	let hboxWPosExt = newGtkBox();
	vBoxAddSeleCt("wposext", hboxWPosExt, "Position(Advanced)", ["Prefer Right Side", "Prefer Left Side"], "Choose further where to Place the extension");

	//Refresh time
	let hboxRTime = newGtkBox();
	vBoxSpinBtn("refreshtime", hboxRTime, "Refresh Time", "Change Refresh time value from anywhere b/w 1 to 10", 1.0, 10.0, .1, 1);  

	//For Modes
	let hboxMode = newGtkBox();
	vBoxAddSeleCt("mode", hboxMode, "Mode", ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"], "Choose which mode to load");

	//For FontModes
	let hboxFontMode = newGtkBox();
	vBoxAddSeleCt("fontmode", hboxFontMode, "Font Mode", ["Default", "Smallest","Smaller","Small","Large"], "Choose which font to display");

	//For Vertical Alignment
	let hboxVertical = newGtkBox();
	vBoxAddTgglBtn(hboxVertical, "Vertical Align", "isvertical", "Changing it will toggle Vertical Alignment");

	//For Default sigma View
	let hboxToggleBool = newGtkBox();
	vBoxAddTgglBtn(hboxToggleBool, "Show Total Download speed", "togglebool", "Enabling it will show sigma by default");

	//For Toggling Old Icons
	let hboxIconset = newGtkBox();
	vBoxAddSeleCt("chooseiconset", hboxIconset, "Choose Icons Set", [" 🡳,  🡱,  Σ ", " ↓,  ↑,  ∑ "], "Choose which icon set to display");

	//For Reversing the download and upload indicators
	let hboxRevInd = newGtkBox();
	vBoxAddTgglBtn(hboxRevInd, "Show Upload First", "reverseindicators", "Enabling it will reverse the upload and download speed indicators");

	//For Lock Mouse Actions
	let hboxLckMuseAct = newGtkBox();
	vBoxAddTgglBtn(hboxLckMuseAct, "Lock Mouse Actions", "lockmouseactions", "Enabling it will Lock Mouse Actions");
	
	//For Hide When Disconnected
	let hboxHideInd = newGtkBox();
	vBoxAddTgglBtn(hboxHideInd, "Hide When Disconnected", "hideindicator", "Enabling it will Hide Indicator when disconnected");

	//For Shorten Units
	let hboxShUni = newGtkBox();
	vBoxAddTgglBtn(hboxShUni, "Shorten Units", "shortenunits", "Enabling it will result in shorten units like K instead of KB");
	
	//For Custom Font name
	let hboxCustFont = newGtkBox();
	vBoxAddEntry(hboxCustFont, "Custom Font Name", "customfont", "Enter the font name you want, you can also write style here for all elements except indicators")
	
  //Colors
	let hboxColor = newGtkBox();
	function onColorToggle(widget){
	  	if (widget){
  		usColorButton.show();
 		dsColorButton.show();
 		tsColorButton.show();
 		tdColorButton.show();
  	} else {
  		usColorButton.hide();
 		dsColorButton.hide();
 		tsColorButton.hide();
 		tdColorButton.hide();
  	}
  }
  
	vBoxAddTgglBtn(hboxColor, "Show Color Customization", "colortggle", "Enabling it will Show all Color customizations", onColorToggle);

	//Upload Speed Color 
	let usColorButton = newGtkBox();
	vBoxAddColorButton(usColorButton, "Upload Speed Color", "uscolor", "Select the upload speed color");

	//Download Speed Color 
	let dsColorButton = newGtkBox();
	vBoxAddColorButton(dsColorButton, "Download Speed Color", "dscolor", "Select the download speed color");

	//Total Speed Color 
	let tsColorButton = newGtkBox();
	vBoxAddColorButton(tsColorButton, "Total Speed Color", "tscolor", "Select the total speed color");

	//Total Download Color 
	let tdColorButton = newGtkBox();
	vBoxAddColorButton(tdColorButton, "Total Download Color", "tdcolor", "Select the total download color");
	vbox.add(mfooter);
	frame.add(vbox);
	frame.show_all();
	onColorToggle(thset.get_boolean("colortggle"));

	return frame;
  }
}

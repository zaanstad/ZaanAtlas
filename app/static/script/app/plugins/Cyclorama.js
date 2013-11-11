/**
 * Copyright (c) 2008-2013 Zaanstad Municipality
 *
 * Published under the GPL license.
 * See https://github.com/teamgeo/zaanatlas/raw/master/license.txt for the full text
 * of the license.
 */

function hst_componentReady() {
    app.fireEvent('hst_componentReady');
}

function hst_apiReady() {
    app.fireEvent('hst_apiReady');
}

function hst_viewChanged() {
    app.fireEvent('hst_viewChanged');
}

/** api: (define)
 *  module = gxp.plugins
 *  class = Cyclorama
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: Cyclorama(config)
 *
 *    This plugins provides an action which, when active, will issue a
 *    GetFeatureInfo request to the WMS of all layers on the map. The output
 *    will be displayed in a popup.
 */   
gxp.plugins.Cyclorama = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = app_cyclorama */
    ptype: "app_cyclorama",

    /** api: config[infoActionTip]
     *  ``String``
     *  Text for feature info action tooltip (i18n).
     */
    infoActionTip: "Toon Cyclorama",

    /** api: config[popupTitle]
     *  ``String``
     *  Title for info popup (i18n).
     */
    popupTitle: "Cyclorama",

    api: null,

    popup: null,

    symboollayer: null,

    firstClick: true,
     
    /** api: method[addActions]
     */
    addActions: function() {
		
        var actions = gxp.plugins.Cyclorama.superclass.addActions.call(this, [{
            tooltip: this.infoActionTip,
            iconCls: "icon-cyclorama",
            text: this.popupTitle,
            toggleGroup: this.toggleGroup,
            enableToggle: true,
            allowDepress: true,
            toggleHandler: function(button, pressed) {
                for (var i = 0, len = cyclo.controls.length; i < len; i++){
                    if (pressed) {
                        cyclo.controls[i].activate();
                        this.openPopup();
                        this.initViewer();
                    } else {
                        cyclo.controls[i].deactivate();
                        this.cyclo_popup.hide();
                        this.disableViewer();
                    }
                }
             },
             scope: this
        }]);
        
        var cycloButton = this.actions[0].items[0];
        cycloButton.setVisible(app.intraEnabled);

        this.startClicker();
        
        return actions;
    },

    startClicker: function() {

    cyclo = {controls: []};

	var Clicker = OpenLayers.Class(OpenLayers.Control, {                
	    defaults: {
	        pixelTolerance: 2,
	        stopSingle: true
	    },
	    initialize: function(options) {
	        this.handlerOptions = OpenLayers.Util.extend(
	            {}, this.defaults
	        );
	        OpenLayers.Control.prototype.initialize.apply(this, arguments); 
	        this.handler = new OpenLayers.Handler.Click(
	            this, {click: this.trigger}, this.handlerOptions
	        );
	    }, 
	    trigger: function(event) {
	        this.scope.openNearestImage(event, this.map);
	    },
	    scope: this
	});
	var clickcontrol = new Clicker()
	this.target.mapPanel.map.addControl(clickcontrol);
	cyclo.controls.push(clickcontrol);
	},

	openPopup: function() {

		var viewer_api = this.api;

		if (Ext.isIE) {
			var html = "<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' width='100%' height='100%' id='japi'>"+
	        "<param name='movie' value=" + viewer_api + " />"+
	        "<param name='quality' value='high' />"+
	        "<param name='bgcolor' value='#888888' />"+
	        "<param name='wmode' value='opaque' />"+
	        "<param name='allowScriptAccess' value='always' />"+
	        "<param name='allowFullScreen' value='true' />"+
	        "<!-- Flash message from CycloMedia. --><b>Flash installation</b><br/>In order to use GlobeSpotter, Adobe Flash Player version 10 or higher is required. The player can be installed from the Adobe website. On the website you can find the installation instructions, but for your convenience they have also been listed below:<p/><br><b>Flash player installation instructions</b><ul><li>- You can only install Flash Player if you have administrative access.</li><li>- If you do not have administrative access please contact the IT department or the systemsadministrator for the installation of Flash Player.</li><li>- Before you start downloading Adobe Flash Player, it is recommended that you close all otheropen browser windows.</li><li>- Go to the download site of Adobe Flash Player: <a href='http://get.adobe.com/flashplayer/'><img src='http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif' alt='Get Adobe Flash Player' /></a></li><li>- Deselect additional downloads, as they will not be necessary for the functioning of GlobeSpotter.</li><li>- Click 'Agree and install now'</li><li>- After this you will get a popup with the question: Do you want to install this software?? Click on 'Install'</li><li>- Wait until Adobe Flash Player has finished installing</li><li>- Once done it is highly recommended you restart your browser program</li><li>- Now you can return to the GlobeSpotter startup page and begin using the application</li></ul>- For support please contact:<br/><a href='mailto:support@cyclomedia.nl'>support@cyclomedia.nl</a>"+
	    	"</object>"
	    } else {
	    	var html = "<object type='application/x-shockwave-flash' data=" + viewer_api + " width='100%' height='100%' id='japi'>"+
	        "<param name='quality' value='high' />"+
	        "<param name='bgcolor' value='#888888' />"+
	        "<param name='wmode' value='opaque' />"+
	        "<param name='allowScriptAccess' value='always' />"+
	        "<param name='allowFullScreen' value='true' />"+
	        "<!-- Flash message from CycloMedia. --><b>Flash installation</b><br/>In order to use GlobeSpotter, Adobe Flash Player version 10 or higher is required. The player can be installed from the Adobe website. On the website you can find the installation instructions, but for your convenience they have also been listed below:<p/><br><b>Flash player installation instructions</b><ul><li>- You can only install Flash Player if you have administrative access.</li><li>- If you do not have administrative access please contact the IT department or the systemsadministrator for the installation of Flash Player.</li><li>- Before you start downloading Adobe Flash Player, it is recommended that you close all otheropen browser windows.</li><li>- Go to the download site of Adobe Flash Player: <a href='http://get.adobe.com/flashplayer/'><img src='http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif' alt='Get Adobe Flash Player' /></a></li><li>- Deselect additional downloads, as they will not be necessary for the functioning of GlobeSpotter.</li><li>- Click 'Agree and install now'</li><li>- After this you will get a popup with the question: Do you want to install this software?? Click on 'Install'</li><li>- Wait until Adobe Flash Player has finished installing</li><li>- Once done it is highly recommended you restart your browser program</li><li>- Now you can return to the GlobeSpotter startup page and begin using the application</li></ul>- For support please contact:<br/><a href='mailto:support@cyclomedia.nl'>support@cyclomedia.nl</a>"+
	    	"</object>"
	    }

        var bbarItems = new Ext.Toolbar({  
            items: [  
            {
                xtype: 'checkbox',
                checked: true,
                fieldLabel: '',
                labelSeparator: '',
                boxLabel: 'Laatst bekende opnamelocaties tonen',
                name: 'fav-animal-monkey',
                handler: function(field, value) {
		            this.setAllDates(value);            
		        },
		        scope: this
            }, {
                xtype: 'tbfill'
            }, {
                text: 'Open Globespotter',
                xtype: 'button',
                iconCls: 'icon-expand',
                handler: function() {
                    this.openGlobeSpotter();
                },
                scope: this
            }
            ]
        });

        if (!this.cyclo_popup) {

			this.cyclo_popup = new Ext.Window({
				title: this.popupTitle,
				id: 'cyclo_popup',
				border: false,
				layout: 'fit',
				closeAction: 'hide',
				maximizable: true,
	            height: 400,
	            width: 600,
                x: this.target.mapPanel.getPosition()[0] + this.target.mapPanel.getSize().width - 600,
                y: this.target.mapPanel.getPosition()[1],
				bbar: bbarItems,
				html: html
				});
		}
	},

	openGlobeSpotter: function() {
		var imageId = this.api.getImageID(0);
		var rotation = this.api.getYaw(0);
		var cyclo_url = "https://globespotter.cyclomedia.com/nl/?ImageId=" + imageId + "&Yaw=" + rotation;
		window.open(cyclo_url);
	},

    initViewer: function() {
    	app.on('hst_componentReady', this.componentReady, this);
    	app.on('hst_apiReady', this.apiReady, this);
		app.on('hst_viewChanged', this.viewChanged, this);
		this.infolaagToevoegen();
    },

    disableViewer: function() {
    	app.un('hst_componentReady', this.componentReady, this);
    	app.un('hst_apiReady', this.apiReady, this);
		app.un('hst_viewChanged', this.viewChanged, this);
		this.infolaagVerwijderen();
    },

	infolaagToevoegen: function(){

		if (!this.symboollayer) {

		OpenLayers.Renderer.symbol.pointer = [0, 0, -2, 6, 0, 5, 2, 6, 0, 0];
		var style = new OpenLayers.StyleMap({
		    "default": new OpenLayers.Style(null, {
		        rules: [new OpenLayers.Rule({
		            symbolizer: {
		                "Point": {
		                    pointRadius: 20,
		                    graphicName: "pointer",
		                    fillColor: "#FF0000",
		                    rotation: "${angle}",
		                    fillOpacity: 0.9,
		                    strokeWidth: 3,
		                    strokeOpacity: 1,
		                    strokeColor: "#FFFFFF"
		                }
		            }
		        })]
		    })
		});

		this.symboollayer = new OpenLayers.Layer.Vector("CycloInfo", {styleMap: style, displayInLayerSwitcher: false});   
		this.target.mapPanel.layers.map.addLayers([this.symboollayer]); 

		} else {
			this.symboollayer.setVisibility(true);
		}
	},

	infolaagVerwijderen: function() {
		this.symboollayer.setVisibility(false);
	},

	componentReady: function() {                
	    var api = document.getElementById("japi");
	    
	    try
	    {
	        var SRS = "EPSG:28992";
	        var ADDRESS_LANGUAGE_CODE = "nl";
	        // Set an API key.
	        api.setAPIKey("ezEdm3chO78t-LY9OnARGro9y7gRu3oF-nMxO3olunElqzwVCvgxODUhKrYt23EV");
	        api.setSRSNameViewer(SRS);
	        api.setSRSNameAddress(SRS);
	        api.setAddressLanguageCode(ADDRESS_LANGUAGE_CODE);
	    }
	    catch(error) // Its a string ...
	    {
	        alert(error);
	    }
	    
	    addToLog("hst_componentReady()");
	},

	apiReady: function() {
	    this.api = document.getElementById("japi");

	    this.api.setLanguageLocale('nl');
	    //this.api.setViewerRotationButtonsVisible(true);
	    this.api.setViewerTitleBarVisible(false);
	    this.api.setViewerToolBarVisible(false);
	    this.api.setMaxViewers(1);
	    this.api.setViewerZoomBoxEnabled(false);

	    if (this.firstClick) {
	    	this.api.openNearestImage(this.firstClick.lon + ',' + this.firstClick.lat, 1);
	    	this.firstClick = false;
			var testPanel = new Ext.Panel({
                                renderTo: 'cyclo_popup',
                                floating: true,
                                layout: {type: 'table', columns: 3},
                                frame: false,
								border: false,
								shadow: false,
								bodyStyle: 'background:transparent;',
                                items: [  
					            {
					            	iconCls: 'caret-left',
					            	scale: 'small',
					                xtype: 'button',
					                repeat: true,
					                rowspan: 2,
					                handler: function() {
					                    this.api.rotateLeft(0,5);
					                },
					                scope: this
					            }, {
					            	iconCls: 'caret-up',
					            	scale: 'small',
					                xtype: 'button',
					                repeat: true,
					                handler: function() {
					                    this.api.rotateUp(0,5);
					                },
					                scope: this
					            }, {
					            	iconCls: 'caret-right',
					            	scale: 'small',
					                xtype: 'button',
					                repeat: true,
					                rowspan: 2,
					                handler: function() {
					                    this.api.rotateRight(0,5);
					                },
					                scope: this
					            }, {
					            	iconCls: 'caret-down',
					            	scale: 'small',
					                xtype: 'button',
					                repeat: true,
					                handler: function() {
					                    this.api.rotateDown(0,5);
					                },
					                scope: this
					            }
					            ],
					            listeners:{
				                    'afterrender': function(panel){
				                    	panel.show();
				                        panel.setPosition(15,35);
				                    }
				                }
                            });
	    }

	    addToLog("hst_apiReady()");
	},

	checkApiReady: function() {
	    if(this.api == null || !this.api.getAPIReadyState()) {
	        alert("API not ready.");
	        return false;
	    } else {
	        return true;
	    }   
	},

	viewChanged: function() {
		var rd = this.api.getRecordingLocation(0);
		var rotation = this.api.getYaw(0);

        var feature = new OpenLayers.Feature.Vector(
                        new OpenLayers.Geometry.Point(rd.x, rd.y), {angle: rotation}
                    );

        this.symboollayer.removeAllFeatures();
        this.symboollayer.addFeatures([feature]);
        this.symboollayer.redraw();

	},

	setAllDates: function(bool) {

	    if(this.checkApiReady()) {
            try
            {
			    this.api.setUseDateRange(!bool);
			    this.api.setDateFrom("2000-01-01T00:00:00.000Z");
			    this.api.setDateTo(JSON.parse(JSON.stringify(new Date())));
            }
            catch(error)
            {
                alert("Error while opening an image: " + error);
            }      
	    }
	},

	openNearestImage: function(evt, map) {

		this.cyclo_popup.show();
		var rd = map.getLonLatFromViewPortPx(evt.xy);
		if (!rd) {
			rd = map.getCenter();
		};
		var mapsize = map.size;

		if (!this.firstClick) {
		    if(this.checkApiReady()) {
		        var query = rd.lon + ',' + rd.lat;
		        var maxLocations = 1;

		        if(query == null && query == "")
		        {
		            alert("Invalid input.");
		        }
		        else
		        {
		            try
		            {
		                this.api.openNearestImage(query, maxLocations);
		            }
		            catch(error)
		            {
		                alert("Error while opening an image: " + error);
		            }
		        }                    
		    }
		} else {
			this.firstClick = rd;
		}
	}

});

Ext.preg(gxp.plugins.Cyclorama.prototype.ptype, gxp.plugins.Cyclorama);

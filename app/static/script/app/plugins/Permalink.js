/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = Permalink
 */

/** api: (extends)
 *  gxp/plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
* .. class:: Permalink(config)
*
* Plugin for removing a selected layer from the map.
*/
gxp.plugins.Permalink = Ext.extend(gxp.plugins.Tool, {
    
/** api: ptype = gxp_permalink */
    ptype: "app_permalink",
    
/** api: config[addActionMenuText]
* ``String``
* Text for add menu item (i18n).
*/
    addActionMenuText: "Bladwijzer",

/** api: config[addActionTip]
* ``String``
* Text for add action tooltip (i18n).
*/
    addActionTip: "Bewaar dit kaartbeeld als een bladwijzer",

/** api: config[availableLayersText]
* ``String``
* Text for the available layers (i18n).
*/
    availableLayersText: "Permalink",
    
/** api: config[titleText]
* ``String``
* Text for the layer title (i18n).
*/
    titleText: "Maak een bladwijzer",
    
/** api: config[doneText]
* ``String``
* Text for Done button (i18n).
*/
    doneText: "Sluiten",
    
/** api: config[menuText]
* ``String``
* Text for upload button (only renders if ``upload`` is provided).
*/
    menuText: "Bladwijzer",

/** private: method[constructor]
 */
    constructor: function(config) {
        gxp.plugins.Permalink.superclass.constructor.apply(this, arguments);
    },
    
/** api: method[addActions]
 */
    addActions: function() {
        var selectedLayer;
        var actions = gxp.plugins.Permalink.superclass.addActions.apply(this, [{
            tooltip : this.addActionTip,
            menuText: this.addActionMenuText,
            text: this.menuText,
            icon: "../theme/app/img/permalink.png",
            handler : this.showCapabilitiesGrid,
            scope: this
        }]);
        
        this.target.on("ready", function() {
            actions[0].enable();
        });
        return actions;
    },
        
/** api: method[showCapabilitiesGrid]
* Shows the window with a capabilities grid.
*/
    showCapabilitiesGrid: function() {        
        this.initPermaDialog();
    },

    /**
* private: method[initCapGrid]
* Constructs a window with a capabilities grid.
*/
    initPermaDialog: function() {
    	target = this.target;
	
		function email(url) {
			var emailtxt = "%0AEr is een link aangemaakt naar een kaartbeeld uit de ZaanAtlas.%0A";
			var api_key = "R_b3889752450cd7113ec5a5c06eca8b07";
			var api_login = "teamgeo";
			var api_url = "api.bitly.com";
            var request = "longUrl="+encodeURIComponent(url)+"&login="+api_login+"&apiKey="+api_key+"&callback=?";
            var OLrequest = OpenLayers.Request.POST({
                 url : "http://"+api_url+"/v3/shorten?",
                 async: true,
                 data : request,
                 headers: {
                     "Content-Type": "text/javascript"
                 },
                 success : function(response) {
                     //alert(response.responseText);
                     var json = eval("(" + response.responseText.slice(2, -2) + ")");
                     window.location = "mailto:?SUBJECT=ZaanAtlas%20link&BODY="+emailtxt+"%0AVerkorte link:%20"+json.data.url
                     				   +"%0A%0ADe volgende kaartlagen zijn actief:%0A"+lyrs
                     				   +"%0AOndergronden:%0A"+bglyrs;
                 },
                 failure : function(response) {
                 	alert(response.responseText);
                 }
             });
            };
        
		function popupLink(url) {
			var api_key = "R_b3889752450cd7113ec5a5c06eca8b07";
			var api_login = "teamgeo";
			var api_url = "api.bitly.com";
            var request = "longUrl="+encodeURIComponent(url)+"&login="+api_login+"&apiKey="+api_key+"&callback=?";
            var OLrequest = OpenLayers.Request.POST({
                 url : "http://"+api_url+"/v3/shorten?",
                 async: true,
                 data : request,
                 headers: {
                     "Content-Type": "text/javascript"
                 },
                 success : function(response) {
                     var json = eval("(" + response.responseText.slice(2, -2) + ")");
                     Ext.Msg.show({
						title: "Verkorte link",
						msg: json.data.url,
						icon: Ext.MessageBox.INFO
					});
                 },
                 failure : function(response) {
                 	alert(response.responseText);
                 }
             });
            };
            
		var lyrs = "";
		var bglyrs= "";
		var configObj = {};
		configObj.map = target.getState().map;
		//delete configObj.map.maxExtent;
		
		for (var i = 0, len = configObj.map.layers.length; i < len; i++){
		
		// remove unnecessary information
			delete configObj.map.layers[i].capability;
			delete configObj.map.layers[i].selected;
			delete configObj.map.layers[i].format;
			delete configObj.map.layers[i].fixed;
			if (configObj.map.layers[i].group == "") {
				delete configObj.map.layers[i].group;
			}
			if (configObj.map.layers[i].tiled == true) {
				delete configObj.map.layers[i].tiled;
			}
			
		// generate list of layernames
			if (configObj.map.layers[i].group == "background") {
				bglyrs = configObj.map.layers[i].title + "%0A" + bglyrs;
			} else {
				lyrs = configObj.map.layers[i].title + "%0A" + lyrs;
			}
		}
		var configStr = Ext.util.JSON.encode(configObj);
		
		window.location.hash = 'q=' + configStr; //query2;
	
        var centre = [{
            xtype: 'container',
            layout: 'anchor',
            style: {
                padding: '10px'
            },
            items: [
			{
				xtype: "container",
				region: "center",
				html: 	"<b>Bladwijzer of Favorieten</b><br>" +
						"<p>Met behulp van een bladwijzer is het mogelijk om een kaartbeeld " + 
						"te bewaren om deze de volgende keer eenvoudig en snel terug te kunnen vinden. " + 
						"Gebruik hiervoor de bladwijzer of bookmark functie van de webbrowser terwijl dit venster zichtbaar is.<br><br><br>" +
						"<b>Email</b><br>" +
						"<p>Het is mogelijk om een verkorte link te versturen voor dit kaartbeeld naar een emailadres.<br><br></p>",
				scope: this
        	}, {
                xtype: 'button',
                iconCls:'icon-email-go',
                text: 'Email de link voor deze kaart',
                handler: function() {
                    email(window.location);
                },
                scope: this
            }, {
				xtype: "container",
				region: "center",
				html: 	"<br><br><b>Verkorte link</b><br>" +
						"<p>Lange links zijn onhandig om door te sturen of te plaatsen op sociale netwerken. Maak daarom een " +
						"verkorte link aan via onderstaande knop (bit.ly), de korte link verwijst naar dit kaarbeeld.<br><br></p>",
				scope: this
        	}, {
                xtype: 'button',
                iconCls:'icon-link',
                text: 'Verkorte link aanmaken',
                handler: function() {
                    popupLink(window.location);
                },
                scope: this
            }
        ]
        }];
        
        var bbarItems = [
        "->",
        new Ext.Button({
            text: this.doneText,
            handler: function() {
                this.capGrid.close();
            },
            scope: this
        })
        ];	
		
        this.capGrid = new Ext.Window({
            title: this.titleText,
            closeAction: "close",
            height: 410,
            width: 390,
            modal: true,
            resizable: false, 
            items: centre,
            bbar: bbarItems
        });
        
        this.capGrid.on('close', function() {
			 window.location.hash = "";
		});

        this.capGrid.show();
        formulier = this.capGrid;
        }		
 });		 

Ext.preg(gxp.plugins.Permalink.prototype.ptype, gxp.plugins.Permalink);

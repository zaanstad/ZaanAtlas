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
    ptype: "gxp_permalink",
    
/** api: config[addActionMenuText]
* ``String``
* Text for add menu item (i18n).
*/
    addActionMenuText: "Bladwijzer",

/** api: config[addActionTip]
* ``String``
* Text for add action tooltip (i18n).
*/
    addActionTip: "Sla het huidige kaartbeeld op als een bladwijzer",

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
        this.initCapGrid();
    },

    /**
* private: method[initCapGrid]
* Constructs a window with a capabilities grid.
*/
    initCapGrid: function() {
        this.baseUrl =  window.location.host;
        this.baseUrl = "";
	
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
                     window.location = "mailto:?SUBJECT=ZaanAtlas%20link&BODY="+emailtxt+"%0AVerkorte link:%20"+json.data.url+"%0A%0ADe volgende kaartlagen zijn actief:%0A"+lyrs;
                 },
                 failure : function(response) {
                 	alert(response.responseText);
                 }
             });
            };
        
        function getElementsByTag(doc, url, tag) {
            var urlArray = url.split( "/" );
            var ns = urlArray[urlArray.length-1];
            var value = doc.getElementsByTagName(ns + ":" +  tag);
            if(!value || value == null || value.length == 0){
                value = doc.getElementsByTagNameNS(url,  tag);
            }
            return value;
        };
		
		// create permalink provider
		//var permalinkProvider = new GeoExt.state.PermalinkProvider({encodeType:true});
		var map1 = this.target.mapPanel.map;
		//var query = "q=%7B%22map%22%3A%7B%22center%22%3A%5B" + map1.center.lon + "%2C" + map1.center.lat +
		//			"%5D%2C%22projection%22%3A%22" + map1.projection + "%22%2C%22zoom%22%3A" + map1.zoom +
		//			"%2C%22layers%22%3A%5B";
		
		var query2 = 'q={"map":{"center":[' + map1.center.lon + ',' +  map1.center.lat + '], "projection":"' +  
					map1.projection + '"' + ',"zoom":' +  map1.zoom + ', "layers":[';
		
		var maplayers = this.target.mapPanel.layers.data.items;
		
		for (var i = 0, len = maplayers.length; i < len; i++){
			if ((maplayers[i].data.title != "featuremanager") && (maplayers[i].data.title != "Info") && (maplayers[i].data.title != "Adres")) { 
				if (maplayers[i].data.group == "background") {
			
				/**
					query = query + "%7B%22projection%22%3A%22"+ maplayers[i].data.layer.projection.projCode + "%22%2C%22group%22%3A%22background" +
									"%22%2C%22source%22%3A%22" + maplayers[i].data.source + "%22%2C%22title%22%3A%22" +
									maplayers[i].data.title + "%22%2C%22name%22%3A%22" + maplayers[i].data.name +
									"%22%2C%22visibility%22%3A"+ maplayers[i].data.layer.visibility + 
									"%2C%22format%22%3A%22image%2Fpng%22%2C%22transparent%22%3Atrue%2C" +
									"%22opacity%22%3A" + maplayers[i].data.layer.opacity + 
									"%2C%22type%22%3A%22" + maplayers[i].data.type + "%22%7D%2C";					
				
				} else {

			
					query = query + "%7B%22projection%22%3A%22"+ maplayers[i].data.layer.projection.projCode + "%22%2C" +
									"%22source%22%3A%22" + maplayers[i].data.source + "%22%2C%22title%22%3A%22" +
									maplayers[i].data.title + "%22%2C%22name%22%3A%22" + maplayers[i].data.name +
									"%22%2C%22visibility%22%3A"+ maplayers[i].data.layer.visibility + 
									"%2C%22format%22%3A%22image%2Fpng%22%2C%22transparent%22%3Atrue%2C" +
									"%22opacity%22%3A" + maplayers[i].data.layer.opacity + 	
									"%2C%22type%22%3A%22" + maplayers[i].data.type + "%22%7D%2C";
									
				*/					
									
				query2 = query2 + "{\"projection\":\""+ maplayers[i].data.layer.projection.projCode + 
									"\",\"group\":\"background\"" +
									",\"source\":\"" + maplayers[i].data.source + 
									"\",\"title\":\"" + maplayers[i].data.title + 
									"\",\"name\":\"" + maplayers[i].data.name +
									"\",\"visibility\":"+ maplayers[i].data.layer.visibility + 
									",\"type\":\"" + maplayers[i].data.type + 
									"\"},";	

				} else {

					query2 = query2 + "{\"projection\":\""+ maplayers[i].data.layer.projection.projCode + 
									"\",\"source\":\"" + maplayers[i].data.source + 
									"\",\"title\":\"" + maplayers[i].data.title + 
									"\",\"name\":\"" + maplayers[i].data.name +
									"\",\"visibility\":"+ maplayers[i].data.layer.visibility + 
									",\"format\":\"image/png\"" +
									",\"transparent\":true" +
									",\"opacity\":" + maplayers[i].data.layer.opacity + 
									",\"type\":\"" + maplayers[i].data.type + 
									"\"},";					
		
				};
			};
		};
		
		query2 = query2.substring (0, query2.length-1);
		query2 = query2 + "]}}";
		window.location.hash = query2;
		var lyrs = "";
		for (var i = 0, len = map1.layers.length; i < len; i++){
			lyrs = map1.layers[i].name + "%0A" + lyrs;
		}
		//var str_provider = permalinkProvider.getLink();
		//x = str_provider.indexOf("?");
		//if (x != -1) {	
		//	str_provider = str_provider.substring(0, x);		
		//};
		//URL = str_provider + query2;
	
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
            html: 	"<b>Bladwijzer</b><br>" +
            		//"<img src=../theme/app/img/bladwijzer.png />" +
            		"<p>Met behulp van een bladwijzer is het mogelijk om een kaartbeeld " + 
					"te bewaren om deze de volgende keer eenvoudig en snel terug te kunnen vinden. " + 
					"Gebruik hiervoor de bladwijzer of bookmark functie van de webbrowser terwijl dit venster zichtbaar is.<br><br>" +
					"<img src=../theme/app/img/silk/application_go.png />" +
            		" Sla nu dit kaartbeeld op als bladwijzer</p><br><br>" + 
            		"<b>Email</b><br>" +
            		"<p>Het is ook mogelijk om een verkorte link te versturen voor dit kaartbeeld naar een emailadres.<br><br></p>",
            scope: this
        	}, {
                xtype: 'button',
                icon:'../theme/app/img/silk/email_go.png',
                text: 'Email de link voor deze kaart',
                handler: function() {
                    email(window.location);
                    //email("http://geo.zaanstad.nl/zaanatlas/composer/"+window.location.hash);
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

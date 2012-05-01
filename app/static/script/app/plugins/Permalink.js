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
	
        function trim(s)
        {
            return rtrim(ltrim(s));
        };

        function ltrim(s)
        {
            var l=0;
            while(l < s.length && s[l] == ' ')
            {
                l++;
            }
            return s.substring(l, s.length);
        };

        function rtrim(s)
        {
            var r=s.length -1;
            while(r > 0 && s[r] == ' ')
            {
                r-=1;
            }
            return s.substring(0, r+1);
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
		//var str_provider = permalinkProvider.getLink();
		//x = str_provider.indexOf("?");
		//if (x != -1) {	
		//	str_provider = str_provider.substring(0, x);		
		//};
		//URL = str_provider + query2;
	
        var items = [{
            xtype: 'container',
            layout: 'anchor',
            style: {
                padding: '10px'
            },
            items: [
			{
            xtype: "container",
            region: "center",
            html: 	"<b>Hoe bewaar ik mijn kaartbeeld?</b>" +
            		"<img src=../theme/app/img/bladwijzer.png />" +
            		"Met behulp van een bladwijzer is het mogelijk om een kaartbeeld " + 
					"te bewaren om deze de volgende keer eenvoudig en snel terug te kunnen vinden. " + 
					"Gebruik hiervoor de bladwijzer/bookmark functie van de web-webbrowser.<br><br>" +
					"<img src=../theme/app/img/silk/star.png />" +
            		"<b>sla nu dit kaartbeeld op als bladwijzer in je webbrowser</b>" +
            		"<img src=../theme/app/img/silk/star.png />",
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
            items: items,
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

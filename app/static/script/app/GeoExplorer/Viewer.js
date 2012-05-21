/**
 * Copyright (c) 2009-2010 The Open Planning Project
 *
 * @requires GeoExplorer.js
 */

/** api: (define)
 *  module = GeoExplorer
 *  class = Embed
 *  base_link = GeoExplorer
 */
Ext.namespace("GeoExplorer");

/** api: constructor
 *  ..class:: GeoExplorer.Viewer(config)
 *
 *  Create a GeoExplorer application suitable for embedding in larger pages.
 */
GeoExplorer.Viewer = Ext.extend(GeoExplorer, {
    
    applyConfig: function(config) {
        var allTools = config.viewerTools || this.viewerTools;
        var tools = [];
        var toolConfig;
        // we need to start counting at 3 since there is the Layer Switcher,
        // logo and a split button already
        var counter = 3;
        for (var i=0, len=allTools.length; i<len; i++) {
            var tool = allTools[i];
            if (tool.checked === true) {
                var properties = ['checked', 'iconCls', 'id', 'leaf', 'loader', 'text'];
                for (var key in properties) {
                    delete tool[properties[key]];
                }
                toolConfig = Ext.applyIf({
                    actionTarget: {target: "paneltbar", index: counter}
                }, tool);
                if (tool.numberOfButtons !== undefined) {
                    counter += tool.numberOfButtons;
                } else {
                    counter++;
                }
                tools.push(toolConfig);
            }
        }
		searchTool = {
			ptype: 'app_geocoder',
			outputTarget: "paneltbar"
			};
		tools.push(searchTool);
		
		expandTool = {
			ptype: "gxp_vanviewernaarcomposer",
			actionTarget: "paneltbar"
			};
		tools.push(expandTool);
		
        config.tools = tools;
        GeoExplorer.Viewer.superclass.applyConfig.call(this, config);
    },

    /** private: method[initPortal]
     * Create the various parts that compose the layout.
     */
    initPortal: function() {

        this.toolbar = new Ext.Toolbar({
            disabled: true,
            id: "paneltbar",
            items: this.createTools()
        });
        this.on("ready", function() {this.toolbar.enable();}, this);

        this.mapPanelContainer = new Ext.Panel({
            layout: "card",
            region: "center",
            tbar: this.toolbar,
            defaults: {
                border: false
            },
            items: [
                this.mapPanel
            ],
            activeItem: 0
        });
        
        var tb = new Ext.Container({
        	style: "background-color: #00A5C7; padding : 5px;",
        	height: 50,
        	html:	"<p style='margin-left: 10px;'><font size='+1' face='ARIAL' color='White' style='font-weight:bold;'>" + app.about.title  + "</font><br>" + 
        			"<font size='-1' face='ARIAL' color='White'>" + app.about['abstract']  + "</font></p>"
        	});

        this.portalItems = [{
            region: "center",
            layout: "border",
            tbar: tb,
            items: [
                this.mapPanelContainer
            ]
        }];
                
        GeoExplorer.superclass.initPortal.apply(this, arguments);       

    },

    /**
     * api: method[createTools]
     * Create the various parts that compose the layout.
     */
    createTools: function() {
        var tools = GeoExplorer.Viewer.superclass.createTools.apply(this, arguments);

		var aboutButton = new Ext.Button({
            scale: 'logoklein',
            iconCls: "icon-logo-klein",
            handleMouseEvents: false
        });
        
        var layerChooser = new Ext.Button({
            tooltip: 'Layer Switcher',
            iconCls: 'icon-layer-switcher',
            menu: new gxp.menu.LayerMenu({
                layers: this.mapPanel.layers
            })
        });

        tools.unshift("-");
        tools.unshift(layerChooser);
        tools.unshift(aboutButton);

        tools.push("->");

        return tools;
    }
});

/**
 * Copyright (c) 2009-2011 The Open Planning Project
 */

Ext.USE_NATIVE_JSON = true;

// Fixes problem with OpenLayers.Projection.defaults and RD EPSG
OpenLayers.Projection.defaults = {
	"EPSG:28992": {
		units: "m",
		maxExtent: [102009, 480557, 129270, 506221],
		yx: false
	},
	"EPSG:4326": {
		units: "degrees",
		maxExtent: [-180, -90, 180, 90],
		yx: true
	},
	"CRS:84": {
		units: "degrees",
		maxExtent: [-180, -90, 180, 90]
	},
	"EPSG:900913": {
		units: "m",
		maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34]
	}
};

// http://www.sencha.com/forum/showthread.php?141254-Ext.Slider-not-working-properly-in-IE9
// TODO re-evaluate once we move to Ext 4
Ext.override(Ext.dd.DragTracker, {
    onMouseMove: function (e, target) {
        if (this.active && Ext.isIE && !Ext.isIE9 && !e.browserEvent.button) {
            e.preventDefault();
            this.onMouseUp(e);
            return;
        }
        e.preventDefault();
        var xy = e.getXY(), s = this.startXY;
        this.lastXY = xy;
        if (!this.active) {
            if (Math.abs(s[0] - xy[0]) > this.tolerance || Math.abs(s[1] - xy[1]) > this.tolerance) {
                this.triggerStart(e);
            } else {
                return;
            }
        }
        this.fireEvent('mousemove', this, e);
        this.onDrag(e);
        this.fireEvent('drag', this, e);
    }
});

(function() {
    // backwards compatibility for reading saved maps
    // these source plugins were renamed after 2.3.2
    Ext.preg("gx_wmssource", gxp.plugins.WMSSource);
    Ext.preg("gx_olsource", gxp.plugins.OLSource);
    Ext.preg("gx_googlesource", gxp.plugins.GoogleSource);
    //Ext.preg("gx_bingsource", gxp.plugins.BingSource);
    Ext.preg("gx_osmsource", gxp.plugins.OSMSource);
    // use layermanager instead of layertree
    Ext.preg("gxp_layertree", gxp.plugins.LayerManager);
})();

/**
 * api: (define)
 * module = GeoExplorer
 * extends = gxp.Viewer
 */

/** api: constructor
 *  .. class:: GeoExplorer(config)
 *     Create a new GeoExplorer application.
 *
 *     Parameters:
 *     config - {Object} Optional application configuration properties.
 *
 *     Valid config properties:
 *     map - {Object} Map configuration object.
 *     sources - {Object} An object with properties whose values are WMS endpoint URLs
 *
 *     Valid map config properties:
 *         projection - {String} EPSG:xxxx
 *         units - {String} map units according to the projection
 *         maxResolution - {Number}
 *         layers - {Array} A list of layer configuration objects.
 *         center - {Array} A two item array with center coordinates.
 *         zoom - {Number} An initial zoom level.
 *
 *     Valid layer config properties (WMS):
 *     name - {String} Required WMS layer name.
 *     title - {String} Optional title to display for layer.
 */
var GeoExplorer = Ext.extend(gxp.Viewer, {

    // Begin i18n.
    zoomSliderText: "<div>Zoom Level: {zoom}</div><div>Scale: 1:{scale}</div>",
    loadConfigErrorText: "Trouble reading saved configuration: <br />",
    loadConfigErrorDefaultText: "Server Error.",
    xhrTroubleText: "Communication Trouble: Status ",
    layersText: "Layers",
    titleText: "Title",
    bookmarkText: "Bookmark URL",
    permakinkText: 'Permalink',
    appInfoText: "GeoExplorer",
    aboutText: "About GeoExplorer",
    mapInfoText: "Map Info",
    descriptionText: "Description",
    contactText: "Contact",
    aboutThisMapText: "About this Map",
    // End i18n.
    
    /**
     * private: property[mapPanel]
     * the :class:`GeoExt.MapPanel` instance for the main viewport
     */
    mapPanel: null,
    
    toggleGroup: "toolGroup",

    constructor: function(config) {
        // both the Composer and the Viewer need to know about the viewerTools
        // First row in each object is needed to correctly render a tool in the treeview
        // of the embed map dialog. TODO: make this more flexible so this is not needed.
        config.viewerTools = [
            {
                leaf: true,
                text: gxp.plugins.Print.prototype.tooltip,
                checked: false, 
                ptype: "gxp_print",
                iconCls: "gxp-icon-print",
                customParams: {outputFilename: 'GeoExplorer-print'},
                printService: config.printService
            }, {
                leaf: true, 
                text: gxp.plugins.Navigation.prototype.tooltip, 
                checked: false, 
                iconCls: "gxp-icon-pan",
                ptype: "gxp_navigation",
                toggleGroup: "navigation"
            }, {
                leaf: true, 
                text: gxp.plugins.WMSGetFeatureInfo.prototype.infoActionTip, 
                checked: true, 
                iconCls: "gxp-icon-getfeatureinfo",
                ptype: "gxp_wmsgetfeatureinfo",
                layerParams: ["CQL_FILTER"],
                format: 'html',
                defaultAction: 0,
                toggleGroup: this.toggleGroup
            }, {
                leaf: true, 
                text: gxp.plugins.Measure.prototype.measureTooltip, 
                checked: false, 
                iconCls: "gxp-icon-measure-length",
                ptype: "gxp_measure",
                controlOptions: {immediate: true},
                toggleGroup: this.toggleGroup
            }, {
                leaf: true, 
                text: gxp.plugins.Zoom.prototype.zoomInTooltip + " / " + gxp.plugins.Zoom.prototype.zoomOutTooltip, 
                checked: false, 
                iconCls: "gxp-icon-zoom-in",
                numberOfButtons: 2,
                ptype: "gxp_zoom"
            }, {
                leaf: true, 
                text: gxp.plugins.NavigationHistory.prototype.previousTooltip + " / " + gxp.plugins.NavigationHistory.prototype.nextTooltip, 
                checked: false, 
                iconCls: "gxp-icon-zoom-previous",
                numberOfButtons: 2,
                ptype: "gxp_navigationhistory"
            }, {
                leaf: true, 
                text: gxp.plugins.ZoomToExtent.prototype.tooltip, 
                checked: false, 
                iconCls: gxp.plugins.ZoomToExtent.prototype.iconCls,
                ptype: "gxp_zoomtoextent"
            }, {
                leaf: true, 
                text: gxp.plugins.Legend.prototype.tooltip, 
                checked: true, 
                iconCls: "gxp-icon-legend",
                ptype: "gxp_legend"
        }];

        GeoExplorer.superclass.constructor.apply(this, arguments);
    }, 

    loadConfig: function(config) {
    /* fix scroll behaviour
	config.map.controls = [
			new OpenLayers.Control.Navigation(
				{
				mouseWheelOptions:{cumulative:false}, 
				zoomWheelOptions: {interval: 1000}, 
				dragPanOptions: {enableKinetic: true}
				}),
			new OpenLayers.Control.PanPanel(),
			new OpenLayers.Control.ZoomPanel(),
			//new OpenLayers.Control.KeyboardDefaults(),
			new OpenLayers.Control.Attribution()
			];
        */
        
        var mapUrl = window.location.hash.substr(1);
        var match = mapUrl.match(/^maps\/(\d+)$/);
        var bookm = mapUrl.match(/q=/);
        if (match) {
            this.id = Number(match[1]);
            OpenLayers.Request.GET({
                url: "../" + mapUrl,
                success: function(request) {
                    var addConfig = Ext.util.JSON.decode(request.responseText);
                    // Don't use persisted tool configurations from old maps
                    delete addConfig.tools;
                    addConfig.map.controls = config.map.controls;
                    this.applyConfig(Ext.applyIf(addConfig, config));
                },
                failure: function(request) {
                    var obj;
                    try {
                        obj = Ext.util.JSON.decode(request.responseText);
                    } catch (err) {
                        // pass
                    }
                    var msg = this.loadConfigErrorText;
                    if (obj && obj.error) {
                        msg += obj.error;
                    } else {
                        msg += this.loadConfigErrorDefaultText;
                    }
                    this.on({
                        ready: function() {
                            this.displayXHRTrouble(msg, request.status);
                        },
                        scope: this
                    });
                    delete this.id;
                    window.location.hash = "";
                    this.applyConfig(config);
                },
                scope: this
            });
		} else if (bookm) {
			var urlConf = unescape(mapUrl.split('q=')[1]);
			var queryConfig = Ext.util.JSON.decode(urlConf);
			queryConfig.map.controls = config.map.controls;
            Ext.apply(config, queryConfig);
			this.applyConfig(config);
			window.location.hash = "";
        } else {
            var query = Ext.urlDecode(document.location.search.substr(1));
            if (query) {
                if (query.q) {
                    var queryConfig = Ext.util.JSON.decode(query.q);
                    Ext.apply(config, queryConfig);
                }
                /**
                 * Special handling for links from local GeoServer.
                 *
                 * The layers query string value indicates layers to add as 
                 * overlays from the local source.
                 *
                 * The bbox query string value indicates the initial extent in
                 * the current map projection.
                 */
                 if (query.layers) {
                     var layers = query.layers.split(/\s*,\s*/);
                     for (var i=0,ii=layers.length; i<ii; ++i) {
                         config.map.layers.push({
                             source: "local",
                             name: layers[i],
                             visibility: true,
                             bbox: query.lazy && query.bbox ? query.bbox.split(",") : undefined
                         });
                     }
                 }
                 if (query.bbox) {
                     delete config.map.zoom;
                     delete config.map.center;
                     config.map.extent = query.bbox.split(/\s*,\s*/);
                 }
                 if (query.lazy && config.sources.local) {
                     config.sources.local.requiredProperties = [];
                 }
            }
            
            this.applyConfig(config);
        }
        
    },
    
    displayXHRTrouble: function(msg, status) {
        
        Ext.Msg.show({
            title: this.xhrTroubleText + status,
            msg: msg,
            icon: Ext.MessageBox.WARNING
        });
        
    },
    
    /** private: method[initPortal]
     * Create the various parts that compose the layout.
     */
    initPortal: function() {
    
		var header = new Ext.Container({
        	height: 50,
        	html: "<div id='top'>" +
        	      "<a href='javascript:history.go(0)'><img alt='ZaanAtlas' src='data:image/png;base64,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' /></a>" +
        		  "<div id='headnav'>" +
        		  "<a href='#' onclick='app.displayAppInfo(); return false;'>Info</a>" + 
        		  "<a href='mailto:geo-informatie@zaanstad.nl?subject=ZaanAtlas'>Contact</a>" + 
        		  "<a href='#' onclick='app.showLoginDialog(); return false;' id='login-link'>Login</a>" + 
        		  "</div>" +
        		  "</div>"
        	});
        
        var westPanel = new Ext.Panel({
        	id: "tree",
        	title: "Lagen",
        	layout: "fit",
            collapsible: true,
            header: true
        });
        
        var westPanel2 = new Ext.Panel({
            collapsible: true,
            title: "Test",
            collapsible: true,
            header: true
        });
        
        var bigPanel = new Ext.Panel({
        	id: "bigpanel",
            region: "west",
            layout: "fit",
            width: 250,
            split: true,
            collapsible: true,
            defaults: {
                border: false
            },
            items: [
                westPanel
            ],
            activeItem: 0,
            header: false
        });
        
        this.toolbar = new Ext.Toolbar({
            disabled: true,
            id: 'paneltbar',
            items: this.createTools()
        });
        this.on("ready", function() {
            // enable only those items that were not specifically disabled
            var disabled = this.toolbar.items.filterBy(function(item) {
                return item.initialConfig && item.initialConfig.disabled;
            });
            this.toolbar.enable();
            disabled.each(function(item) {
                item.disable();
            });
            if (this.isAuthorized()) Ext.getCmp('adminbar').show();
        });

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
        
        this.portalItems = [{
            region: "center",
            layout: "border",
            tbar: header,
            items: [
                this.mapPanelContainer,
                bigPanel
            ]
        }];
        
        GeoExplorer.superclass.initPortal.apply(this, arguments);        
    },
    
    /** private: method[createTools]
     * Create the toolbar configuration for the main panel.  This method can be 
     * overridden in derived explorer classes such as :class:`GeoExplorer.Composer`
     * or :class:`GeoExplorer.Viewer` to provide specialized controls.
     */
    createTools: function() {
        var tools = [
            "-"
        ];
        return tools;
    },

    /** api: method[getBookmark]
     *  :return: ``String``
     *
     *  Generate a bookmark for an unsaved map.
     */
    getBookmark: function() {
        var params = Ext.apply(
            OpenLayers.Util.getParameters(),
            {q: Ext.util.JSON.encode(this.getState())}
        );
        
        // disregard any hash in the url, but maintain all other components
        var url = 
            document.location.href.split("?").shift() +
            "?" + Ext.urlEncode(params);
        
        return url;
    },

    /** private: method[displayAppInfo]
     * Display an informational dialog about the application.
     */
    displayAppInfo: function() {
        var appInfo = new Ext.Panel({
            title: this.appInfoText,
            html: "<iframe style='border: none; height: 100%; width: 100%' src='../about.html' frameborder='0' border='0'><a target='_blank' href='about.html'>" + this.aboutText + "</a></iframe>"
        });
        
        var appHelp = new Ext.Panel({
            title: "Algemeen",
            html: "<iframe style='border: none; height: 100%; width: 100%' src='../help.html' frameborder='0' border='0'></iframe>"        
        });

        var about = Ext.applyIf(this.about, {
            title: '', 
            "abstract": '', 
            contact: ''
        });

        var mapInfo = new Ext.Panel({
            title: this.mapInfoText,
            html: '<div class="gx-info-panel">' +
                  '<h2>'+ this.titleText+'</h2><p>' + about.title +
                  '</p><h2>'+ this.descriptionText+'</h2><p>' + app.about['abstract'] +
                  '</p> <h2>'+ this.contactText+'</h2><p>' + about.contact +'</p></div>',
            height: 'auto',
            width: 'auto'
        });

        var tabs = new Ext.TabPanel({
            activeTab: 0,
            items: [appHelp, mapInfo, appInfo]
        });

        var win = new Ext.Window({
            title: this.aboutText,
            modal: true,
            layout: "fit",
            width: 500,
            height: 600,
            items: [tabs]
        });
        win.show();
    },
    
    /** private: method[getState]
     *  :returns: ``Òbject`` the state of the viewer
     */
    getState: function() {
        var state = GeoExplorer.superclass.getState.apply(this, arguments);
        // Don't persist tools
        delete state.tools;
        //delete state.map.controls;
        return state;
    }
});


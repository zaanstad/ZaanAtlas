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
        var xy = e.getXY(),
            s = this.startXY;
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

    constructor: function (config) {
        // both the Composer and the Viewer need to know about the viewerTools
        // First row in each object is needed to correctly render a tool in the treeview
        // of the embed map dialog. TODO: make this more flexible so this is not needed.
        config.viewerTools = new this.getViewerTools();

        GeoExplorer.superclass.constructor.apply(this, arguments);
    },

    getViewerTools: function () {
        var tools = [{
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
            controlOptions: {
                immediate: true
            },
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
            text: gxp.plugins.ZoomToExtent.prototype.tooltip,
            checked: false,
            iconCls: gxp.plugins.ZoomToExtent.prototype.iconCls,
            ptype: "gxp_zoomtoextent"
        }, {
            leaf: true,
            text: gxp.plugins.LegendControl.prototype.tooltip,
            checked: true,
            iconCls: gxp.plugins.LegendControl.prototype.iconCls,
            ptype: "app_legendcontrol"
        }, {
            hidden: true,
            leaf: false,
            ptype: "app_zoomcontrol",
            actionTarget: "map",
            checked: true
        }];

        return tools;
    },

    loadConfig: function (config) {

        var mapUrl = window.location.hash.substr(1);
        var match = mapUrl.match(/^maps\/(\d+)$/);
        var bookm = mapUrl.match(/q=/);
        var filter = mapUrl.match(/filter=/);
        if (match) {
            this.id = Number(match[1]);
            Ext.Ajax.request({
                url: "../" + mapUrl,
                success: function (request) {
                    var addConfig = Ext.util.JSON.decode(request.responseText);
                    // Don't use persisted tool configurations from old maps
                    delete addConfig.tools;
                    addConfig.map.controls = config.map.controls;

                    // Use global configuration from viewer.html
                    delete addConfig.intraEnabled;
                    delete addConfig.sources;
                    delete addConfig.proxy;
                    delete addConfig.printService;

                    this.applyConfig(Ext.applyIf(addConfig, config));
                },
                failure: function (request) {
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
                        ready: function () {
                            this.displayXHRTrouble(msg, request.status);
                        },
                        scope: this
                    });
                    delete this.id;
                    //window.location.hash = "";
                    this.applyConfig(config);
                },
                scope: this
            });
        } else if (bookm) {
            var urlConf = unescape(mapUrl.split('q=')[1]);
            var queryConfig = Ext.util.JSON.decode(urlConf);
            // Use some settings, not all
            config.map.layers = queryConfig.map.layers;
            config.map.zoom = queryConfig.map.zoom;
            config.map.center = queryConfig.map.center;
            this.applyConfig(config);
        } else if (filter) {
            //http://localhost:8080/composer/#filter={"source": "intranet","name": "geo:lki_perceel","cql_filter": "aanduiding = 'ZDM01E01354'", "map":{"center":[112958,498065],"zoom":2} }
            //http://localhost:8080/composer/#filter={"source": "intranet","name": "geo:lki_perceel" }
            //http://localhost:8080/composer/#filter={"source": "intranet","name": "geo:lki_perceel","map":{"center":[115146.69,497313.09],"zoom":7} }
            //http://localhost:8080/composer/#filter={"map":{"center":[115146.69,497313.09],"zoom":7} }
            //http://localhost:8080/composer/#filter={"map":{ "bbox": [115091.223978078,493523.5271514406,117788.67322395752,496013.933048795] } }
            var urlConf = unescape(mapUrl.split('filter=')[1]);
            var queryConfig = Ext.util.JSON.decode(urlConf);

            if (queryConfig.name) {
                config.map.layers.push({
                    source: queryConfig.source,
                    name: queryConfig.name,
                    cql_filter: queryConfig.cql_filter,
                    selected: true
                });
            }

            if (queryConfig.cql_filter) {
                this.on('layerselectionchange', function (rec) {
                    this.zoomToFilter(rec)
                }, this, {
                    single: true
                });
            } else {
                if (queryConfig.map)
                {
                    if (queryConfig.map.center) {
                        delete config.map.extent;
                        config.map.zoom = queryConfig.map.zoom;
                        config.map.center = queryConfig.map.center;
                    }
                    if (queryConfig.map.bbox) {
                        delete config.map.zoom;
                        delete config.map.center;
                        config.map.extent = queryConfig.map.bbox;
                    }
                }
            }
            this.applyConfig(config);

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
                    for (var i = 0, ii = layers.length; i < ii; ++i) {
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

    /** private: method[zoomToFilter]
     *  Zoom to the extend of a filter
     */
    zoomToFilter: function (rec) {
        var cqlFormat = new OpenLayers.Format.CQL();
        var cqlString = rec.getLayer().params.CQL_FILTER;

        if (cqlString) {
            var source = this.layerSources[rec.data.source];
            source.getWFSProtocol(rec, function (protocol, schema, record) {

                if (!protocol) {
                    // TODO: add logging to viewer
                    throw new Error("Failed to get protocol for record: " + record.get("name"));
                }
                var wfsLayer = new OpenLayers.Layer.Vector("CQLRESULT", {
                    strategies: [new OpenLayers.Strategy.Fixed()],
                    displayInLayerSwitcher: false,
                    eventListeners: {
                        'loadend': function (evt) {
                            var extend = wfsLayer.getDataExtent();
                            if (extend !== null) {
                                map.zoomToExtent(extend);
                            }
                            map.removeLayer(wfsLayer);
                        }
                    },
                    protocol: new OpenLayers.Protocol.WFS(Ext.apply({
                        filter: cqlFormat.read(cqlString),
                        featurePrefix: "",
                        outputFormat: "JSON",
                        maxFeatures: 100,
                        propertyNames: [protocol.geometryName]
                    }, protocol))
                });
                var map = this.mapPanel.map;
                map.addLayer(wfsLayer);
            }, this);
        }
    },

    displayXHRTrouble: function (msg, status) {

        Ext.Msg.show({
            title: this.xhrTroubleText + status,
            msg: msg,
            icon: Ext.MessageBox.WARNING
        });

    },

    /** private: method[initPortal]
     * Create the various parts that compose the layout.
     */
    initPortal: function () {

        var header = new Ext.Container({
            height: 50,
            html: "<div id='top'>" +
                "<a href='javascript:history.go(0)'>" +
                "<div id='atlasLogo'></div>" + //<img alt='ZaanAtlas' src='data:image/png;base64,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' /></a>" +
            "<div id='headnav'>" +
                "<a href='#' onclick='app.displayAppInfo(); return false;'>Info</a>" +
                "<a href='mailto:geo-informatie@zaanstad.nl?subject=ZaanAtlas'>Contact</a>" +
                "<a href='#' id='login-link' onclick='app.authenticate(); return false;'>Login</a>" +
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
        this.on("ready", function () {
            // enable only those items that were not specifically disabled
            var disabled = this.toolbar.items.filterBy(function (item) {
                return item.initialConfig && item.initialConfig.disabled;
            });
            this.toolbar.enable();
            disabled.each(function (item) {
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
    createTools: function () {
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
    getBookmark: function () {
        var params = Ext.apply(
            OpenLayers.Util.getParameters(), {
                q: Ext.util.JSON.encode(this.getState())
            }
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
    displayAppInfo: function () {
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
                '<h2>' + this.titleText + '</h2><p>' + about.title +
                '</p><h2>' + this.descriptionText + '</h2><p>' + app.about['abstract'] +
                '</p> <h2>' + this.contactText + '</h2><p>' + about.contact + '</p></div>',
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
    getState: function () {
        var state = GeoExplorer.superclass.getState.apply(this, arguments);
        // Don't persist tools
        delete state.tools;
        //delete state.map.controls;
        return state;
    }
});
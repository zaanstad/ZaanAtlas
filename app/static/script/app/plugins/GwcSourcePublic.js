/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/LayerSource.js
 * @requires OpenLayers/Layer/WMTS.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = TileSource
 */

/** api: (extends)
 *  plugins/LayerSource.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: TileSource(config)
 *
 *    Plugin for using MapQuest layers with :class:`gxp.Viewer` instances.
 *
 *    Available layer names are "osm" and "naip"
 */
/** api: example
 *  The configuration in the ``sources`` property of the :class:`gxp.Viewer` is
 *  straightforward:
 *
 *  .. code-block:: javascript
 *
 *    "mapquest": {
 *        ptype: "gxp_tilesource"
 *    }
 *
 *  A typical configuration for a layer from this source (in the ``layers``
 *  array of the viewer's ``map`` config option would look like this:
 *
 *  .. code-block:: javascript
 *
 *    {
 *        source: "tiles",
 *        name: "osm"
 *    }
 *
 */
gxp.plugins.TileSource = Ext.extend(gxp.plugins.LayerSource, {
    
    /** api: ptype = gxp_tilesource */
    ptype: "gxp_gwcsource",

    /** api: property[store]
     *  ``GeoExt.data.LayerStore``. Will contain records with "osm" and
     *  "naip" as name field values.
     */
    
    /** api: config[title]
     *  ``String``
     *  A descriptive title for this layer source (i18n).
     */
    title: "GeoWebCache Layers",

    /** api: config[attributionZaanstad]
     *  ``String``
     *  Attribution string for NAIP generated layer (i18n).
     */
    attributionZaanstad: "<a href='http://www.zaanstad.nl/' target='_blank'><img src='../theme/app/img/logo_zaanstad.png' border='0'></a>",

    /** api: config[attributionMapfactory]
     *  ``String``
     *  Attribution string for NAIP generated layer (i18n).
     */
    attributionMapfactory: "<a href='http://www.mapfactory.nl/' target='_blank'><img src='../theme/app/img/logo_mapfactory.png' border='0'></a>",

    /** api: config[attributionKadaster]
     *  ``String``
     *  Attribution string for NAIP generated layer (i18n).
     */
    attributionKadaster: "<a href='http://www.kadaster.nl/' target='_blank'><img src='../theme/app/img/logo_kadaster.png' border='0'></a>",

    /** api: config[url]
     *  ``String``
     *  Attribution string for tile server.
     */
	url: "http://geo.zaanstad.nl/geowebcache/service/wms",

    urlArray: ["http://geo.zaanstad.nl/geowebcache/service/wms",
    //            "http://geo1.zaanstad.nl/geowebcache/service/wms",
                "https://geo2.zaanstad.nl/geowebcache/service/wms"],

    /** private: property[ready]
     *  ``Boolean``
     */
    ready: false,

    /** api: config[isIEBeforeIE9]
     *  ``Bool``
     *  Checks weather the browser is before IE9.
     */
	isIEBeforeIE9: Ext.isIE6 || Ext.isIE7 || Ext.isIE8,

    /** api: method[createStore]
     *
     *  Creates a store of layer records.  Fires "ready" when store is loaded.
     */
    createStore: function() {
        
        var options = {
            projection: "EPSG:28992",
            resolutions: [53.76, 26.88, 13.44, 6.72, 3.36, 1.68, 0.84, 0.42, 0.21, 0.105, 0.0525],
			maxExtent: new OpenLayers.Bounds(12628.0541,308179.0423,287879.2541,610955.3622999999),
            units: "m",
            buffer: 1,
            transitionEffect: "resize",
            //singleTile: true,
            tileSize: new OpenLayers.Size(256,256),
            tileOptions: {crossOriginKeyword: null}
        };
        
        var layers = [
            new OpenLayers.Layer.WMS(
                "Bestemmingsplannen",
                this.url,
                {layers: "Bestemmingsplannen", format: "image/png"},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "bestemmingsplannen",
                    metadata: "http://geo.zaanstad.nl/geonetwork?uuid=c8c39731-d9be-4977-8df0-4da7b425d0eb",
                    queryable: true,
                    transitionEffect: null
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Open Street Map",
                this.url,
                {layers: "OSM", format: "image/png8"},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "osm",
                    metadata: "http://geo.zaanstad.nl/geonetwork?uuid=88d48c15-c3dd-44a3-9b5e-224acb28e87d",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Zaanstad",
                this.url,
                {layers: "Zaanstad", format: "image/png8"},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "Zaanstad",
                    metadata: "http://geo.zaanstad.nl/geonetwork?uuid=a0371e2d-5716-44a5-85f2-6da623646e0e",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Top10atlas",
                this.url,
                {layers: "Top10atlas", format: "image/png"},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "Top10atlas",
                    metadata: "http://geo.zaanstad.nl/geonetwork?uuid=a2643d1d-c507-4250-9d46-482d3bbab58d",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto",
                this.url,
                {layers: "Luchtfoto", format: "image/png8"},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionKadaster,
                    type: "lufo",
                    metadata: "http://geo.zaanstad.nl/geonetwork?uuid=b2b91354-49cf-41c5-8a8e-721f1876f92d",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto 2002 kleur",
                this.url,
                {layers: "Lufo2002-kleur", format: this.isIEBeforeIE9 ? 'image/png8' : 'image/png'},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "Lufo2002-kleur",
                    metadata: "http://geo.zaanstad.nl/geonetwork?uuid=9c7b592e-6f4f-47c5-ba20-d9a471d88305",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto 2007 kleur",
                this.url,
                {layers: "Lufo2007-kleur", format: this.isIEBeforeIE9 ? 'image/png8' : 'image/png'},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "Lufo2007-kleur",
                    metadata: "http://geo.zaanstad.nl/geonetwork?uuid=d26d25c8-7b70-4a9f-9863-c8075d9c47e5",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto 2008 kleur",
                this.url,
                {layers: "Lufo2008-kleur", format: this.isIEBeforeIE9 ? 'image/png8' : 'image/png'},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "Lufo2008-kleur",
                    metadata: "http://geo.zaanstad.nl/geonetwork?uuid=d77368e4-691a-40aa-9f2d-f9956799ae95",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto 2010 kleur",
                this.url,
                {layers: "Lufo2010-kleur", format: this.isIEBeforeIE9 ? 'image/png8' : 'image/png'},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "Lufo2010-kleur",
                    metadata: "http://geo.zaanstad.nl/geonetwork?uuid=e25f6118-1bef-4626-8d38-661fc58c1097",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto 2011 kleur",
                this.url,
                {layers: "Lufo2011-kleur", format: this.isIEBeforeIE9 ? 'image/png8' : 'image/png'},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "Lufo2011-kleur",
                    metadata: "http://geo.zaanstad.nl/geonetwork?uuid=820e3b5b-faf6-4c80-8301-7236a242982c",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Topkaart raster 2010",
                this.url,
                {layers: "Top25raster-2010", format: "image/png8"},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "top25raster-2010",
                    metadata: "",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "GBKZ",
                this.url,
                {layers: "GBKZ", format: "image/png"},
                OpenLayers.Util.applyDefaults({
                    attribution: this.attributionZaanstad,
                    type: "gbkz",
                    metadata: "http://geo.zaanstad.nl/geonetwork?uuid=686b322a-afde-4b51-a87c-767b2da549dc",
                    group: "background"
                }, options)
            )
        ];
        
        this.store = new GeoExt.data.LayerStore({
            layers: layers,
            fields: [
                {name: "source", type: "string"},
                {name: "name", type: "string", mapping: "type"},
                {name: "group", type: "string", mapping: "group"},
                {name: "fixed", type: "boolean", defaultValue: false},
                {name: "properties", type: "string", defaultValue: "gxp_wmslayerpanel"},
                {name: "queryable", type: "boolean", mapping: "queryable"},
                {name: "selected", type: "boolean"},
                {name: "metadata", type: "string", mapping: "metadata"}
            ]
        });
        
		/** ping server of lazy source with capability request, to see if it is available
		var paramString = OpenLayers.Util.getParameterString({SERVICE: "WMS", REQUEST: "getcapabilities", VERSION: "1.1.1"});
		url = OpenLayers.Util.urlAppend(this.url, paramString);
		var OLrequest = OpenLayers.Request.GET({
			 url : url,
			 async: true,
			 scope: this,
			 success : function(response) {
			 	this.ready = true;
			 	this.fireEvent("ready", this);
			 },
			 failure : function(response) {
			 	this.fireEvent("failure", this,
                            "Layer source not available.",
                            "Unable to contact WMS service."
                        );
			 }
		 });
        */
        this.fireEvent("ready", this);
    },
    
    /** api: method[getSchema]
     *  Gets the schema for a layer of this source, if the layer is a feature
     *  layer. The WMS does not support DescribeLayer and the layer is not
     *   associated with a WFS feature type.
     */
    getSchema: function(rec, callback, scope) {
        return false;
    },

    /** api: method[createLayerRecord]
     *  :arg config:  ``Object``  The application config for this layer.
     *  :returns: ``GeoExt.data.LayerRecord``
     *
     *  Create a layer record given the config.
     */
    createLayerRecord: function(config) {
        var record;
        var index = this.store.findExact("name", config.name);
        if (index > -1) {

            record = this.store.getAt(index).copy(Ext.data.Record.id({}));            
            var layer = record.getLayer().clone();
 
            // set layer title from config
            if (config.title) {
                /**
                 * Because the layer title data is duplicated, we have
                 * to set it in both places.  After records have been
                 * added to the store, the store handles this
                 * synchronization.
                 */
                layer.setName(config.title);
                record.set("title", config.title);
            }

            if (config.opacity) {
                // use this to detect if the layer was added from a bookmark url
                record.set("group", config.group);
            }

            layer.addOptions({
                visibility: ("visibility" in config) ? config.visibility : true,
                opacity: ("opacity" in config) ? config.opacity : 1
            });
            
            record.set("selected", config.selected || false);
            record.set("source", config.source);
            record.set("name", config.name);

            var obj = new Array({format: "text/html", href: record.get("metadata"), type: "ISO19115:2003"});
            record.set("metadataURLs", obj);

            record.data.layer = layer;
            record.commit();
        }
        return record;
    }

});

Ext.preg(gxp.plugins.TileSource.prototype.ptype, gxp.plugins.TileSource);
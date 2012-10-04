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
                    queryable: true
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Open Street Map",
                this.url,
                {layers: "OSM", format: "image/png8"},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "osm",
                    grp: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Zaanstad",
                this.url,
                {layers: "Zaanstad", format: "image/png8"},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "Zaanstad",
                    grp: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto",
                this.url,
                {layers: "Luchtfoto", format: "image/png8"},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionKadaster,
                    type: "lufo",
                    grp: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto 2007 kleur",
                this.url,
                {layers: "Lufo2007-kleur", format: this.isIEBeforeIE9 ? 'image/png8' : 'image/png'},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "Lufo2007-kleur",
                    grp: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto 2008 kleur",
                this.url,
                {layers: "Lufo2008-kleur", format: this.isIEBeforeIE9 ? 'image/png8' : 'image/png'},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "Lufo2008-kleur",
                    grp: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto 2010 kleur",
                this.url,
                {layers: "Lufo2010-kleur", format: this.isIEBeforeIE9 ? 'image/png8' : 'image/png'},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "Lufo2010-kleur",
                    grp: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto 2011 kleur",
                this.url,
                {layers: "Lufo2011-kleur", format: this.isIEBeforeIE9 ? 'image/png8' : 'image/png'},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "Lufo2011-kleur",
                    grp: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Topkaart (top10nl)",
                this.url,
                {layers: "Top10nl", format: "image/png8"},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionKadaster,
                    type: "top10nl",
                    grp: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Topkaart (top10nl) ondertoon",
                this.url,
                {layers: "Top10nl-ondertoon", format: "image/png8"},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "top10nl-ondertoon",
                    grp: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "GBKZ",
                this.url,
                {layers: "GBKZ", format: "image/png"},
                OpenLayers.Util.applyDefaults({
                    attribution: this.attributionZaanstad,
                    type: "gbkz",
                    grp: "background"
                }, options)
            )
        ];
        
        this.store = new GeoExt.data.LayerStore({
            layers: layers,
            fields: [
                {name: "source", type: "string"},
                {name: "name", type: "string", mapping: "type"},
                {name: "group", type: "string", mapping: "grp"},
                {name: "fixed", type: "boolean", defaultValue: false},
                {name: "properties", type: "string", defaultValue: "gxp_wmslayerpanel"},
                {name: "queryable", type: "boolean", mapping: "queryable"},
                {name: "selected", type: "boolean"}
            ]
        });
        
		// ping server of lazy source with capability request, to see if it is available
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

            // set visibility from config
            if ("visibility" in config) {
                layer.visibility = config.visibility;
            }
            
            record.set("selected", config.selected || false);
            record.set("source", config.source);
            record.set("name", config.name);
            record.set("properties", "gxp_wmslayerpanel");
            if ("group" in config) {
                record.set("group", config.group);
            }

            record.data.layer = layer;
            record.commit();
        }
        return record;
    }

});

Ext.preg(gxp.plugins.TileSource.prototype.ptype, gxp.plugins.TileSource);
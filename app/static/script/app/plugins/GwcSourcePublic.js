/**
 * Copyright (c) 2008-2013 Zaanstad Municipality
 *
 * Published under the GPL license.
 * See https://github.com/teamgeo/zaanatlas/raw/master/license.txt for the full text
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
    title: "MapProxy publiek",
    text: "Deze kaart is publiekelijk beschikbaar",  

    /** api: config[attributionZaanstad]
     *  ``String``
     *  Attribution string for NAIP generated layer (i18n).
     */
    attributionZaanstad: "<a href='https://www.zaanstad.nl/' target='_blank'><img src='../theme/app/img/logo_zaanstad.png' border='0'></a>",

    /** api: config[attributionMapfactory]
     *  ``String``
     *  Attribution string for NAIP generated layer (i18n).
     */
    attributionMapfactory: "<a href='http://www.mapfactory.nl/' target='_blank'><img src='../theme/app/img/logo_mapfactory.png' border='0'></a>",

    /** api: config[attributionKadaster]
     *  ``String``
     *  Attribution string for NAIP generated layer (i18n).
     */
    attributionKadaster: "<a href='https://www.kadaster.nl/' target='_blank'><img src='../theme/app/img/logo_kadaster.png' border='0'></a>",

    /** api: config[url]
     *  ``String``
     *  Attribution string for tile server.
     */
    url_mapproxy: "https://tiles.zaanstad.nl/mapproxy/service",
    url_mapproxy_old: "https://geo.zaanstad.nl/mapproxy/service",
    url_geoserver: "https://geointer.zaanstad.nl/geoserver/geo/wms",
    url_ngr: "https://geodata.nationaalgeoregister.nl/bag/wms",
    url_ngr2: "https://geodata.nationaalgeoregister.nl/wmts?",
    url_ngr3: "https://geodata.nationaalgeoregister.nl/tiles/service/wmts?REQUEST=GetCapabilities",
    url_ngr4: "https://geodata.nationaalgeoregister.nl/beta/bgt/wms",
    url_ngr5: "https://geodata.nationaalgeoregister.nl/tiles/service/wmts?request=GetCapabilities&service=WMTS",

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
			//maxExtent: new OpenLayers.Bounds(12628.0541,308179.0423,287879.2541,610955.3622999999),
            maxExtent: new OpenLayers.Bounds(-285401.92,22598.08,595401.9199999999,903401.9199999999),
            units: "m",
            buffer: 1,
            transitionEffect: "resize",
            //gutter: 10,
            //singleTile: true,
            tileSize: new OpenLayers.Size(256,256),
            tileOptions: {crossOriginKeyword: null}
        };
        
        var layers = [
            new OpenLayers.Layer.WMS(
                "Kaart 1812",
                this.url_mapproxy,
                {layers: "Zaanstad1812", format: "image/png", tiled: true},
                OpenLayers.Util.applyDefaults({
                    attribution: this.attributionMapfactory,
                    type: "Zaanstad1812",
                    metadata: "https://geo.zaanstad.nl/geonetwork?uuid=0490d7d2-27ae-4842-ae93-ba9a53bc1bd4",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto 1958",
                this.url_mapproxy_old,
                {layers: "Lufo1958-zw", format: "image/png", tiled: true},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "Lufo1958-zw",
                    metadata: "https://geo.zaanstad.nl/geonetwork?uuid=9e5a760c-435e-42b9-b2c7-c868a191d812",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto 1978",
                this.url_mapproxy_old,
                {layers: "Lufo1978-zw", format: "image/png", tiled: true},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "Lufo1978-zw",
                    metadata: "https://geo.zaanstad.nl/geonetwork?uuid=dbc5567d-f817-42db-9371-df42714db5d4",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto 1983",
                this.url_mapproxy_old,
                {layers: "Lufo1983-zw", format: "image/png", tiled: true},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "Lufo1983-zw",
                    metadata: "https://geo.zaanstad.nl/geonetwork?uuid=922a4ce3-3960-49f4-91ce-e13b4e592bcb",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto 2002",
                this.url_mapproxy_old,
                {layers: "Lufo2002", format: 'image/png', tiled: true},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "Lufo2002",
                    metadata: "https://geo.zaanstad.nl/geonetwork?uuid=9c7b592e-6f4f-47c5-ba20-d9a471d88305",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto 2007",
                this.url_mapproxy_old,
                {layers: "Lufo2007", format: 'image/png', tiled: true},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "Lufo2007",
                    metadata: "https://geo.zaanstad.nl/geonetwork?uuid=d26d25c8-7b70-4a9f-9863-c8075d9c47e5",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto 2008",
                this.url_mapproxy_old,
                {layers: "Lufo2008", format: 'image/png', tiled: true},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "Lufo2008",
                    metadata: "https://geo.zaanstad.nl/geonetwork?uuid=d77368e4-691a-40aa-9f2d-f9956799ae95",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto 2010",
                this.url_mapproxy_old,
                {layers: "Lufo2010", format: 'image/png', tiled: true},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "Lufo2010",
                    metadata: "https://geo.zaanstad.nl/geonetwork?uuid=e25f6118-1bef-4626-8d38-661fc58c1097",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto 2011",
                this.url_mapproxy_old,
                {layers: "Lufo2011", format: 'image/png', tiled: true},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "Lufo2011",
                    metadata: "https://geo.zaanstad.nl/geonetwork?uuid=820e3b5b-faf6-4c80-8301-7236a242982c",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto 2013",
                this.url_mapproxy_old,
                {layers: "Lufo2013", format: 'image/png', tiled: true},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "Lufo2013",
                    tiled: true,
                    metadata: "https://geo.zaanstad.nl/geonetwork?uuid=e249cf32-c7dc-4f56-b334-c653ab070349",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto 2014",
                this.url_mapproxy_old,
                {layers: "Lufo2014", format: 'image/png', tiled: true},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "Lufo2014",
                    tiled: true,
                    metadata: "https://geo.zaanstad.nl/geonetwork?uuid=61be4ff1-5934-489f-bc6d-80fe6da61d6a",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto 2015",
                this.url_mapproxy_old,
                {layers: "Lufo2015", format: 'image/png', tiled: true},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "Lufo2015",
                    tiled: true,
                    metadata: "https://geo.zaanstad.nl/geonetwork?uuid=c7a92d7d-4c00-4e3f-9ad2-57f1df28dd4d",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto 2016",
                this.url_mapproxy,
                {layers: "Lufo2016", format: 'image/jpeg', tiled: true},
                OpenLayers.Util.applyDefaults({
                    attribution: this.attributionZaanstad,
                    type: "Lufo2016",
                    tiled: true,
                    metadata: "https://geo.zaanstad.nl/geonetwork?uuid=7aa67352-e422-4704-9522-c93b42af9b83",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto 2017",
                this.url_mapproxy,
                {layers: "Lufo2017", format: 'image/jpeg', tiled: true},
                OpenLayers.Util.applyDefaults({
                    attribution: this.attributionZaanstad,
                    type: "Lufo2017",
                    tiled: true,
                    metadata: "https://geo.zaanstad.nl/geonetwork?uuid=718090fe-8d44-4969-9f8b-652d13644041",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto 2018",
                this.url_mapproxy,
                {layers: "Lufo2018", format: 'image/jpeg', tiled: true},
                OpenLayers.Util.applyDefaults({
                    attribution: this.attributionZaanstad,
                    type: "Lufo2018",
                    tiled: true,
                    metadata: "https://geo.zaanstad.nl/geonetwork?uuid=826735d1-1467-4888-9829-61019c033431",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto 2019",
                this.url_mapproxy,
                {layers: "Lufo2019", format: 'image/jpeg', tiled: true},
                OpenLayers.Util.applyDefaults({
                    attribution: this.attributionZaanstad,
                    type: "Lufo2019",
                    tiled: true,
                    metadata: "https://geo.zaanstad.nl/geonetwork?uuid=424f1841-e376-438f-9ca8-4eef6c0cf81e",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto 2020",
                this.url_mapproxy,
                {layers: "Lufo2020", format: 'image/jpeg', tiled: false},
                OpenLayers.Util.applyDefaults({
                    attribution: this.attributionZaanstad,
                    type: "Lufo2020",
                    tiled: true,
                    metadata: "https://geo.zaanstad.nl/geonetwork?uuid=ff5b053e-6f9b-4694-b976-295e5a670ed7",
                    group: "background"
                }, options)
            ),            
            new OpenLayers.Layer.WMS(
                "Kaart kleur",
                this.url_mapproxy,
                {layers: "referentiekaart", format: 'image/png', tiled: true},
                OpenLayers.Util.applyDefaults({
                    attribution: this.attributionZaanstad,
                    type: "referentiekaart",
                    tiled: true,
                    metadata: "https://geo.zaanstad.nl/geonetwork?uuid=9c70ca67-c928-4b23-8c2d-8c0be6017c92",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Kaart lijngericht",
                this.url_mapproxy,
                {layers: "bgt_lijngericht", format: 'image/png', tiled: true},
                OpenLayers.Util.applyDefaults({
                    attribution: this.attributionZaanstad,
                    type: "bgt_lijngericht",
                    tiled: true,
                    metadata: "https://geo.zaanstad.nl/geonetwork?uuid=4c58ce2c-ea1a-4fa3-a391-529499fa4077",
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
                {name: "hideInLegend", type: "boolean", defaultValue: true},
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
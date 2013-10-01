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
gxp.plugins.TileSourceLocal = Ext.extend(gxp.plugins.LayerSource, {
    
    /** api: ptype = gxp_tilesource */
    ptype: "gxp_gwcsource_local",

    /** api: property[store]
     *  ``GeoExt.data.LayerStore``. Will contain records with "osm" and
     *  "naip" as name field values.
     */
    
    /** api: config[title]
     *  ``String``
     *  A descriptive title for this layer source (i18n).
     */
    title: "GeoWebCache Intranet",

    /** api: config[naipAttribution]
     *  ``String``
     *  Attribution string for NAIP generated layer (i18n).
     */
    attributionZaanstad: "<a href='http://www.zaanstad.nl/' target='_blank'><img src='../theme/app/img/logo_zaanstad.png' border='0'></a>",

    /** api: config[attributionMapfactory]
     *  ``String``
     *  Attribution string for NAIP generated layer (i18n).
     */
    attributionMapfactory: "<a href='http://www.mapfactory.nl/' target='_blank'><img src='../theme/app/img/logo_mapfactory.png' border='0'></a>",

    /** api: config[attributionCitoplan]
     *  ``String``
     *  Attribution string for NAIP generated layer (i18n).
     */
    attributionCitoplan: "<a href='http://www.citoplan.nl/' target='_blank'><img src='../theme/app/img/logo_citoplan.png' border='0'></a>",

    /** api: config[url]
     *  ``String``
     *  Attribution string for tile server.
     */
    url: "http://map16z/geowebcache/service/wms",

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
                "Zaanstad 1812",
                this.url,
                {layers: "Zaanstad1812", format: "image/png"},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionMapfactory,
                    type: "Zaanstad1812",
                    metadata: "http://geo.zaanstad.nl/geonetwork?uuid=0490d7d2-27ae-4842-ae93-ba9a53bc1bd4",
                    group: "background"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Cito-Plan",
                this.url,
                {layers: "CITOPLAN", format: "image/png8"},
                OpenLayers.Util.applyDefaults({
                    attribution: this.attributionCitoplan,
                    type: "CITOPLAN",
                    metadata: "http://geo.zaanstad.nl/geonetwork?uuid=993da2d0-8541-4f57-9ec3-b106529ff9a1",
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

        /* ping server of lazy source with capability request, to see if it is available
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

Ext.preg(gxp.plugins.TileSourceLocal.prototype.ptype, gxp.plugins.TileSourceLocal);
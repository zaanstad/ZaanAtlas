/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

 /**
 * Reasons for override: Add outputFormat option to make JSON support available
 */

/**
 * @include data/AutoCompleteReader.js
 * @include data/AutoCompleteProxy.js
 */

/** api: (define)
 *  module = gxp.form
 *  class = SimpleWfsComboBox
 *  base_link = `Ext.form.ComboBox <http://extjs.com/deploy/dev/docs/?class=Ext.form.ComboBox>`_
 */
Ext.namespace("gxp.form");

/** api: constructor
 *  .. class:: AutoCompleteComboBox(config)
 *
 *  Creates an autocomplete combo box that issues queries to a WFS typename.
 *
 */
gxp.form.SimpleWfsComboBox = Ext.extend(Ext.form.ComboBox, {

    /** api: xtype = gxp_autocompletecombo */
    xtype: "gxp_simplewfscombo",

    /** api: config[fieldName]
     *  ``String``
     *  The name of the field/attribute to search on. The "name" of this form
     *  field will also default to fieldName if not provided explicitly. 
     */ 
    fieldName: null,

    /**
     * api: config[featureType]
     * ``String``
     * The WFS featureType to search on.
     */
    featureType: null,

    /**
     * api: config[featurePrefix]
     * ``String``
     * The featurePrefix associated with the featureType.
     */
    featurePrefix: null,

    /**
     * api: config[fieldLabel]
     * ``String``
     * The label to associate with this search field.
     */
    fieldLabel: null,

    /**
     * api: config[geometryName]
     * ``String``
     * The name of the geometry field.
     */
    geometryName: null,

    /**
     * api: config[maxFeatures]
     * ``Integer``
     * The maximum number of features to retrieve in one search action. 
     * Defaults to 500.
     */
    maxFeatures: 500,

    /**
     * api: config[url]
     * ``String``
     * The url of the WFS to search on.
     */
    url: null,

    /**
     * api: config[srsName]
     * ``String``
     * The SRS to use in the WFS GetFeature request.
     */ 
    srsName: null,

    /**
     * api: config[url]
     * ``String``
     * The outputformat of the request.
     */
    outputFormat: "GML2",

    autoHeight: true,

    hideTrigger: true,

    /** private: method[initComponent]
     *  Override
     */
    initComponent: function() {
        var fields = [{name: this.fieldName}];
        var propertyNames = [this.fieldName];
        if (this.geometryName !== null) {
            fields.push({name: this.geometryName});
            propertyNames.push(this.geometryName);
        }
        if (!this.name) {
            this.name = this.fieldName;
        }
        this.valueField = this.displayField = this.fieldName;
        this.tpl = new Ext.XTemplate('<tpl for="."><div class="x-form-field">','{'+this.displayField+'}','</div></tpl>');
        this.itemSelector = 'div.x-form-field';
        this.store = new Ext.data.Store({
            fields: fields,
            reader: new gxp.data.AutoCompleteReader({uniqueField: this.fieldName}, propertyNames),
            proxy: new gxp.data.AutoCompleteProxy({protocol: new OpenLayers.Protocol.WFS({
                version: "1.1.0",
                url: this.url,
                outputFormat: this.outputFormat,
                featureType: this.featureType,
                featurePrefix: this.featurePrefix,
                srsName: this.srsName,
                propertyNames: propertyNames,
                maxFeatures: this.maxFeatures
            }), setParamsAsOptions: true}),
            sortInfo: {
                field: this.fieldName,
                direction: 'ASC'
            }
        });

        return gxp.form.SimpleWfsComboBox.superclass.initComponent.apply(this, arguments);
    },

    /** private: method[initComponent]
     *  Override
     */
    update: function() {
        var fields = [{name: this.fieldName}];
        var propertyNames = [this.fieldName];

        this.name = this.fieldName;

        this.valueField = this.displayField = this.fieldName;
        this.tpl = new Ext.XTemplate('<tpl for="."><div class="x-form-field">','{'+this.displayField+'}','</div></tpl>');
        this.itemSelector = 'div.x-form-field';
        this.store = new Ext.data.Store({
            fields: fields,
            reader: new gxp.data.AutoCompleteReader({uniqueField: this.fieldName}, propertyNames),
            proxy: new gxp.data.AutoCompleteProxy({protocol: new OpenLayers.Protocol.WFS({
                version: "1.1.0",
                url: this.url,
                outputFormat: this.outputFormat,
                featureType: this.featureType,
                featurePrefix: this.featurePrefix,
                srsName: this.srsName,
                propertyNames: propertyNames,
                maxFeatures: this.maxFeatures
            }), setParamsAsOptions: true}),
            sortInfo: {
                field: this.fieldName,
                direction: 'ASC'
            }
        });
    }

});

Ext.reg(gxp.form.SimpleWfsComboBox.prototype.xtype, gxp.form.SimpleWfsComboBox);

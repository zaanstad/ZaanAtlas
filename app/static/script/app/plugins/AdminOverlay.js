/**
 * Copyright (c) 2008-2013 Zaanstad Municipality
 *
 * Published under the GPL license.
 * See https://github.com/teamgeo/zaanatlas/raw/master/license.txt for the full text
 * of the license.
 */

/** api: (define)
 *  module = gxp
 *  class = ScaleOverlay
 *  base_link = `Ext.Panel <http://dev.sencha.com/deploy/dev/docs/?class=Ext.Panel>`_
 */
Ext.namespace("gxp");

/** api: constructor
 *  .. class:: AdminOverlay(config)
 *   
 *      Create a panel for showing a ScaleLine control and a combobox for 
 *      selecting the map scale.
 */
gxp.AdminOverlay = Ext.extend(Ext.Panel, {
    
    /** api: config[map]
     *  ``OpenLayers.Map`` or :class:`GeoExt.MapPanel`
     *  The map for which to show the scale info.
     */
    map: null,

    /** Needs authorization */
    needsAuthorization: true,
    
    /** Identification */
    id:'adminbar',
    
	/** api: config[doneText]
	* ``String``
	* Text for Done button (i18n).
	*/
    doneText: "Sluiten",

    /** private: method[initComponent]
     *  Initialize the component.
     */
    initComponent: function() {
        gxp.AdminOverlay.superclass.initComponent.call(this);
        this.cls = 'admin-overlay';
        if(this.map) {
            if(this.map instanceof GeoExt.MapPanel) {
                this.map = this.map.map;
            }
            this.bind(this.map);
        }
        this.on("beforedestroy", this.unbind, this);        
    },
    
    /** private: method[addToMapPanel]
     *  :param panel: :class:`GeoExt.MapPanel`
     *  
     *  Called by a MapPanel if this component is one of the items in the panel.
     */
    addToMapPanel: function(panel) {
        this.on({
            afterrender: function() {
                this.bind(panel.map);
            },
            scope: this
        });
    },
    
    /** private: method[stopMouseEvents]
     *  :param e: ``Object``
     */
    stopMouseEvents: function(e) {
        e.stopEvent();
    },
    
    /** private: method[removeFromMapPanel]
     *  :param panel: :class:`GeoExt.MapPanel`
     *  
     *  Called by a MapPanel if this component is one of the items in the panel.
     */
    removeFromMapPanel: function(panel) {
        var el = this.getEl();
        el.un("mousedown", this.stopMouseEvents, this);
        el.un("click", this.stopMouseEvents, this);
        this.unbind();
    },

    /** private: method[bind]
     *  :param map: ``OpenLayers.Map``
     */
    bind: function(map) {
        this.map = map;
        var wrapper1 = new Ext.ButtonGroup({
        	id: 'adminbuttons',
        	title: 'Beheer',
        	border: false,
        	layout: 'form',
            items: [{
						xtype: 'button', 
						text: 'Bewaar',
						width: 88,
						tooltip: 'Bewaar of bewerk dit thema',
						handler: function() {
								app.save(app.showEmbedWindow);
							},
						scope: this,
						iconCls: 'icon-save'
            		}, { 
						xtype: 'button', 
						text: "Thema's",
						width: 88,
						tooltip: "Open de lijst met opgeslagen thema's",
						handler: function() {
								this.loadmaps();
							},
						scope: this,
						icon: "../theme/app/img/silk/folder_picture.png"
            		}]
        });

        this.add(wrapper1);
        this.doLayout();
    	this.hide();
    },
    
    /** private: method[unbind]
     */
    unbind: function() {
        if(this.map && this.map.events) {
            this.map.events.unregister('zoomend', this, this.handleZoomEnd);
        }
        this.zoomStore = null;
        this.zoomSelector = null;
    },
    
    loadmaps: function() {
		var proxy=new Ext.data.HttpProxy({url:'../maps'});
		
		var expander = new Ext.grid.RowExpander({
            tpl: new Ext.Template("{abstract}<br><br>")
        });

        var openMap = function() {
            var record = this.grid.selModel.getSelected();
			if (record) {
				var mapid = record.get("id");
				// open een nieuw browser-window met daarin de composer
				var url = window.location.href.split('#')[0];
				var nieuwe_url = url + "#maps/" + mapid;	
				window.open(nieuwe_url, '_self');
                location.reload(true)
			}
        };

		var reader = new Ext.data.JsonReader({
		   root: "maps",                
		   id: "id"
	   		}, [
					{name: 'id'},
					{name: 'title'},
					{name: 'abstract'},
					{name: 'modified', type: 'date'} 
	   			]);

		var store = new Ext.data.Store({
			  proxy:proxy,
			  reader:reader
		   });

		store.load();
	
		// create the grid
		this.grid = new Ext.grid.GridPanel({
			store: store,
            plugins: expander,
			columns: [
				expander,
				{header: "Nr", width: 40, dataIndex: 'id', sortable: true},
				{header: "Titel", width: 300, dataIndex: 'title', sortable: true}
			],
			//width:376,
			height: 357,
			//autoScroll: true,
            listeners: {
                rowdblclick: openMap,
                scope: this
            }
		});

        var bbarItems = [
        "->",
        new Ext.Button({
            text: "Open thema-kaart",
			icon: "../theme/app/img/silk/map_edit.png",
			handler: openMap,
			scope: this
        }),
        new Ext.Button({
            text: this.doneText,
            handler: function() {
                this.capGrid.close();
            },
            scope: this
        })
        ];
		
		this.capGrid = new Ext.Window({
            title: "Opgeslagen kaarten",
            closeAction: "close",
            //height: 400,
            width: 390,
            modal: true,            
            resizable: false, 
            items: this.grid,
            bbar: bbarItems
        });
        this.capGrid.show();
    }
});

/** api: xtype = gxp_adminoverlay */
Ext.reg('gxp_adminoverlay', gxp.AdminOverlay);

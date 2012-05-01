/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/Tool.js
 * @requires widgets/NewSourceWindow.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = ZoekCsw
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: ZoekCsw(config)
 *
 *    Plugin for removing a selected layer from the map.
 *    TODO Make this plural - selected layers
 */
gxp.plugins.ZoekCsw = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_zoekcsw */
    ptype: "gxp_zoekcsw",
    
    /** api: config[addActionMenuText]
     *  ``String``
     *  Text for add menu item (i18n).
     */
    addActionMenuText: "Kaartlagen toevoegen",

    /** api: config[addActionTip]
     *  ``String``
     *  Text for add action tooltip (i18n).
     */
    addActionTip: "Voeg kaartlagen toe",
       
    /** api: config[doneText]
     *  ``String``
     *  Text for Done button (i18n).
     */
    doneText: "Sluiten",
    
    /** api: config[search]
     *  ``Object | Boolean``
     *  If provided, a :class:`gxp.CatalogueSearchPanel` will be added as a
     *  menu option. This panel will be constructed using the provided config.
     *  By default, no search functionality is provided.
     */
    
    /** private: property[selectedSource]
     *  :class:`gxp.plugins.LayerSource`
     *  The currently selected layer source.
     */
    selectedSource: null,

    /** private: method[constructor]
     */
    constructor: function(config) {
        this.addEvents(
            /** api: event[sourceselected]
             *  Fired when a new source is selected.
             *
             *  Listener arguments:
             *
             *  * tool - :class:`gxp.plugins.ZoekCsw` This tool.
             *  * source - :class:`gxp.plugins.LayerSource` The selected source.
             */
            "cswsourceselected"
            );
        gxp.plugins.ZoekCsw.superclass.constructor.apply(this, arguments);        
    },
    
    /** api: method[addActions]
     */
    addActions: function() {
        var selectedLayer;
        var actions = gxp.plugins.ZoekCsw.superclass.addActions.apply(this, [{
            tooltip : this.addActionTip,
            text: this.addActionText,
            menuText: this.addActionMenuText,
            disabled: true,
            iconCls: "gxp-icon-addlayers",
            handler : this.showCapabilitiesGrid,
            scope: this
        }]);
        
        this.target.on("ready", function() { actions[0].enable(); });
        return actions;
    },
        
    /** api: method[showCapabilitiesGrid]
     * Shows the window with a capabilities grid.
     */
    showCapabilitiesGrid: function() {
        if(!this.capGrid) {
            this.initCapGrid();
        }
        this.capGrid.show();
    },
    
    /**
     * private: method[initCapGrid]
     * Constructs a window with a capabilities grid.
     */
    initCapGrid: function() {
		target = this.target;
		cswhost = this.initialConfig.search.selectedSource;
		
        function search (searchstring) {
            //this.cswhost = "/geonetwork/srv/nl/csw"; //"http://" + window.location.host +            
            //this.cswhost = "http://geo.zaanstad.nl/geonetwork/srv/nl/csw";
            this.use_proxy = true;
            this.defaultschema = "http://www.isotc211.org/2005/gmd";
            this.schema = "http://www.opengis.net/cat/csw/2.0.2";
            this.getrecords_xsl = loadDocument("../div/xsl/getrecords.xsl");
            this.getrecordbyid_xsl = loadDocument("../div/xsl/getrecordbyid.xsl");
            this.defaults_xml = loadDocument("../div/xml/defaults.xml");
            this.defaultschema = this.defaults_xml.selectSingleNode("/defaults/outputschema/text()").nodeValue;
            var outputDiv = document.getElementById("csw-output");
            outputDiv.style.display = "block";
            document.getElementById("csw-details").style.display = "none";
            this.query = searchstring;
            outputDiv.innerHTML = "Zoeken naar '" + searchstring + "' in de metadata catalogus...";
            getRecords(1);
            generateAddButtons();
            generateInfoButtons();
        };
        
        var generateAddButtons = function() {
            var items = Ext.DomQuery.select('div[class=btn_add]');   
            for (var i = 0; i < items.length; i++) {
                var add_id = items[i].id.toString();
                var add_record = items[i].innerHTML.toString();
                items[i].innerHTML = "";
                new Ext.Button({
                    id: add_id,
                    renderTo: add_id,
                    text: 'Voeg laag toe',
                    iconCls:'icon-addlayers',
                    handler : getRecordvalueById.createDelegate(this, [add_record], ["string"] ),
                    scope: this
                });
            };
        };

        var generateInfoButtons = function() {
            var items = Ext.DomQuery.select('div[class=btn_info]');  
            for (var j = 0; j < items.length; j++) { 
                var recordId = new String();
                recordId = items[j].id.toString();
                new Ext.Button({
                    id: recordId,
                    renderTo: recordId,
                    iconCls:'icon-getfeatureinfo',
                    handler : getRecordById.createDelegate(this, [recordId] ),
                    scope: this
                });
            };
        };
        
        function loadDocument(uri) {
            var xml = Sarissa.getDomDocument();
            var xmlhttp = new XMLHttpRequest();
            xml.async = false;
            xmlhttp.open("GET", uri, false);
            xmlhttp.send('');
            xml = xmlhttp.responseXML;
            return xml;
        };
        
        function handleCSWResponse (request, xml) { 
            var stylesheet = "../div/xsl/prettyxml.xsl";
            var displaymode = "html";
            if (request == "getrecords" & 
                displaymode != "xml") {
                stylesheet = "../div/xsl/csw-results.xsl";
                var outputDiv = document.getElementById("csw-output");
                document.getElementById("csw-details").style.display = "none";
            } else if (request == "getrecordbyid" & 
                displaymode != "xml") {
                stylesheet = "../div/xsl/csw-metadata.xsl";
                var outputDiv = document.getElementById("csw-details");
                document.getElementById("csw-output").style.display = "none";
            }
      
            xslt = loadDocument(stylesheet);
            var processor = new XSLTProcessor();
            processor.importStylesheet(xslt);

            var XmlDom = processor.transformToDocument(xml)
            var output = GetXmlContent(XmlDom);
     
            outputDiv.innerHTML = output; 
            //alert (output);
            outputDiv.style.display = "block";
        };

        function getRecords (start) {
            if (typeof start == "undefined") {
                start = 1;
            }
            var queryable = "anytext";
     
            /*because geonetwork doen not follow the specs*/
            if(this.cswhost.indexOf('geonetwork') !=-1 & queryable == "anytext")
                queryable = "any";
     
            var operator = "contains";
            var sortby = "Title";
            var query = this.query.trim();
            //var array = this.query.split(" ");
            if (operator == "contains" & query != "") {
                query = "%" + query + "%";
            }
                 
            setXpathValue(this.defaults_xml, "/defaults/outputschema", this.schema + '');
            setXpathValue(this.defaults_xml, "/defaults/propertyname", queryable + '');
            setXpathValue(this.defaults_xml, "/defaults/literal", query + '');
            setXpathValue(this.defaults_xml, "/defaults/startposition", start + '');
            setXpathValue(this.defaults_xml, "/defaults/sortby", sortby + '');

            var processor = new XSLTProcessor();
            processor.importStylesheet(this.getrecords_xsl);

            var request_xml = processor.transformToDocument(this.defaults_xml);
            //alert(new XMLSerializer().serializeToString(request_xml));
            var request = GetXmlContent(request_xml);

            csw_response = sendCSWRequest(request);
            //alert(new XMLSerializer().serializeToString(csw_response));

            return handleCSWResponse("getrecords", csw_response);
            //return handleCSWResponse("getrecords", results_xml);
        };

        function getRecordById (id) {
            setXpathValue(this.defaults_xml, "/defaults/outputschema", this.defaultschema + '');
            setXpathValue(this.defaults_xml, "/defaults/id", id + '');

            var processor = new XSLTProcessor();
            processor.importStylesheet(this.getrecordbyid_xsl);

            var request_xml = processor.transformToDocument(this.defaults_xml);
            //var request = new XMLSerializer().serializeToString(request_xml);
            var request = GetXmlContent(request_xml);

            csw_response = sendCSWRequest(request);
            //alert(new XMLSerializer().serializeToString(csw_response));
              
            return handleCSWResponse("getrecordbyid", csw_response);
        };
        
        var getRecordvalueById = function(id,record) {
            // gmd:linkage/gmd:URL en gmd:name/gco:CharacterString en gmd:protocol
            setXpathValue(this.defaults_xml, "/defaults/outputschema", this.defaultschema + '');
            setXpathValue(this.defaults_xml, "/defaults/id", id + '');
            
            var processor = new XSLTProcessor();
            processor.importStylesheet(this.getrecordbyid_xsl);

            var request_xml = processor.transformToDocument(this.defaults_xml);
            //var request = new XMLSerializer().serializeToString(request_xml);
            var request = GetXmlContent(request_xml);
            var gmd = "http://www.isotc211.org/2005/gmd";
            var gco = "http://www.isotc211.org/2005/gco";

            csw_response = sendCSWRequest(request);
            
            var transfer = getElementsByTag(csw_response, gmd, "MD_DigitalTransferOptions");
            var server = getElementsByTag(transfer[0], gmd,"CI_OnlineResource");

            var url = textValue(getElementsByTag(server[0], gmd, "URL")[0]);
            var protocol = textValue(getElementsByTag(getElementsByTag(server[0], gmd, "protocol")[0], gco, "CharacterString")[0]);
            var layer = textValue(getElementsByTag(getElementsByTag(server[0], gmd, "name")[0], gco, "CharacterString")[0]);
            
            if (url.match("geowebcache") != null) {
            	var key = "tiles";
            };
            
            if (url.match("geo.zaanstad.nl/geoserver") != null) {
            	var key = "publiek";
            };
            
            if (url.match("map16z/geoserver") != null) {
            	var key = "intranet";
            };
            
			var source = this.target.layerSources[key];
			        
			if (source.lazy) {
				source.store.load({callback: (function() {
					insertLayer(layer, source);
				}).createDelegate(this)});
			} else {
				insertLayer(layer, source);
			}
        };
        
        function insertLayer(name, source) {
        	var layerStore = this.target.mapPanel.layers;
        	var record = source.createLayerRecord({
                name: name,
                source: source.id
                });
                
            //layerStore.add([record]);            
            // orden de layerStore zodanig dat de pointerlagen "Adres" en "Info" bovenaan komen te staan             
            var aantal_pointerlagen = 0;
            for (var i = 0, len = this.app.mapPanel.map.layers.length; i < len; i++){
            	if (this.app.mapPanel.map.layers[i].name == "Adres") {
            		aantal_pointerlagen = aantal_pointerlagen + 1;	
            	};
            	if (this.app.mapPanel.map.layers[i].name == "Info") {
            		aantal_pointerlagen = aantal_pointerlagen + 1;             		
            	};  	
            };
            
           layerStore.insert(layerStore.data.items.length - aantal_pointerlagen, [record]); //hierdoor komen lagen altijd onder de "Adres" en "Info" pointerlagen
        };
        
        function textValue(obj) {
           if (obj.innerText) {
             return obj.innerText;
            } else if (obj.text) {
             return obj.text;
            } else {
             return obj.textContent;
            }
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
        
		function GetXmlContent (xmlDoc) {
            //var xmlDoc = ParseHTTPResponse (httpRequest);   // defined in ajax.js
            if (!xmlDoc)
                return;
            if (window.XMLSerializer) { // all browsers, except IE before version 9
                var serializer = new XMLSerializer();
            	// the serializeToString method raises an exception in IE9
                try {
                    var str = serializer.serializeToString (xmlDoc.documentElement);
                    //alert (str);
                    return str;
                }
                catch (e) {
                }
            }
            if ('xml' in xmlDoc) {  // Internet Explorer
                //alert (xmlDoc.xml);
                return xmlDoc.xml;
            }
            //alert("Cannot display the contents of the XML document as a string.");
        };

        function sendCSWRequest (request) {
        	var xml;
            //var xml = Sarissa.getDomDocument();
            //xml.async = false; 

            var requestxml = encodeURIComponent(request);
            var OLrequest = OpenLayers.Request.POST({
                 url : this.cswhost,
                 async: false,
                 data : request,
                 headers: {
                     "Content-Type": "application/xml"
                 },
                 success : function(response) {
                     //alert(response.responseText);
                     xml = response.responseXML;
                 },
                 failure : function(response) {
                	 //xml = response.responseXML;
                 }
             });

             return xml;
        };

        function setXpathValue (_a,_b,_c) {
            var _e=_a.selectSingleNode(_b);
            if(_e){
                if(_e.firstChild){
                    _e.firstChild.nodeValue=_c;
                }else{
                    dom=Sarissa.getDomDocument();
                    v=dom.createTextNode(_c);
                    _e.appendChild(v);
                }
                return true;
            }else{
                return false;
            }
        };

        var items = {
            xtype: "container",
            region: "center",
            style: {
                padding: '10px'
            },
            autoScroll: true,
            html: "<div id='csw-output'></div><div id='csw-details'></div>",
            scope: this
        };
        
        var topToolbar = new Ext.Toolbar({  
            defaults:{  
                //iconAlign: 'top'
            },  
            items: [  
            {
                xtype: 'spacer',
                width: 10
            },
            {
                id: 'searchval',
                xtype: 'textfield',
                emptyText: 'Vul een zoekterm in',
                selectOnFocus: true,
                width: 350,
                listeners:{  
                    scope: this,  
                    specialkey: function(f,e){  
                        if(e.getKey()==e.ENTER){  
                            search(Ext.getDom('searchval').value);  
                        }
                    }
                }
            },
            {
                xtype: 'spacer',
                width: 10
            },
            {
                xtype: 'button',
                iconCls:'gxp-icon-find',
                text: 'Zoeken',
                handler: function() {
                    search(Ext.getDom('searchval').value);
                },
                scope: this
            },
            '->',  
            {
                text:'Terug',
                id: 'btnTerug',
                iconCls:'gxp-icon-zoom-previous',
                handler: function() {
                    this.initButtons();
                },
                scope: this,
                hidden: true
            }
            ]
        });  
        
        var bbarItems = [
        "->",
        new Ext.Button({
            text: this.doneText,
            handler: function() {
                this.capGrid.hide();
            },
            scope: this
        })
        ];

        //TODO use addOutput here instead of just applying outputConfig
        this.capGrid = new Ext.Window(Ext.apply({
            title: this.addActionMenuText,
            closeAction: "hide",
            layout: "border",
            maximizable: true,  
            height: 600,
            width: 550,
            modal: true,
            items: items,
            tbar: topToolbar,
            bbar: bbarItems
        }, this.initialConfig.outputConfig)); 
    }
});

Ext.preg(gxp.plugins.ZoekCsw.prototype.ptype, gxp.plugins.ZoekCsw);

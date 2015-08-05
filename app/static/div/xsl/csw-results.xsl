<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" 
 xmlns:dc="http://purl.org/dc/elements/1.1/"
 xmlns:dct="http://purl.org/dc/terms/">
<!--xsl:output method="html" encoding="ISO-8859-1"/-->

<xsl:template match="/results/*[local-name()='GetRecordsResponse']">
  <xsl:apply-templates select="./*[local-name()='SearchResults']"/>
</xsl:template>

<xsl:template match="*[local-name()='SearchResults']">

<xsl:variable name="start">
    <xsl:value-of select="number(@nextRecord) - 30"/>
</xsl:variable>


<div>
    <xsl:attribute name="start">
    	<xsl:value-of select="$start"/>
    </xsl:attribute>
    <xsl:for-each select="./*[local-name()='SummaryRecord']|./*[local-name()='BriefRecord']|./*[local-name()='Record']">
    <div class="cswresults">
      <div class="meta_title">
      <xsl:choose>
        <xsl:when test="./dc:title">
    	  <xsl:apply-templates select="./dc:title"/>
        </xsl:when>
        <xsl:otherwise>
    	  <xsl:text> ...</xsl:text>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="./dc:URI"/>
      <xsl:apply-templates select="./dc:identifier"/>
      </div>
      <xsl:variable name="value" select="./dc:URI[@name='thumbnail']" />
        <xsl:choose>
          <xsl:when test="starts-with($value,'http://')">
            <img class="align-left thumbnail" caption="thumbnail">
            <xsl:attribute name="src">
              <xsl:value-of select="./dc:URI[@name='thumbnail']"/>
            </xsl:attribute>
            </img>
          </xsl:when>
          <xsl:when test="starts-with($value,'resources.get?')">
            <img class="align-left thumbnail" caption="thumbnail">
            <xsl:attribute name="src">
              <xsl:text>http://geo.zaanstad.nl/geonetwork/srv/nl/</xsl:text>
              <xsl:value-of select="./dc:URI[@name='thumbnail']"/>
            </xsl:attribute>
            </img>
          </xsl:when>
        </xsl:choose>
	  <p>
      <xsl:apply-templates select="./dct:abstract"/>
      <br/>
      <xsl:apply-templates select="./dc:source"/>
      <strong><xsl:text>Sleutelwoorden: </xsl:text></strong>
      <small><xsl:for-each select="./dc:subject">
        <xsl:if test=".!=''">
            <xsl:if test="position() &gt; 1">, </xsl:if>
            <i><xsl:value-of select="."/></i>
        </xsl:if>
      </xsl:for-each>
      </small>
	  </p>
	  </div>
  </xsl:for-each> 

  <!-- because ESRI GPT returns always numberOfRecordsMatched = 0 -->
  <xsl:if test="number(@numberOfRecordsReturned) > 0 and ($start > 1 or number(@nextRecord) > 0)">
      <xsl:if test="$start > 1">
        <div class="btn_previousrecords">
        <xsl:attribute name="id">
          <xsl:value-of select="number($start)-number(@numberOfRecordsReturned)"/>
          </xsl:attribute>
          <xsl:text> </xsl:text>
        </div>
      </xsl:if>
      <xsl:if test="number(@numberOfRecordsMatched) > number(@nextRecord)">
        <div class="btn_nextrecords">
          <xsl:attribute name="id">
          <xsl:value-of select="@nextRecord"/>
          </xsl:attribute>
          <xsl:text> </xsl:text>
        </div>
      </xsl:if>
  </xsl:if>
  <div class="tb_listtext">
      <xsl:attribute name="id">Getoonde kaartlagen: <xsl:value-of select="@numberOfRecordsReturned"/> (van <xsl:value-of select="@numberOfRecordsMatched"/>)</xsl:attribute>
      <xsl:text> </xsl:text>
    </div>
  </div>
</xsl:template>

<xsl:template match="dc:title">
  <xsl:choose>
    <xsl:when test=".!=''">
      <xsl:value-of select="."/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:text> ...</xsl:text>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="dct:abstract">
    <strong><xsl:text>Samenvatting: </xsl:text></strong>
    <xsl:value-of select="substring(.,1,220)"/>
    <xsl:text>...</xsl:text>
    <br/>
</xsl:template>

<xsl:template match="dc:source">
  <strong><xsl:text>Bron: </xsl:text></strong>
  <xsl:choose>
    <xsl:when test=".!=''">
		<xsl:value-of select="substring(.,1,77)"/>
		<xsl:text>...</xsl:text>
		<br/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:text>Geen gegevens beschikbaar</xsl:text>
      <br/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="dc:identifier">
	<div class="btn_info">
	<xsl:attribute name="id">
		<xsl:value-of select="."/>
	</xsl:attribute>
	<xsl:text> </xsl:text>
	</div>
</xsl:template>  

<xsl:template match="dc:URI">
    <xsl:if test="contains(@protocol, 'http-get-map') or contains(@protocol, 'ogc.wms_xml') or contains(@protocol, 'OGC:WMS')">
	  <div class="btn_add">
	  <xsl:attribute name="id">
		<xsl:text>btn-add-</xsl:text>
		<xsl:value-of select="../dc:identifier"/>
	 </xsl:attribute>
	 <xsl:attribute name="title">
		<xsl:value-of select="."/>
	  </xsl:attribute>
	  <xsl:value-of select="../dc:identifier"/>
	 </div>
    </xsl:if>
</xsl:template>
</xsl:stylesheet>
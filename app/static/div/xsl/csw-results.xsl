<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" 
 xmlns:dc="http://purl.org/dc/elements/1.1/"
 xmlns:dct="http://purl.org/dc/terms/">
<!--xsl:output method="html" encoding="ISO-8859-1"/-->

<xsl:variable name="pageUrl">
  <xsl:text>javascript:(this.getRecords</xsl:text>
  <xsl:text>('</xsl:text>
</xsl:variable>

<xsl:template match="/results/*[local-name()='GetRecordsResponse']">
  <xsl:apply-templates select="./*[local-name()='SearchResults']"/>
</xsl:template>

<xsl:template match="*[local-name()='SearchResults']">

<xsl:variable name="start">
    <xsl:value-of select="../../request/@start"/>
</xsl:variable>

<!-- because GeoNetwork does not return nextRecord we have to do some calculation -->
<xsl:variable name="next">
  <xsl:choose>
    <xsl:when test="@nextRecord">
      <xsl:value-of select="@nextRecord"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:choose>
        <xsl:when test="number(@numberOfRecordsMatched) >= (number($start) + number(@numberOfRecordsReturned))">
          <xsl:value-of select="number($start) + number(@numberOfRecordsReturned)"/>
        </xsl:when>
    	<xsl:otherwise>
    	  <xsl:value-of select="0"/>
    	</xsl:otherwise>
      </xsl:choose>
    </xsl:otherwise>
  </xsl:choose>
</xsl:variable>

<div>
<!--xsl:if test="number(@numberOfRecordsMatched) > number(@numberOfRecordsReturned)"-->
<!-- because ESRI GPT returns always numberOfRecordsMatched = 0 -->
<xsl:if test="number(@numberOfRecordsReturned) > 0 and ($start > 1 or number($next) > 0)">
  <h3 style="float:right;top: -2.5em;">
    <xsl:if test="$start > 1">
      <a>
        <xsl:attribute name="href">
	    <xsl:value-of select="$pageUrl"/>
    	  <xsl:value-of select="number($start)-number(../../request/@maxrecords)"/>
          <xsl:text>'))</xsl:text> 
	    </xsl:attribute>
        <xsl:text>&lt;&lt; previous</xsl:text>
      </a>
    </xsl:if>
    <xsl:text>  || </xsl:text> 
    <xsl:if test="number($next) > 0">
      <a>
        <xsl:attribute name="href">
     	  <xsl:value-of select="$pageUrl"/>
	  <xsl:value-of select="$next"/>
          <xsl:text>'))</xsl:text> 
	</xsl:attribute>
        <xsl:text>next &gt;&gt;</xsl:text>
      </a>
    </xsl:if>
  </h3>
</xsl:if>

<xsl:if test="number(@numberOfRecordsReturned) = 0 and ($start > 1 or number($next) = 0)">
  <h3>Niets gevonden</h3>
</xsl:if>

<!--<h3>Gevonden records: <xsl:value-of select="@numberOfRecordsReturned"/>
(van <xsl:value-of select="@numberOfRecordsMatched"/>)
</h3>
-->    
    <xsl:attribute name="start">
    	<xsl:value-of select="$start"/>
    </xsl:attribute>
    <xsl:for-each select="./*[local-name()='SummaryRecord']|./*[local-name()='BriefRecord']|./*[local-name()='Record']">
    <div class="cswresults">
      <h3>
      <xsl:choose>
        <xsl:when test="./dc:title">
    	  <xsl:apply-templates select="./dc:title"/>
        </xsl:when>
        <xsl:otherwise>
    	  <xsl:text> ...</xsl:text>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="./dc:identifier"/>
      </h3>
      <p>
      <xsl:apply-templates select="./dct:abstract"/>
      <xsl:apply-templates select="./dc:source"/>
      <strong><xsl:text>Sleutelwoorden: </xsl:text></strong>
      <xsl:for-each select="./dc:subject">
        <xsl:if test=".!=''">
            <xsl:if test="position() &gt; 1">, </xsl:if>
            <i><xsl:value-of select="."/></i>
        </xsl:if>
      </xsl:for-each>
      <xsl:apply-templates select="./dc:URI"/>
	  </p>
	  </div>
  </xsl:for-each> 
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
    <xsl:value-of select="substring(.,1,250)"/>
    <xsl:text>...</xsl:text>
    <br/>
</xsl:template>

<xsl:template match="dc:source">
  <strong><xsl:text>Bron: </xsl:text></strong>
  <xsl:choose>
    <xsl:when test=".!=''">
		<xsl:value-of select="substring(.,1,250)"/>
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
  <xsl:choose>
    <xsl:when test="contains(@protocol, 'http-get-map')">
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
	 <br/>
    </xsl:when>
  </xsl:choose>
</xsl:template>
</xsl:stylesheet>
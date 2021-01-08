var requiredFile = location.href.indexOf("opencourses.univ-cotedazur.fr") == -1 ? "chart_generator" : "_chart_generator";	// this kind of trick may be used for handling simultaneously a live and a development version
var scriptLocation = document.currentScript.src.substring(0, document.currentScript.src.lastIndexOf("/") + 1);

require.config({
    enforceDefine: false,
    urlArgs: "bust=" + (new Date()).getTime(),
    paths: {
        "i18njs": "https://cdn.jsdelivr.net/npm/i18njs@2.1.7/dist/i18njs.min",
        "chartGenerator": scriptLocation + requiredFile,
        "locales": scriptLocation + "locales"
    }
});

let customStyles =		'	#page-content * { font-size:13px; }';
customStyles += 		'	#page-content label { margin-bottom:0; }';
customStyles += 		'	#page-content p, #page-content div.qn-question { margin-top:1px; margin-bottom:1px; }';
customStyles += 		'	#page-content div.qn-content { margin-left:35px; }';
customStyles += 		'	#page-content section#region-main { padding:10px 1px; }';
customStyles += 		'	div.chartBoxes { margin-bottom:-20px; }';
customStyles += 		'	input, textarea, select { border-radius:2px; border-width:thin; }';

function getItemToExportToPDF() {
	return $("#page-content").get()[0];
}

function beforePdfExport() {
	$('#timer_overlay').show();
	$("div.globalConf").hide();
}

function afterPdfExport() {
	$("div.globalConf").show();
	$('#timer_overlay').hide();
}
	
require(["i18njs", "chartGenerator", "locales"], function(i18n, cg) {
	i18n.setLang('fr');	// default is en
	if (navigator.userAgent.indexOf("MSIE ") > -1 || navigator.userAgent.indexOf("Trident/") > -1) {
		alert(i18n.get('err.ie_incompatibility'));
		history.back();
	}
	else if (navigator.userAgent.indexOf(" Chrome/87.") > -1) {
		alert(i18n.get('err.chrome87_incompatibility'));
	}
	$("div.notice").hide();
	cg.startChartEmbedding();
});
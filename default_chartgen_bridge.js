var requiredFile = "chart_generator";
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
	var language = new URLSearchParams(window.location.search).get("lang");
	if (language != null)
		i18n.setLang('fr');	// default is en
	if (navigator.userAgent.indexOf("MSIE ") > -1 || navigator.userAgent.indexOf("Trident/") > -1) {
		alert(i18n.get('err.ie_incompatibility'));
		history.back();
	}
	else if (navigator.userAgent.indexOf(" Chrome/87.") > -1) {
		alert(i18n.get('err.chrome87_incompatibility'));
	}
	cg.startChartEmbedding();
});
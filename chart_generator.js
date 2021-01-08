let currentScriptLocation = document.currentScript.src.substring(0, document.currentScript.src.lastIndexOf("/") + 1);

require.config({
    // enforceDefine: false,
    paths: {
        "i18njs": "https://cdn.jsdelivr.net/npm/i18njs@2.1.7/dist/i18njs.min",
       	"jquery": "https://cdn.jsdelivr.net/npm/jquery@3.2.1/dist/jquery.min",
    	"chartJS": 'https://cdn.jsdelivr.net/npm/chart.js@2.9.4/dist/Chart.min',
        "is-any-array": "https://cdn.jsdelivr.net/npm/is-any-array@0.1.0/lib/index.min",
        'ml-matrix': "https://cdn.jsdelivr.net/npm/ml-matrix@6.5.3/matrix.umd",
        "lm": currentScriptLocation + "browserify_levenbergMarquardt",
        "html2pdf": currentScriptLocation + "html2pdf.bundle"
    }
});

define("chartGenerator", ["jquery", "chartJS", "lm", "i18njs"], function($, Chart, lm, i18n) {
	var self = {};

	///////////////////////////////////
	var defaultValues = {};
	defaultValues["inverse"] = {x: [-8, -4, -2, -1, 0, 1, 2, 4, 8], y: [-.25, -.5, -1, -2, "", 2, 1, .5, .25]};
	defaultValues["linear"] = {x: [-5, -1, 0, 1, 2, 4], y: [-9, -1, 1, 3, 5, 9]};
	defaultValues["saturation2"] = {x: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19], y: [1,50,90,130,150,180,200,210,200,220,230,235,234,237,235,238,232,233,236]};
	defaultValues["saturation"] = {x: [1, 2, 5, 20, 50, 75, 90, 150], y: [2.07, 2.32, 2.65, 3.51, 5.05, 5.51, 5.66, 5.87]};
	defaultValues["exp_growth"] = {x: [60, 70, 79, 80, 85, 90, 95, 100], y: [0, 0, 0.01, 0.02, 0.08, 0.25, 0.68, 1.75]};
	defaultValues["reciprocal"] = {x: [.1, .2, .3, .4, .5, .6, .8, 1, 2, 3, 4], y: [11.4, 6.2, 4.4, 3.5, 2.9, 2.5, 2.1, 1.9, 1.6, 1.6, 1.6]};
	defaultValues["logistic"] = {x: [120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 420], y: [0, 0, 0.4, 0.6, 1.1, 1.8, 2.2, 3.3, 4.3, 4.9, 5.3, 5.6, 5.7, 5.9, 5.9, 5.9]};
	defaultValues["parabolic"] = {x: [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100], y: [0.11, 0.73, 1.21, 1.55, 1.75, 1.82, 1.75, 1.55, 1.21, 0.73, 0.11]};
	defaultValues["lapicque"] = {x: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1, 2, 3, 4], y: [11.4, 6.2, 4.4, 3.5, 2.9, 2.5, 2.1, 1.9, 1.6, 1.6, 1.6]};
	defaultValues["exp_decay"] = {x: [0.5, 1, 1.5, 2], y: [3.72, 1.24, 0.45, 0]};
	//defaultValues["asym_parabolic"] = {x: [0, 0.5, 1, 1.5, 2], y: [0, 1.86, 1.24, 0.675, 0]};
	///////////////////////////////////

	const chartColors = {"rgb(204, 255, 204)":"rgb(102, 170, 102)", "rgb(204, 204, 255)":"rgb(102, 102, 170)", "rgb(255, 204, 204)":"rgb(170, 102, 102)", "rgb(204, 238, 238)":"rgb(102, 153, 153)", "rgb(238, 238, 204)":"rgb(153, 153, 102)"};

	var supportedFuncs = {
		"inverse": { "formula": "a / x", "algorithm": function([a]) {
			  return (t) => a/t;
			}
		},
		"linear": { "formula": "ax + b", "algorithm": function([a, b]) {
			  return (t) => a*t + b;
			}
		},
		"saturation": { "formula": "ax / (b+x)", "algorithm": function([a, b]) {
			  return (t) => (a*t) / (b+parseFloat(t));
			}
		},
		"exp_growth": { "formula": "a.exp(bx)", "algorithm": function([a, b]) {
			  return (t) => a*Math.exp(b*t);
			}
		},
		"exp_decay": { "formula": "a.exp(-bx)", "algorithm": function([a, b]) {
			  return (t) => a*Math.exp(-b*t);
			}
		},
		"hyperbolic": { "formula": "a + (b/x)", "algorithm": function([a, b]) {
			  return (t) => a + (b/parseFloat(t));
			}
		},
		"lapicque": { "formula": "a*[1 + (b/x)]", "algorithm": function([a, b]) {
			  return (t) => a * (1 + (b/parseFloat(t)));
			}
		},
		"logistic": { "formula": "a/{1 + exp[b(x-c)]}", "algorithm": function([a, b, c]) {
			  return (t) => a / (1 + Math.exp(b*(parseFloat(t) - c)));
			}
		},
		"parabolic": { "formula": "ax² + bx + c", "algorithm": function([a, b, c]) {
			  return (t) =>(a*t*t) + (b*t) + c;
			}
		}/*,
		"asym_parabolic": { "formula": "ax² + bx + c + d.exp(f.x)", "algorithm": function([a, b, c, d, f]) {
			  return (t) =>(a*t*t) + (b*t) + c + d*Math.exp(f*t);
			}
		}*/
	};

	validateInput = function(txtA) {
		$(txtA).val($(txtA).val().replace(/ /g, "").replace(/,/g, "\n"));
	};

	trimInput = function(txtA) {
		$(txtA).val($(txtA).val().replace(/ /g, "").replace(/\n$/g, "").replace(/^\n/g, ""));
	};

	draw = function(globalConfDiv) {
		$(globalConfDiv.siblings("div.chartBoxes")[0]).find(".fittingResults").html("");
		var datasets = [], yAxes = [];

		$(globalConfDiv.siblings("div.chartBoxes")[0]).find("div.chartConfBox").each(function() {
			// create a dataset for entered points
			var xVals = $(this).find(".x").val().split("\n"), yVals = $(this).find(".y").val().split("\n");

			// skip points where y value is not numeric
			for (let i=0; i<yVals.length; i++)
				if (yVals[i].trim() == "" || isNaN(yVals[i])) {
					xVals.splice(i, 1);
					yVals.splice(i, 1);
				}

			var enteredData = [], selectedFunc = $(this).find("select.fittingFunctions").val();
			for (var i=0; i<Math.min(xVals.length, yVals.length); i++) 
				enteredData.push({x:xVals[i], y:yVals[i]});

			var yIndex = 1 + $(this).find("select.yLabel").prop('selectedIndex');
			if (!yAxes.includes(yIndex))
				yAxes.push(yIndex);

			datasets.push({
				label: $(this).find(".chartLabel").val(),
				yAxisID: "y" + yIndex,
				data: enteredData,
				borderColor: chartColors[$(this).css('background-color')],
				backgroundColor: 'rgba(0, 0, 0, 0)',
				showLine: "interpolate" == selectedFunc ? true : false,
				fill: false,
				cubicInterpolationMode: "monotone"/*,
				lineTension: 0*/
			});

			// create a dataset for the fitted line
			if (selectedFunc != "" && "interpolate" != selectedFunc ) {
				var correctedData = [], fittedParams;
				const options = {
					initialValues: [parseFloat($(this).find(".initA").val()), parseFloat($(this).find(".initB").val()), parseFloat($(this).find(".initC").val()), parseFloat($(this).find(".initD").val()), parseFloat($(this).find(".initF").val())],
					damping: parseFloat($(this).find(".damping").val()),
					gradientDifference: parseFloat($(this).find(".gradientDifference").val()),
					maxIterations: parseFloat($(this).find(".maxIterations").val()),
					errorTolerance: parseFloat($(this).find(".errorTolerance").val())
				};

				try {
					fittedParams = levenbergMarquardt({x:xVals, y:yVals}, supportedFuncs[selectedFunc]["algorithm"], options);
				}
				catch (err) {
					console.log(err);
					$(this).find(".fittingResults").html("<b style='color:red;'>" + err + "</b>");
				}

				if (fittedParams == null)
					return;

				var fittingResults = "<b style='color:red;'>Error in fitting</b>";
				if (fittedParams != null && !isNaN(fittedParams.parameterValues[0])) {
					fittingResults = "a=" + (fittedParams.parameterValues[0].toFixed(2) == 0 ? fittedParams.parameterValues[0].toExponential(3) : fittedParams.parameterValues[0].toFixed(2));
					if (supportedFuncs[$(this).find("select.fittingFunctions").val()]["formula"].indexOf('c') != -1)
						fittingResults += " b=" + (fittedParams.parameterValues[1].toFixed(2) == 0 ? fittedParams.parameterValues[1].toExponential(3) : fittedParams.parameterValues[1].toFixed(2));
					if (supportedFuncs[$(this).find("select.fittingFunctions").val()]["formula"].indexOf('c') != -1)
						fittingResults += " c=" + (fittedParams.parameterValues[2].toFixed(2) == 0 ? fittedParams.parameterValues[2].toExponential(3) : fittedParams.parameterValues[2].toFixed(2));
					if (supportedFuncs[$(this).find("select.fittingFunctions").val()]["formula"].indexOf('d') != -1)
						fittingResults += " d=" + (fittedParams.parameterValues[3].toFixed(2) == 0 ? fittedParams.parameterValues[3].toExponential(3) : fittedParams.parameterValues[3].toFixed(2));
					if (supportedFuncs[$(this).find("select.fittingFunctions").val()]["formula"].indexOf('f') != -1)
						fittingResults += " f=" + (fittedParams.parameterValues[4].toFixed(2) == 0 ? fittedParams.parameterValues[4].toExponential(3) : fittedParams.parameterValues[4].toFixed(2));
				}
				$(this).find(".fittingResults").html(fittingResults);

				var fct = supportedFuncs[selectedFunc]["algorithm"]([fittedParams.parameterValues[0], fittedParams.parameterValues[1], fittedParams.parameterValues[2], fittedParams.parameterValues[3], fittedParams.parameterValues[4]]);
				var xVals = $(this).find(".x").val().split("\n"), yVals = $(this).find(".y").val().split("\n");
				for (var i=0; i<Math.min(xVals.length, yVals.length); i++)
					correctedData.push({x:xVals[i], y:fct(xVals[i])});

				datasets.push({
			        data: correctedData,
					yAxisID: "y" + yIndex,
			        pointRadius: 0,
					borderColor: chartColors[$(this).css('background-color')],
					showLine: true,
			        fill: false,
					cubicInterpolationMode: "monotone"
			    });
			}
		});

		for (var i=0; i<yAxes.length; i++) {
			yAxes[i] = {
				id: "y" + yAxes[i],
				display: true,
				position: i == 1 ? 'right' : 'left',
				scaleLabel: {
					display: true,
					labelString: $(globalConfDiv.find("input.yLabel")[yAxes[i] - 1]).val()
				},
			};
		}

		var config = {
			type: 'scatter',
			data: {
				datasets: datasets
			},
			options: {
				aspectRatio: 1.08,
				responsive: true,
				title: {
					display: false
				},
				tooltips: {
					mode: 'index'
				},
				legend: {
				   labels: {
				      filter: function(label) {
				         return label.text != null;
				      }
				   }
				},
				scales: {
					xAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: $(globalConfDiv.find("input.xLabel")).val()
						}
					}],
					yAxes: yAxes
				}
			}
		};

		$($(globalConfDiv.siblings("div.chartBoxes")).find("div.chartContainer canvas")[0]).replaceWith("<canvas style='display:inline-block; width:340px; height:315px; margin:0;'></canvas>");	// make sure we start with an empty canvas to avoid hover bug
		var ctx = $(globalConfDiv.siblings("div.chartBoxes")).find("div.chartContainer canvas")[0].getContext('2d');
		new Chart(ctx, config);

		globalConfDiv.parent().find("div.fittingSelection").show();
		globalConfDiv.parent().find("div.fittingParams").show();
	};

	exportAsPdf = function() {
		if (typeof beforePdfExport == "function")
			beforePdfExport();

		try {
			require(["html2pdf"], function(html2pdf) {
				var element = typeof getItemToExportToPDF == "function" ? getItemToExportToPDF() : $("body").get()[0];
				
	            var opt = {
	                margin: [0.5, 0],
	                filename: 'export.pdf',
	                image: {type: 'jpeg',quality: 0.95},
	                pagebreak: { mode: ["avoid-all", 'css'] },
	                jsPDF: {
	                    unit: 'in',
	                    format: 'a4',
	                    orientation: 'portrait'
	                }
	            };
			  	html2pdf().set(opt).from(element).save().then(function() { if (typeof afterPdfExport == "function") afterPdfExport(); });
			});
		}
		catch (err) {
			console.log(err);
			if (typeof afterPdfExport == "function")
				afterPdfExport();
		}
	};

	setChartCount = function(chartCountSelector) {
		$($(chartCountSelector).parent().siblings("div.chartBoxes").find("div.chartContainer")[0]).html("<canvas style='display:inline-block; width:340px; height:315px; margin:0;'></canvas>");

		let interfaceHTML = "";
		for (var i=0; i<parseInt($(chartCountSelector).val()); i++) {
			interfaceHTML += '<div class="chartConfBox" style="background-color:' + Object.keys(chartColors)[i] + '; border-radius:10px; padding:8px; display:inline-block;">';
			interfaceHTML += '	<div style="vertical-align:top; height:35px;">';
			interfaceHTML += '		<div class="xLabel" style="width:80px; font-size:12px; font-weight:bold; overflow:hidden; line-height:15px; height:30px; display:inline-block;"></div>';
			interfaceHTML += '		<div style="vertical-align:top; display:inline-block; margin-left:3px;"><select style="width:150px;" class="yLabel"><option></option><option></option></select></div>'
			interfaceHTML += '  </div>';
			interfaceHTML += '	<div style="vertical-align:top;">';
			interfaceHTML += ' 		<div style="display:inline-block;"><textarea class="x" style="resize:none; width:80px; height:260px;" onfocus="select();" onkeyup="validateInput(this);" onchange="trimInput(this);"></textarea></div>';
			interfaceHTML += ' 		<div style="display:inline-block;"><textarea class="y" style="resize:none; width:80px; height:260px;" onfocus="select();" onkeyup="validateInput(this);" onchange="trimInput(this);"></textarea></div>';
     	    interfaceHTML += ' 		<div style="display:inline-block; vertical-align:top; width:155px;">';
     	    interfaceHTML += '      	<div style="margin:-15px 0 15px 10px; text-align:right;"><b>' + i18n.get("label.chart_name") + '</b>&nbsp;<br><input type="text" style="width:150px;" class="chartLabel"></div>';
			interfaceHTML += '     		<div class="fittingParams" style="display:none;">';
			interfaceHTML += '   	  		<div style="margin-left:10px;"><b>' + i18n.get("label.initial_fit_values") + '</b></div>';
			interfaceHTML += '         		<div style="display:inline-block; margin:1px 0 1px 10px; white-space:nowrap; font-family:Courier New;"><input type="hidden" class="minA"><input type="hidden" class="maxA">a<input type="text" style="font-size:11px; margin-left:2px; width:55px;" class="initA" value="1"></div>';
			interfaceHTML += '         		<div style="display:inline-block; margin:1px 0 1px 10px; white-space:nowrap; font-family:Courier New;"><input type="hidden" class="minB"><input type="hidden" class="maxB">b<input type="text" style="font-size:11px; margin-left:2px; width:55px;" class="initB" value="1"></div>';
			interfaceHTML += '         		<div style="display:inline-block; margin:1px 0 1px 10px; white-space:nowrap; font-family:Courier New;"><input type="hidden" class="minC"><input type="hidden" class="maxC">c<input type="text" style="font-size:11px; margin-left:2px; width:55px;" class="initC" value="1"></div>';
			interfaceHTML += '   		    <div style="margin-left:25px; white-space:nowrap; display:none; font-family:Courier New;"><input type="hidden" class="minD"><input type="hidden" class="maxD">d<input type="text" style="font-size:11px; width:55px;" class="initD" value="1"></div>';
			interfaceHTML += '    		    <div style="margin-left:5px; white-space:nowrap; display:none; font-family:Courier New;"><input type="hidden" class="minF"><input type="hidden" class="maxF">f<input type="text" style="font-size:11px; width:55px;" class="initF" value="1"></div>';
			interfaceHTML += '    		    <div style="margin:5px 10px; white-space:nowrap; display:none;">damping <input type="text" style="width:60px;" class="damping" value="1.5"></div>';
			interfaceHTML += '     		    <div style="margin:5px 10px; white-space:nowrap; display:none;">gradient difference <input type="text" style="width:60px;" class="gradientDifference" value="10e-2"></div>';
			interfaceHTML += '      	   <div style="display:inline-block; margin:5px 10px; white-space:nowrap;">' + i18n.get("label.max_iterations") + ' <input type="text" style="width:60px;" class="maxIterations" value="1000"></div>';
			interfaceHTML += '      	   <div style="margin:5px 10px; white-space:nowrap; display:none;">' + i18n.get("label.error_tolerance") + ' <input type="text" style="width:60px;" class="errorTolerance" value="10e-3"></div>';
			interfaceHTML += '  		</div>';
			interfaceHTML += '  		<div style="margin:5px 0 0 8px; display:none;" class="fittingSelection">';
			interfaceHTML += '   	   		<b>' + i18n.get("label.fitting_model") + ':</b><br>';
			interfaceHTML += '      		<select style="width:150px;" class="fittingFunctions" onchange="draw($(this).parent().parent().parent().parent().parent().siblings(\'div.globalConf\'));">';
			interfaceHTML += '         			<option value="">---</option>';
			interfaceHTML += '      		</select>';
			interfaceHTML += '      		<div style="font-size:12px; display:inline-block; margin-top:10px; width:160px;" class="fittingResults" />';
        	interfaceHTML += '   		</div>';
        	interfaceHTML += '      </div>';
			interfaceHTML += '   </div>';
			interfaceHTML += '</div>';
		}
		$(chartCountSelector).parent().parent().find("div.chartBoxes div.chartConfBox").remove();
		$(chartCountSelector).parent().parent().find("div.chartBoxes").prepend(interfaceHTML);
		$(chartCountSelector).parent().parent().find("input.xLabel").change();
		$(chartCountSelector).parent().parent().find("input.yLabel").change();
		$(chartCountSelector).parent().parent().find("div.fittingParams input").on("change", function() {$(this).parent().parent().parent().find("select.fittingFunctions").val(""); $(this).parent().parent().parent().find("div.fittingResults").html(""); $(this).parent().parent().parent().find("select.fittingFunctions").change();});
		for (var funcName in supportedFuncs)
			$(chartCountSelector).parent().parent().find("select.fittingFunctions").append("<option value='" + funcName + "'>" + i18n.get("fit_funcs." + funcName) + ": " + supportedFuncs[funcName]["formula"] + "</option>");
		$(chartCountSelector).parent().parent().find("select.fittingFunctions").append("<option value='interpolate'>" + i18n.get("fit_funcs.interpolate") + "</option>");

		$(chartCountSelector).parent().parent().find("input").keydown(function (e) {
			if (e.keyCode == 13) {
				e.preventDefault();
				return false;
			}
		});

		var defaultValueType = (new URLSearchParams(window.location.search).get("default"));
		if (defaultValueType != null && defaultValueType != "") {
			$(".x").val(defaultValues[defaultValueType].x);
			$(".x").keyup();
			$(".y").val(defaultValues[defaultValueType].y);
			$(".y").keyup();
		}
	};

	self.startChartEmbedding = function() {
		let styles = 	'<style>';
		//styles += 		'	div.chartBoxes { break-inside:avoid; }';
		styles += 		'	div.chartConfBox { break-inside:avoid; border:1px grey solid; width:350px; height:310px; margin-left:4px; }';
		styles += 		'	div.chartConfBox div, div.chartConfBox, div.chartConfBox * { font-family:Arial; font-size:13px; }';
		styles += 		'	div.chartConfBox select, div.chartConfBox select option { font-size:13px; }';
		styles += 		'	div.chartConfBox textarea, div.chartConfBox input { font-size:12px; }';
		styles += 		'	div.chartContainer { break-inside:avoid; margin-left:8px; background-color:white; border:1px dashed lightgrey; display:inline-block; width:340px; height:315px;}';
		styles += 		'	#timer_overlay { width:100%; height:100%; background-color:#000000; opacity:0.95; position:fixed; top:-22px; left:-22px; margin-top:22px; margin-left:22px; background-repeat:no-repeat; background-position:center 40%; background-image: url("data:image/gif;base64,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"); }';
		if (typeof customStyles == "string")
			styles += customStyles;
		styles += 		'</style>';
		$("head").append(styles);

		$("div.chartEmbeddingZone").each(function() {
			let chartCountSelectorOptions;
			for (var i=1; i<=Object.keys(chartColors).length; i++)
				chartCountSelectorOptions += "<option value=\"" + i + "\">" + i + "</option>";
			let interfaceHTML = "<div data-html2canvas-ignore='true' class='globalConf' style='display:inline-block;'>" + i18n.get("label.number_of_charts") + " <select data-html2canvas-ignore='true' style='width:40px;' class=\"chartCountSelector\" onchange=\"setChartCount($(this));\">" + chartCountSelectorOptions + "</select>";
			interfaceHTML += "<input style='margin-left:40px;' type='button' value='" + i18n.get("label.draw_refresh") + "' onclick='draw($(this).parent());'>";
			interfaceHTML += '<div style="margin:20px 0; white-space:nowrap; vertical-align:top;">' + i18n.get("label.axes_labels") + ':&nbsp;&nbsp;X <input style="width:80px; font-size:12px;" maxlength="30" type="text" class="xLabel" value="X" onchange="$(this).closest(\'div.globalConf\').nextAll(\'div.chartBoxes\').eq(0).find(\'div.xLabel\').html($(this).val());"/>&nbsp;&nbsp;Y1 <input style="width:80px; font-size:12px;" maxlength="30" type="text" class="yLabel" value="Y1"/>&nbsp;&nbsp;Y2 <input style="width:80px; font-size:12px;" maxlength="30" type="text" class="yLabel" value="Y2"/></div></div>';
			interfaceHTML += "<div class='chartBoxes' style='display:block;'><div class='chartContainer'></div></div>";
			$(this).html(interfaceHTML);

			$(this).find("input.yLabel").on("change", function() {
				var yIndex = 0;
				$(this).parent().parent().find("input.yLabel").each(function() {
					var yLabel = $(this).val();
					$(this).closest('div.globalConf').nextAll('div.chartBoxes').eq(0).find("select.yLabel").find("option:eq(" + yIndex + ")").text(yLabel);
					yIndex++;
				});
			});

			$(this).find("input.xLabel, input.yLabel").keydown(function (e) {
				if (e.keyCode == 13) {
					e.preventDefault();
					return false;
				}
			});

			$(this).find("select.chartCountSelector").change();
		});

		var elementToExport = typeof getItemToExportToPDF == "function" ? getItemToExportToPDF() : $("body").get()[0];
		$(elementToExport).append("<div style='width:100%; text-align:center;' class='exportButtonContainer'><input type='button' data-html2canvas-ignore='true' class='btn btn-primary' value='" + i18n.get("label.export_as_pdf") + "' onclick='exportAsPdf();' /></div>");
								
		if ($("div.timer_overlay").length == 0)
			$("body").append('<div id="timer_overlay" data-html2canvas-ignore="true" style="display:none;"></div>');
	};
	
	return self;
});
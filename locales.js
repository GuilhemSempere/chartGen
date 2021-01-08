require(["i18njs"], function(i18n) {
	var en_locales = {
	    'err': {
	        'ie_incompatibility': 'Your web browser is not compatible with chart generator. Please use Firefox, Safari, Chrome, Edge or Opera.',
	        'chrome87_incompatibility': 'Web browsers based on Chromium v87 are not compatible with chart generator. Please revert to a previous version, or switch to Firefox or Safari. Otherwise please contact an administrator.'
	    },
	    'label' : {
			'number_of_charts' : "Number of charts",
			'draw_refresh' : "Draw / refresh",
			'axes_labels' : "Axes' labels",
			'chart_name' : "Chart name",
			'initial_fit_values' : "Initial fit values",
			'max_iterations' : "max iterations",
			'fitting_model' : "Fitting model",
			'error_tolerance' : "Error tolerance",
			'export_as_pdf' : "Export as PDF"
	    },
	    'fit_funcs' : {
	    	'inverse' : "inverse",
	    	'linear' : "linear",
	    	'saturation' : "saturation",
	    	'exp_growth' : "exponential growth",
	    	'exp_decay' : "exponential decay",
	    	'hyperbolic' : "hyperbolic",
	    	'lapicque' : "Lapicque",
	    	'logistic' : "logistic",
	    	'parabolic' : "parabolic",
	    	'asym_parabolic' : "asymmetric parabolic",
	    	'interpolate' : "interpolate (no formula)"
	    }
	};
	i18n.add('en', en_locales);

	var fr_locales = {
	    'err': {
	        'ie_incompatibility': 'Votre navigateur est incompatible avec le générateur de graphes. Veuillez utiliser Firefox, Safari, Chrome, Edge or Opera.',
	        'chrome87_incompatibility': "La version actuelle (v87) de votre navigateur ne permet pas d'utiliser le bouton d'export PDF. Veuillez passer si possible sous Firefox ou Safari. Sinon veuillez contacter le responsable de la session."
	    },
	    'label' : {
			'number_of_charts' : "Nombre de graphes",
			'draw_refresh' : "Tracer / mettre à jour",
			'axes_labels' : "Libellés des axes",
			'chart_name' : "Nom du graphe",
			'initial_fit_values' : "Valeurs initiales fitting",
			'max_iterations' : "Itérations max",
			'fitting_model' : "Modèle de fitting",
			'error_tolerance' : "Seuil tolérance erreur",
			'export_as_pdf' : "Exporter en PDF"
	    },
	    'fit_funcs' : {
	    	'inverse' : "inverse",
	    	'linear' : "linéaire",
	    	'saturation' : "saturation",
	    	'exp_growth' : "croissance exponentielle",
	    	'exp_decay' : "décroissance exponentielle",
	    	'hyperbolic' : "hyperbolique",
	    	'lapicque' : "Lapicque",
	    	'logistic' : "logistique",
	    	'parabolic' : "parabolique",
	    	'asym_parabolic' : "parabolique asymétrique",
	    	'interpolate' : "interpolation (sans formule)"
	    }
	};
	i18n.add('fr', fr_locales);
});
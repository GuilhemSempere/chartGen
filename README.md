# Welcome to chartGen

This browser-oriented Javascript library aims at providing an embeddable interface for easily generating Chart.js-based (https://github.com/chartjs) series graphs. It was initially developped to be embedded into Moodle (https://github.com/moodle/moodle) questionnaires, but with the goal to keep it generic enough so that it may be used independently.


## Features
- Editable legend (labels for series name, X and Y axes)
- Up to 5 series per canvas
- Up to 2 Y axes per canvas
- Levenberg-Marquardt (https://github.com/mljs/levenberg-marquardt) fitting algorithm applicable to 9 predefined functions
- "Interpolate" functionality for non-fittable functions
- PDF export implementation via html2pdf.js (https://github.com/eKoopmans/html2pdf.js)
- Localizable (currently available in english and french)


## Usage
### Required files are:
- Third-party dependencies: browserify_levenbergMarquardt.js and html2pdf.bundle.js
- Internationalisation file: locales.js
- Main implementation file: chart_generator.js
- One of moodle_chartgen_bridge.js (for Moodle integration) or default_chartgen_bridge.js (for custom integration). Note that they will probably need to be adapted to fit into the targeted environment (even with regard to various Moodle versions which have different interface styles). Thus, the bridge file is the one to be invoked from the main interface and was designed to contain pretty much exactly what one might want to modify to customize the system integration, without interferring with the main "applicative" code.

*NB:* The example.html file is not needed for Moodle integration, it may be used as a reference for designing your own HTML container.

### Moodle integration
This software being self-sufficient, it is NOT a Moodle plugin. In order to integrate it into Moodle, we recommend using the Generico filter plugin (https://github.com/justinhunt/moodle-filter_generico). The Moodle administrator needs to create a Generico template (named, say "chartEmbedder"), configure it to import the bridge file via AMD, and define the template body to the following:

```<div class='chartEmbeddingZone'></div>```

After that, users allowed to create questionnaires (e.g., teachers) may use the following specific tag in question bodies ```{GENERICO:type=chartEmbedder}``` to make a chartGen area appear in the form that will be shown to targeted users (e.g., students).

## Credits
The following libraries are used under the hood (most dependencies are managed via AMD):
- https://github.com/requirejs/requirejs (obviously!)
- https://github.com/yoannmoinet/i18njs
- https://github.com/jquery/jquery
- https://github.com/chartjs
- https://github.com/cheminfo/is-any-array
- https://github.com/mljs/matrix
- https://github.com/niklasvh/html2canvas and https://github.com/MrRio/jsPDF (embedded in the html2pdf bundle)


## Caveats
	- Browsers based on Chromium v87 are not compatible with the PDF export functionality (all inputs and textareas appear blank)
	- Safari shows textarea contents horizontally rather than vertically
	- Values of X for which Y does not exist (e.g., Y=1/X and X=0) must be specified explicitly in the textareas (with a non-numeric value for Y) in order to let the system know it must skip them (otherwise it creates continuity on each side of the given X value)

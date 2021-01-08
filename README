# Welcome to chartGen

This small library aims at providing an embeddable interface for easily generating Chart.js(https://github.com/chartjs)-based series graphs. It was initially developped to be embedded into Moodle questionnaires, but with the goal to keep it generic enough so that it may be used independently.

## Features
	- Editable legend (labels for series name, X and Y axes)
	- Up to 5 series per canvas
	- Up to 2 Y axes per canvas
	- Levenberg-Marquardt (https://github.com/mljs/levenberg-marquardt) fitting algorithm applicable to 9 predefined functions
	- "Interpolate" functionality for non-fittable functions
	- PDF export implementation via html2pdf.js (https://github.com/eKoopmans/html2pdf.js)
	
## Caveats

	- Browsers based on Chromium v87 are not compatible with the PDF export functionality (all inputs and textareas appear blank)
	- Safari shows textarea contents horizontally rather than vertically
	- Values of X for which Y does not exist (e.g., Y=1/X and X=0) must be specified explicitly in the textareas (with a non-numeric value for Y) in order to let the system know it must skip them (otherwise it creates continuity on each side of the given X value)

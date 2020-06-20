// Extract HTML from problem and reload this window with it.
function reloadProblem() {

  // Get the user-entered problem text
  var problemArea = document.getElementById("oldProblem");
  var problemText = problemArea.value;

  // Determine the version of GUIWorK to use
  var version = '1.0';
  var versionArray = /GUIWorK v(\d+\.\d+)/.exec(problemText);
  if (versionArray) { // Versions after 1.0 output their version number
    version = versionArray[1];
  }

  // Extract the HTML from the text (PGML should precede it).
  var regex = /[^]*^ENDDOCUMENT\(\);\s*$/m;
  var HTMLText = problemText.replace(regex, '');

  // Overwrite the editor page with problem HTML.
  // Note that the load event will not fire, so the init() method
  // will not be called.
  document.open();
  document.write(HTMLText);
}
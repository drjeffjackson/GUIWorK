// Extract HTML from problem and navigate user to the appropriate editor.
function selectVersion() {

  // Get the user-entered problem text
  var problemArea = document.getElementById("oldProblem");
  var problemText = problemArea.value;

  // Determine the version of GUIWorK to use
  var version = '1.0';
  var versionArray = /GUIWorK v(\d+\.\d+)/.exec(problemText);
  if (versionArray) { // Versions after 1.0 output their version number
    version = versionArray[1];
  }

  // Load the editor for the given version
  document.location.assign("v"+version+"/ProblemEditor.html");
}
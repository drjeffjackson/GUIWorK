// Extract HTML from problem and reload this window with it.
function reloadProblem() {

  // Get the user-entered problem text
  var problemArea = document.getElementById("oldProblem");
  var problemText = problemArea.value;

  // Extract the HTML from the text (PGML should precede it).
  // var regex = /[^]*ENDDOCUMENT\(\);/;
  var regex = /[^]*^ENDDOCUMENT\(\);\s*$/m;
  var HTMLText = problemText.replace(regex, '');
  //alert(HTMLText);
 
  // Load the HTML in a new document
  document.open();
  document.write(HTMLText);
}
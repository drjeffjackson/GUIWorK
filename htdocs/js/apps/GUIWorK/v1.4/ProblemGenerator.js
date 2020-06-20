// 1.3 version of ProblemGenerator.js

// Initialization (called on initial load of page body).  Create a div
// representing a blank question.  Then add the question to the page.
function init() {

  // Input blank question div.  There will be an asynchronous aspect
  // because we're loading some information from a file.  Processing
  // eventually continues by adding a blank question to the end of the
  // questions div.
  loadBlankQ( function() {addBlankQuestion(null);} );
}

// Load the GUIWorK.blankQuestion element.  The basic HTML comes from
// a file, while the menu definitions come from the configuration
// defined in config.js.
function loadBlankQ(continuation) {
  inputFile("BlankQuestion.html",
   	    function(connection)
	      {loadBlankQContinuation(connection,continuation);}
	    );
}
function loadBlankQContinuation(connection, continuation) {

  // Use div as container for the blank question
  GUIWorK.blankQuestion = document.createElement("div");

  // Insert HTML template code in the blank question div
  GUIWorK.blankQuestion.innerHTML = connection.responseText;

  // Populate the select menus using data from GUIWorK.config
  var questionSelect = GUIWorK.blankQuestion.getElementsByClassName("questionTypeMenu")[0];
  populateSelect(questionSelect, GUIWorK.config.questionTypeMenu);
  var actionSelect = GUIWorK.blankQuestion.getElementsByClassName("actionMenu")[0];
  populateSelect(actionSelect, GUIWorK.config.actionMenu);

  // Perform continuation processing
  //   If initializing a new problem, add a blank question.
  //   If reloading to edit existing problem, we're already in the midst of
  //     adding a blank question, so continue that process.
  continuation();
}

// Populate a select control with the specified list of options.
// Each option in the list is an object with 'text' and 'name'
// properties.  If the 'name' is empty, disable the text.
// The first list item is marked as selected, even if disabled.
function populateSelect(select, optionList) {
  for (var i=0; i<optionList.length; i++) {
    var option = document.createElement("option");
    select.appendChild(option);
    option.textContent = optionList[i].text;
    if (optionList[i].name) {
      option.setAttribute("name", optionList[i].name);
    }
    else {
      option.setAttribute("disabled", "disabled");
    }
    if (i==0) {
      option.setAttribute("selected", "selected");
    }
  }
}

// Add a blank question (no question type selected yet) before the
// given question, or as the last question if successor is null.
function addBlankQuestion(successor) {

  // Create and insert a blank question, setting its and successors'
  // question numbers accordingly.
  // If we are editing a problem, init() was not called, so we will
  // need to load GUIWorK.blankQuestion the first time we're called.
  if (!GUIWorK.blankQuestion) {
    // Processing continues asynchronously at addBlankQuestionContinuation
    loadBlankQ(function() {addBlankQuestionContinuation(successor);});
  }
  else {
    addBlankQuestionContinuation(successor);
  }
}
function addBlankQuestionContinuation(successor) {
  var newQuestion = GUIWorK.blankQuestion.firstElementChild.cloneNode(true);
  var questionDiv = document.getElementById("questionDiv");
  questionDiv.insertBefore(newQuestion, successor);

  // Set question numbers on the new and succeeding questions appropriately
  var questions = questionDiv.getElementsByClassName("question");
  var questionNum = questions.length;
  if (successor) {
    questionNum = getQuestionNum(successor);
  }
  setQuestionNum(newQuestion, questionNum);
  for (i=questionNum; i<questions.length; i++) {
    deltaQuestionNum(questions[i], 1);
  }
}

// Respond to a selection in the action menu
function actionMenu(actionSelect) {

  // Initialize references to useful elements
  var questionElt = actionSelect.parentNode.parentNode;
  var questionDiv = document.getElementById("questionDiv");

  // Sanity check, in case blank-question HTML changes and this
  // code does not.
  if (questionElt.parentNode != questionDiv) {
    alert("Error in actionMenu: bad question element reference.");
    return;
  }
  // Retrieve the function corresponding to the selected action.
  var options = actionSelect.options;
  var actionName = options[actionSelect.selectedIndex].getAttribute("name");
  var actionFunc = window[actionName];

  // Reset the action menu to select the first (identification) option
  actionSelect.selectedIndex = 0;

  // Perform the action, if we can
  if (typeof actionFunc !== 'function') {
    alert("Error in actionMenu: bad action name " + actionName);
    return;
  }
  actionFunc(actionSelect, questionElt, questionDiv);
}

// Action: Add a blank question before the current question.
function addBlankBefore(actionSelect, questionElt, questionDiv) {
  addBlankQuestion(questionElt);
}

// Action: Add a blank question after the current question.
function addBlankAfter(actionSelect, questionElt, questionDiv) {

  // Find the question following the current question, if there is one.
  var questionNumber = getQuestionNum(questionElt);
  var questions = questionDiv.getElementsByClassName("question");
  var nextQuestion = null;
  if (questionNumber < questions.length) { // current question is not last
    nextQuestion = questions[questionNumber];
  }
  // Add the new question prior to the successor question, or at end if no
  // successor.
  addBlankQuestion(nextQuestion);
}

// Action: Duplicate the current question.
function dupQuestion(actionSelect, questionElt, questionDiv) {

  // Create new question as a copy of the current one, including
  // current input values,
  // and insert new question following the current one.
  actionSelect.selectedIndex = 0;
  addInputValues(questionElt);
  var newQuestion = questionElt.cloneNode(true);
  questionDiv.insertBefore(newQuestion, questionElt.nextSibling);

  // Increment the newly created problem's number as well as
  // the number of all subsequent problems.
  var nextNode = newQuestion;
  do {
    if (nextNode.nodeType == Node.ELEMENT_NODE) {
       deltaQuestionNum(nextNode, 1);
    }
    nextNode = nextNode.nextSibling;
  } while (nextNode);
}

// Action: Move this question earlier.
function moveQuestionEarlier(actionSelect, questionElt, questionDiv) {
  var nQuestion = getQuestionNum(questionElt);

  // Do not move if this is the first question
  if (nQuestion == 1) {
    alert("Cannot move first question earlier.");
  }
  else {
    // Locate the preceding question element
    var prevNode = questionElt.previousSibling;
    while (prevNode.nodeType != Node.ELEMENT_NODE) {
      prevNode = prevNode.previousSibling;
    }

    // Cut-and-paste this question to move it before the previous question,
    // and change both question numbers.
    questionDiv.removeChild(questionElt);
    questionDiv.insertBefore(questionElt, prevNode);
    setQuestionNum(questionElt,nQuestion-1);
    setQuestionNum(prevNode,nQuestion);
  }
}

// Action: Move this question later.
function moveQuestionLater(actionSelect, questionElt, questionDiv) {
  // Search for a later question
  var nextNode = questionElt.nextSibling;
  while (nextNode != null && nextNode.nodeType != Node.ELEMENT_NODE) {
    nextNode = nextNode.nextSibling;
  }

  // If there is a later question, move it before this question.
  if (nextNode == null) {
    alert("Cannot move last question later.");
  }
  else {
    moveQuestionEarlier(actionSelect, nextNode, questionDiv);
  }
}

// Action: Delete the current question.
function delQuestion(actionSelect, questionElt, questionDiv) {

  // Do not delete if this is the only question.
  if (questionDiv.childElementCount <= 1) {
    alert("Cannot delete only remaining question.");
    return;
  }

  // Capture sibling info before deleting this Node
  var nextNode = questionElt.nextSibling;

  // Remove this question
  questionDiv.removeChild(questionElt);

  // Decrement problem numbers of all subsequent problems.
  do {
    if (nextNode.nodeType == Node.ELEMENT_NODE) {
       deltaQuestionNum(nextNode, -1);
    }
    nextNode = nextNode.nextSibling;
  } while (nextNode);
}

// Respond to selection in the question-type select
function questionTypeMenu(questionTypeSelect) {
  // Initialize references to useful elements
  var questionElt = questionTypeSelect.parentNode.parentNode;

  // Sanity check, in case blank-question HTML changes and this
  // code does not.
  var questionDiv = document.getElementById("questionDiv");
  if (questionElt.parentNode != questionDiv) {
    alert("Error in questionTypeMenu: bad question element reference.");
    return;
  }
  // Input HTML template for the specified question type.
  var options = questionTypeSelect.options;
  var qTypePrefix = options[questionTypeSelect.selectedIndex].getAttribute("name");
  inputFile(qTypePrefix+"/template.html",
     function(connection) {questionTypeMenuContinue(questionTypeSelect, questionElt, connection)});
}
function questionTypeMenuContinue(questionTypeSelect, questionElt, connection) {

  // Add question HTML as the content of the
  // questionDiv element of this question.
  var questionDiv = questionElt.getElementsByClassName("questionDiv")[0];
  questionDiv.innerHTML = connection.responseText;

  // Mark selected question-type option as selected, disable all options
  // (question type cannot be changed once it has been selected).
  var options = questionTypeSelect.options;
  var selectedIndex = questionTypeSelect.selectedIndex;
  for (var i=0; i<options.length; i++) {
    var option = options[i];
    if (i==selectedIndex) {
      option.setAttribute("selected", "seleted");
    }
    else {
      option.removeAttribute("selected");
    }
    option.setAttribute("disabled", "disabled");
  }
}


// Construct and display a string of PGML code representing the
// questions entered on a web page.
function generatePGML(button)
{
  try {

  // Initialize problem references
  var questionDiv = document.getElementById("questionDiv");
  var questions = questionDiv.getElementsByClassName("question");
  var numQuestions = questions.length;

  // Initialize other problem settings
  var doShowPartialSolutions = document.getElementById("partial").checked;

  // Add PG preamble to output string.
  var outString = "";
  outString += '############ Generated by GUIWorK v' + GUIWorK.VERSION + ' ########### \n';
  outString += '#  Note that if any changes are made directly    # \n';
  outString += '#  to the PG code below then the GUIWorK editor  # \n';
  outString += '#  cannot be used to update this problem.        # \n';
  outString += '################################################## \n';
  outString += 'DOCUMENT(); \n';
  outString += 'loadMacros( \n';
  outString += '"PGstandard.pl", \n';
  outString += '"MathObjects.pl", \n';
  outString += '"PGchoicemacros.pl", \n';
  outString += '"parserRadioButtons.pl", \n';
  outString += '"parserPopUp.pl", \n';
  outString += '"parserFunction.pl", \n';
  outString += '"PGML.pl", \n';
  outString += '); \n';
  outString += ' \n';

  // Allow each question type to perform initialization, such as resetting
  // variables shared by all questions of a type, prior to  generating code.
  // Note that init() might be called multiple times for a question type if
  // there are multiple questions of that type in the problem.
  for (var nQuestion = 1; nQuestion <= numQuestions; nQuestion++) {
    var questionElt = questions[nQuestion-1];
    var qType = getQuestionTypePrefix(questionElt);
    if (qType) { // let later processing deal with any errors
      var genFunc = GUIWorK[qType].init;
      if (typeof genFunc === "function") {
        genFunc(questionElt);
      }
    }
  }
  // Add each questions's initialization to the output string
  for (var nQuestion = 1; nQuestion <= numQuestions; nQuestion++) {
    outString += '# INITIALIZATION FOR QUESTION ' + nQuestion + '\n';
    var code = generateQuestionCode(questions[nQuestion-1], "PGgen");
    outString += code;
  }

  // Begin the PGML section
  outString += '\n';
  outString += '$showPartialCorrectAnswers = ' + Number(doShowPartialSolutions) + '; \n';
  outString += 'TEXT(beginproblem()); \n';
  outString += 'BEGIN_PGML \n';
  outString += '=== \n';

  // Add each problem's PGML code to the output string
  for (nQuestion = 1; nQuestion <= numQuestions; nQuestion++) {
    outString += '  \n';
    outString += '*Question ' + nQuestion + '*  \n'; // need exactly 2 spaces
    var code = generateQuestionCode(questions[nQuestion-1], "PGMLgen");
    outString += code;
  }
  // Close PGML section
  outString += '\n';
  outString += 'END_PGML \n';

  // Include any solutions
  var someSolution = false;
  for (var nQuestion = 1; nQuestion <= numQuestions; nQuestion++) {
    var question = questions[nQuestion-1];
    var solution = question.getElementsByClassName("solution")[0];
    if (solution.value) {
      if (!someSolution) {
        outString += '\n';
        outString += 'BEGIN_PGML_SOLUTION \n';
	someSolution = true;
      }
      outString += '\n';
      outString += '*Question ' + nQuestion + '*  \n';
      outString += encodeLaTeXMathModePGML(solution.value) + ' \n';
    }
  }
  if (someSolution) {
    outString += '\n';
    outString += 'END_PGML_SOLUTION \n';
  }

  // Terminate the PG code
  outString += 'ENDDOCUMENT(); \n';

  // Append HTML representing the entire page, including input values
  // (except anything in the outBox textarea)
  // so that the problem can be edited later.
  // This modifies the document to include the input values.
  outString += '<!-- \n';
  outString += '############ Generated by GUIWorK v' + GUIWorK.VERSION + ' ########### \n';
  outString += '#  The following code is ignored by WeBWorK      # \n';
  outString += '#  and can be deleted if you do not plan to use  # \n';
  outString += '#  the GUIWorK editor to update this problem.    # \n';
  outString += '################################################## \n';
  outString += '--> \n';
  addInputValues(document.documentElement);
  var outBox = document.getElementById("outBox");
  outBox.textContent = "";  // Don't need to include this input value
  outString += document.documentElement.outerHTML + '\n';

  // Display the PGML+HTML code in the appropriate textarea
  outBox.value = outString;

  }
  catch (errorMsg) {
    alert("Unable to generate code: " + errorMsg);
  }
  return false;
}

// Generate code for one question using the named generating function
// (either generates PG initialization code (PGgen) or PGML display code
// (PGMLgen)).
function generateQuestionCode(questionElt, genFuncString) {
  var nQuestion = getQuestionNum(questionElt);
  var qType = getQuestionTypePrefix(questionElt);
  if (qType === null) {
    throw "Question " + nQuestion + " is blank.";
  }
  if (qType === "") { // This should not happen
    throw "Question " + nQuestion + " has unsupported question type selected.";
  }
  if (!qType) { // Something is seriously wrong
    throw "Question " + nQuestion + " generated internal error.";
  }
  var genFunc = GUIWorK[qType][genFuncString];
  if (typeof genFunc !== "function") {
    throw "Question " + nQuestion + ": No " + genFuncString + " function.";
  }
  var code = genFunc(questionElt);
  return code;
}

// Return the question type prefix string for the given question
// element.  Return null if question type selection index indicated no
// question type has been selected or undefined if something goes
// wrong with retrieving the prefix name from the question HTML
// (internal error).
function getQuestionTypePrefix(questionElt) {
  var qTypeSelect = questionElt.getElementsByClassName("questionTypeMenu")[0];
  var qTypeIndex = qTypeSelect.selectedIndex;
  var qType = null;
  if (qTypeIndex > 0) {
    qType = qTypeSelect.options[qTypeIndex].getAttribute("name");
  }
  return qType;
}

// Modifies the specified element by including in the element the
// user's current inputs.  For instance, this adds value attributes to
// input/text elements.
function addInputValues(element) {

  // Set the value attribute of every input/text element to its value,
  // and add a checked attribute to every input/checkbox that is checked.
  var inputs = element.getElementsByTagName("input");
  for (var i=0; i<inputs.length; i++) {
    var input = inputs[i];
    var inputType = input.getAttribute("type");
    if (inputType == "text") {
      input.setAttribute("value", input.value);
    }
    else if (inputType == "checkbox") {
      if (input.checked) {
        input.setAttribute("checked", "checked");
      } else if (input.hasAttribute("checked")) {
        input.removeAttribute("checked");
      }
    }
  }

  // Mark as "selected" the currently selected option in each select control.
  // Note that we must remove any "selected" attribute previously set on
  // a different element.
  var selects = element.getElementsByTagName("select");
  for (var i=0; i<selects.length; i++) {
    var select = selects[i];
    var options = select.options;
    for (var j=0; j<options.length; j++) {
      var option = options[j];
      if (j == select.selectedIndex) {
        option.setAttribute("selected", "selected");
      }
      else if (option.hasAttribute("selected")) {
        option.removeAttribute("selected");
      }
    }
  }

  // Add text within each textarea as a text node of that textarea.
  textareas = element.getElementsByTagName("textarea");
  for (var i=0; i<textareas.length; i++) {
    var textarea = textareas[i];
    textarea.textContent = textarea.value;
  }
}

// ***** Utility functions *******


// Set the number of the given question to the given value.
function setQuestionNum(question, number) {
  var questionNumSpan = question.getElementsByClassName("questionNum")[0];
  questionNumSpan.textContent = number;
}

// Add delta to the number of the given question.
function deltaQuestionNum(question, delta) {
  var questionNumSpan = question.getElementsByClassName("questionNum")[0];
  questionNumSpan.textContent = Number(questionNumSpan.textContent) + delta;
}

// Return (as a number) the number of the given question.
function getQuestionNum(question) {
  var questionNumSpan = question.getElementsByClassName("questionNum")[0];
  return Number(questionNumSpan.textContent);
}

// Return the next letter after the given letter
function nextLetter(oldLetter) {
  var newLetter = String.fromCharCode(oldLetter.charCodeAt()+1);
  return newLetter;
}

// Return the letter preceding the given letter
function prevLetter(oldLetter) {
  var newLetter = String.fromCharCode(oldLetter.charCodeAt()-1);
  return newLetter;
}

// XML encode quotes in a string.
function encodeQuotes(aString) {
  return aString.replace(/\"/g, "&quot;"); // used \" rather than " for Emacs
}

// Replace unescaped $...$ or $$...$$ (LaTeX inline/display math mode markings)
// with [`...`] or \n>>[``...``]<<\n (PGML math mode markings).
function encodeLaTeXMathModePGML(aString) {
  var regex1 = /(^|[^\\])\$([^]*?)([^\\])\$/g;
  var regex2 = /(^|[^\\])\$\$([^]*?)([^\\])\$\$/g;
  return aString.replace(regex2, '$1\n>>[``$2$3``]<<\n').replace(regex1, '$1[`$2$3`]');
}

// Replace unescaped $...$ with \(...\) (PG math mode markings).
// This is used in, e.g., radio button answers.
function encodeLaTeXMathModePG(aString) {
  var regex = /(^|[^\\])\$([^]*?)([^\\])\$/g;
  return aString.replace(regex, '$1\\($2$3\\)');
}

// Input content from given url.  Processing continues asynchronously at
// by calling continuation with the XMLHttpRequest object.
// The responseText property of this object will have the url's content.
function inputFile(url, continuation) {
  connection = new XMLHttpRequest();
  connection.addEventListener("load",
    function () { continuation(connection); }
  );
  connection.responseType = "text";
  connection.open("GET", url, true);
  connection.send();
}

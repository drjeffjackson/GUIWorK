// TODO: FIX BUGS WITH OPTIONS.
// -- The drop-down is repeated, so it can show + in some questions/parts
//    and - in other questions/parts.
// -- When we edit, the combinatorics option internal boolean is initialized
//    to false rather than being picked up from the HTML doc.
//    Can work around by manually selecting the option.

// TODO: Fix auto-variable extraction to ignore a longer
//   word, such as sin.

// TODO: Add options specific to data types.  For instance,
//   for Formula, allow user to specify symbols representing
//   functions (handy for sequence representation).

/**
 * GUIWorK fitb property contains all JavaScript code associated with
 * the fill-in-the-blank question type.
 * Attempts to automatically extract strings from lists and one-letter
 * variables from formulas and add these to appropriate Context.
 * The code inherits from QuestionType.
 */ 
GUIWorK.fitb = Object.create(GUIWorK.QuestionType.prototype);

// First call to PGgen for a new problem generation.
GUIWorK.fitb.firstPGgenCall = true;

// Various answer checker options with default values
GUIWorK.fitb.opt_form_combinatorics = false;

// Tell PGgen to clear the contextStrings array in preparation for
// generating fresh code for the problem.

// NOTE: Default WeBWorK strings are
//   DNE,INF,INFINITY,NONE,inf,infinity 
// We're also telling WeBWorK to clear these, so they are only
// available if explicitly given as an answer or specified by the
// user as allowable strings.
GUIWorK.fitb.init = 
function init() {
  GUIWorK.fitb.firstPGgenCall = true;
};

// Add all answer Strings, including those embedded within Lists,
// along with any additional explicitly specified strings, to Context.
// Also add all one-character variable names within formulas to Context.
GUIWorK.fitb.PGgen =
function PGgen(questionElt) {
    var outString = '';
    var nQuestion = getQuestionNum(questionElt);
    var stringList = new GUIWorK.Set(); // Context strings for this question
    var varList = new GUIWorK.Set();    // Variable names for this question

    // If first call for a new problem generation, create empty string
    // and variable arrays and tell WeBWorK to clear its strings and
    // variables from Context.
    if (GUIWorK.fitb.firstPGgenCall) {
      GUIWorK.fitb.contextStrings = new GUIWorK.Set();
      GUIWorK.fitb.contextVariables = new GUIWorK.Set();
      outString += 'Context()->strings->are();\n';
      outString += 'Context()->variables->are();\n';
      GUIWorK.fitb.firstPGgenCall = false;

      // If combinatorics option selected, generate the functions.
      if (GUIWorK.fitb.opt_form_combinatorics) {
        outString += 'Context()->variables->add(n=>"Real",r=>"Real");\n';
        outString += 'parserFunction("C(n,r)"=>"n!/((n-r)!*r!)");\n';
        outString += 'parserFunction("P(n,r)"=>"n!/(n-r)!");\n';
        GUIWorK.fitb.contextVariables.include('n');
        GUIWorK.fitb.contextVariables.include('r');
        GUIWorK.fitb.contextVariables.include('C');
        GUIWorK.fitb.contextVariables.include('P');
      }
    }

    // Compile list of new string answers, saving them so that
    // later questions will not attempt to also add them to context.
    // Similarly, extract variable names from formulas.
    // Throw error if any answers are blank.
    var answerElts = questionElt.getElementsByClassName("fitb_answer");
    var answerTypeElts = questionElt.getElementsByClassName("fitb_ansType");
    for (var i=0; i<answerElts.length; i++) {
      var answer = answerElts[i].value.trim();
      var selectAnswerType = answerTypeElts[i];
      if (/^\s*$/.test(answer)) {
        throw "Question " + nQuestion + " has a blank answer.";
      }
      if (selectAnswerType.value == "String" ||
          (selectAnswerType.selectedIndex == 0 && GUIWorK.fitb.isLetters(answer))) {
         stringList.include(answer);
      }
      // Find all of the (one-letter) variables in this formula.
      // In, e.g., sin(x)y, this will find x and y but not (any part of) sin.
      else if (selectAnswerType.value == "Formula") {
         var letterRE = /(^|[^A-Za-z])([A-Za-z])(?![A-Za-z])/g;
         var varArray;
         while ((varArray=letterRE.exec(answer)) != null) {
           var variable = varArray[2];
           varList.include(variable);
         }
      }
      // Check for strings embedded within a list answer.
      else if (selectAnswerType.value == "List") {
        // Remove any paren chars around the list or sublists
        // as well as splitting the list on commas
        var elements = answer.split(/[,\(\[\{\}\]\)]/);
        for (var w=0; w<elements.length; w++) {
           element = elements[w].trim();
           if (GUIWorK.fitb.isLetters(element)) {
              stringList.include(element);
           }
        }
      }
      // Check for Matrix type. Matrix value needs to be wrapped in 
      // Matrix Context, at least in ww_version 2.12.
      else if (selectAnswerType.value == "Matrix") {
        outString += 'Context("Matrix");\n';
        outString += GUIWorK.fitb.matrixVar(nQuestion,i) 
                     + ' = Matrix(' + answer + ');\n';
        outString += 'Context("Numeric");\n';
      }
    }
    // Add any additional legal-answer strings to the list of
    // recognized answers.
    var allowableText = questionElt.getElementsByClassName("fitb_allowableText")[0].value;
    if (!(/^[,|\s]*$/.test(allowableText))) { // not merely separator chars
      var additionalStringList = allowableText.split(/\s+|\s*,\s*/);
      for (var i=0; i<additionalStringList.length; i++) {
         var answer = additionalStringList[i];
         stringList.include(answer);
      }
    }
    // Reduce string and variable lists to those that are new
    // to the overall problem and update the problem lists.
    stringList = stringList.diff(GUIWorK.fitb.contextStrings);
    varList = varList.diff(GUIWorK.fitb.contextVariables);
    GUIWorK.fitb.contextStrings = GUIWorK.fitb.contextStrings.union(stringList);
    GUIWorK.fitb.contextVariables = GUIWorK.fitb.contextVariables.union(varList);

    // Add new answer and variable strings to the context so that
    // WeBWorK will recognize them.
    if (stringList.length > 0) {
      outString += 'Context()->strings->add(';
      for (var i=0; i<stringList.length; i++) {
        outString += stringList[i] + '=>{},'; 
      }
      outString += ');\n';
    }
    if (varList.length > 0) {
      outString += 'Context()->variables->add(';
      for (var i=0; i<varList.length; i++) {
        outString += varList[i] + "=>'Real',";
      }
      outString += ');\n\n';
    }
    return outString;
  };

  // Add the question/answer-blank pairs to this question
GUIWorK.fitb.PGMLgen =
function PGMLgen(questionElt) {
    var outString = '';
    var nQuestion = getQuestionNum(questionElt);

    // First output any preliminary text.
    var prelimText = questionElt.getElementsByClassName("fitb_prelim")[0].value;
    outString += encodeLaTeXMathModePGML(prelimText);
    outString += '\n\n';

    
    // Next output the question/answer-blank pairs
    var blankSizeText = questionElt.getElementsByClassName("fitb_blankSize")[0].value;
    var blankText = '[_______________]'; // default blank is medium length
    if (blankSizeText=="short") {
      blankText = '[_]';
    }
    else if (blankSizeText=="long") {
      blankText = '[________________________________________________________]';
    }
    var qaPairs = questionElt.getElementsByClassName("fitb_qaPair");
    for (var i=0; i<qaPairs.length; i++) {
      var qaPair = qaPairs[i];
      outString += '*' + qaPair.getElementsByClassName("fitb_letter")[0].textContent + ")* ";
      outString += encodeLaTeXMathModePGML(qaPair.getElementsByClassName("fitb_question")[0].value);
      outString += '\n  ';
      outString += blankText;
      var rawAnswer = qaPair.getElementsByClassName("fitb_answer")[0].value;
      var selectAnswerType = qaPair.getElementsByClassName("fitb_ansType")[0];

      // If no answer type specified, let WeBWorK try to figure it out by
      // simply quoting the answer.  If Matrix type, use matrix variable
      // constructed during PG generation.
      // Otherwise, pass answer as a quoted
      // argument to the specified MathObjects constructor.
      if (selectAnswerType.selectedIndex == 0) {
        outString += '{"' + rawAnswer + '"';
      }
      else if (selectAnswerType.value == "Matrix") {
        outString += '*{' + GUIWorK.fitb.matrixVar(nQuestion,i);
      }
      else {
        outString += '{' + selectAnswerType.value + '("' + rawAnswer + '")';
      }
      outString += '}\n\n';
    }    
    return outString;
  };

/******* Utilities *******/

GUIWorK.fitb.isLetters =
function isLetters(answer) {
  return /^[A-Za-z]+$/.test(answer);
}

// Passed question number and 0-based number of the part of the
// question, returns Perl variable unique to this question and part.
GUIWorK.fitb.matrixVar = 
function matrixVar(question, part) {
  return "$fitb_matQ" + question 
         + String.fromCharCode('a'.charCodeAt(0) + part);
}

/******* Event handlers ********/

// Add a question/answer pair after the current q/a pair.
GUIWorK.fitb.addAnswer = 
function addAnswer(addButton) {
    // Retrieve pointers to the current q/a div and
    // the div containing all q/a pairs.
    var qaDiv = addButton.parentNode.parentNode;
    var qaPairsDiv = qaDiv.parentNode;

    // Create the new q/a div as a clone of the current one
    // and insert it following the current answer box.
    var newQaDiv = qaDiv.cloneNode(true);
    qaPairsDiv.insertBefore(newQaDiv, qaDiv.nextSibling);

    // Clear the question and answer boxes (input elements might have
    // value attributes set).
    var question = newQaDiv.getElementsByClassName("fitb_question")[0];
    question.value = '';
    var answer = newQaDiv.getElementsByClassName("fitb_answer")[0];
    answer.value = '';

    // Increment the newly created div's letter as well as
    // the letters of all subsequent q/a divs.
    var nextNode = newQaDiv;
    do {
       if (nextNode.nodeType == Node.ELEMENT_NODE) {
          var letterSpan = nextNode.getElementsByClassName("fitb_letter")[0];
          letterSpan.textContent = nextLetter(letterSpan.textContent);
       }
       nextNode = nextNode.nextSibling;
    } while (nextNode);
  };

  // Delete the current answer box.
GUIWorK.fitb.delAnswer = 
function delAnswer(delButton)
  {
    // Retrieve pointers to the current q/a div and
    // the div containing all q/a pairs.
    var qaDiv = delButton.parentNode.parentNode;
    var qaPairsDiv = qaDiv.parentNode;

    // Don't delete if there is only one q/a div remaining.
    if (qaPairsDiv.childElementCount <= 1) {
       window.alert("Cannot delete last remaining question/answer pair.");
       return;
    }

    // Delete this q/a pair.  Capture next sibling first.
    var nextNode = qaDiv.nextSibling;
    qaPairsDiv.removeChild(qaDiv);

    // Decrement the letters of all subsequent answers.
    while (nextNode) {
       if (nextNode.nodeType == Node.ELEMENT_NODE) {
          var letterSpan = nextNode.getElementsByClassName("fitb_letter")[0];
          letterSpan.textContent = prevLetter(letterSpan.textContent);
       }
       nextNode = nextNode.nextSibling;
    }
  };

// Update UI in response to the answer type selected.
// For instance, add option menu for Formula answer type.
GUIWorK.fitb.answerTypeMenu = 
function answerTypeMenu(answerTypeSelect) 
  {
    var aType = answerTypeSelect.value;
    var formulaOptElt = 
        answerTypeSelect.parentNode.
          getElementsByClassName("fitb_options_formula")[0];
    if (aType == "Formula") {
      formulaOptElt.style.setProperty("display", "inline", "");
    }
    else {
      formulaOptElt.style.setProperty("display", "none", "");      
    }
  };

// A selection has been made in the formula options menu.
// Toggle the selected option.
GUIWorK.fitb.formulaOption =
function formulaOption(formulaOptionSelect)
  {
    var selectedIndex = formulaOptionSelect.selectedIndex;
    var formulaOptionName = 
        formulaOptionSelect[selectedIndex].getAttribute("name");
    if (formulaOptionName == "fitb_opt_form_combinatorics") {
      GUIWorK.fitb.opt_form_combinatorics = !GUIWorK.fitb.opt_form_combinatorics;
    }
    // Update menu text to reflect status of option selection
    var formulaOptionElt = formulaOptionSelect[selectedIndex];
    var optionText = formulaOptionElt.textContent;
    var leadingSymbol = GUIWorK.fitb.opt_form_combinatorics ? '+' : '-';
    formulaOptionElt.textContent = 
       leadingSymbol + optionText.slice(1,optionText.length);

    // Reset the selection
    formulaOptionSelect.selectedIndex = 0;
  };

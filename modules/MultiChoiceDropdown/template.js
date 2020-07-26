
/*
Each question type needs to supply
-- template.html: HTML template in which user enters question data
-- template.css:  CSS specifically for template.html
-- template.js:   javascript for processing within-question actions
   (e.g., adding multiple choice answers) plus the following
   -- PGgen method on GUIWorK: code for generating initialization section
   (PG code) from question data provided by the user
   -- PGMLgen method: code for generating PGML section from question
   data provided by the user
   -- Any errors encountered in these methods should be communicated
   -- by throwing a string describing the error. This will abort
   -- PGML generation and alert the user.

-- To avoid name conflicts with other question types, should prefix
   each of the following with question type prefix name (e.g., mcrb)
   -- CSS class names specific to this question type
   -- HTML id's
   -- Perl variables
*/

/**
 * GUIWorK MultiChoiceDropdown property contains all JavaScript code associated with
 * the multiple-choice/PopUp list (drop-down menu) question type.
 * This is very similar to the mcrb (mutiple-choice radio button)
 * code, except for the PG generation.
 */
GUIWorK.MultiChoiceDropdown = Object.create(GUIWorK.QuestionType.prototype);

GUIWorK.MultiChoiceDropdown.PGgen =
function PGgen(questionElt) {
    var outString = '';
    var nQuestion = getQuestionNum(questionElt);
    var popupObject = '$MultiChoiceDropdown_popup' + nQuestion;
    outString += popupObject +' = PopUp( \n';
    outString += '  [ \n';
    var answerBoxes = questionElt.getElementsByClassName("MultiChoiceDropdown_inBox");
    var answerStrings = new Array();
    for (i=0; i<answerBoxes.length; i++) {
      answerStrings[i] =
        encodeQuotes(encodeLaTeXMathModePG(answerBoxes[i].value));
    }
    outString += '   "?", \n';
    for (i=0; i<answerBoxes.length; i++) {
      outString += '    "' + answerStrings[i] +'", \n';
    }
    outString += '  ], \n';
    var selectAnswer = questionElt.getElementsByClassName("MultiChoiceDropdown_selectAnswer")[0];
    if (selectAnswer.selectedIndex == 0) {
      throw "Must select an answer for Question " + nQuestion;
    }
    var correctAnswer = selectAnswer.value;
    outString +=
      '  "' + answerStrings[correctAnswer.charCodeAt()-'a'.charCodeAt()] + '" \n';
    outString += '); \n';

    return outString;
  };

GUIWorK.MultiChoiceDropdown.PGMLgen =
function PGMLgen(questionElt) {
    var outString = '';
    var nQuestion = getQuestionNum(questionElt);

    var question = questionElt.getElementsByClassName("MultiChoiceDropdown_question")[0];
    var popupObject = '$MultiChoiceDropdown_popup' + nQuestion;
    outString += encodeLaTeXMathModePGML(question.value) + '\n  \n';
    outString += '[@ ANS(' + popupObject + '->cmp); '
    	         + popupObject + '->menu(); @]*\n';

    return outString;
  };

/******* Event handlers ********/

  // Add an answer box following the current answer box.
GUIWorK.MultiChoiceDropdown.addAnswer =
function addAnswer(textBox) {
    // Retrieve pointers to the current answer paragraph,
    // the div containing all answers, and
    // the fieldset of the form containing this problem.
    var paragraph = textBox.parentNode;
    var answerDiv = paragraph.parentNode;
    var fieldset = answerDiv.parentNode;

    // Create the new answer box as a copy of the current one
    // and insert it following the current answer box.
    var newAnswer = document.createElement("p");
    answerDiv.insertBefore(newAnswer, paragraph.nextSibling);
    newAnswer.innerHTML = paragraph.innerHTML;

    // Clear the box (input element might have value attribute set).
    var input = newAnswer.getElementsByClassName("MultiChoiceDropdown_inBox")[0];
    input.value = '';

    // Increment the newly created answer's letter as well as
    // the letters of all subsequent answers.
    var nextNode = newAnswer;
    do {
       if (nextNode.nodeType == Node.ELEMENT_NODE) {
       	  var letterSpan = nextNode.getElementsByClassName("MultiChoiceDropdown_letter")[0];
       	  letterSpan.textContent = nextLetter(letterSpan.textContent);
       }
       nextNode = nextNode.nextSibling;
    } while (nextNode);

    // Add an option to the correct-answer select menu
    var selectAnswer = fieldset.getElementsByClassName("MultiChoiceDropdown_selectAnswer")[0];
    var options = selectAnswer.options;
    var nOptions = options.length-1; // first "option" is disabled
    var newOptionText = String.fromCharCode('a'.charCodeAt()+nOptions) + ".";
    var newOption = document.createElement("option");
    selectAnswer.appendChild(newOption);
    newOption.textContent = newOptionText;
  };

  // Delete the current answer box.
GUIWorK.MultiChoiceDropdown.delAnswer =
function delAnswer(textBox)
  {
    // Retrieve pointers to the current answer paragraph,
    // the div containing all answers,
    // the fieldset of the form containing this problem,
    // the next sibling following this answer paragraph,
    // the select containing the possible answer letters,
    // and the options within the select.
    var paragraph = textBox.parentNode;
    var answerDiv = paragraph.parentNode;
    var fieldset = answerDiv.parentNode;
    var nextNode = paragraph.nextSibling;
    var selectAnswer = fieldset.getElementsByClassName("MultiChoiceDropdown_selectAnswer")[0];
    var options = selectAnswer.options;

    // Don't delete if there is only one option remaining.
    // (Note that "Select correct answer" is an option.)
    if (options.length <= 2) {
       window.alert("Cannot delete last remaining answer.");
       return;
    }

    // Delete this answer paragraph.
    answerDiv.removeChild(paragraph);

    // Decrement the letters of all subsequent answers.
    while (nextNode) {
       if (nextNode.nodeType == Node.ELEMENT_NODE) {
       	  var letterSpan = nextNode.getElementsByClassName("MultiChoiceDropdown_letter")[0];
       	  letterSpan.textContent = prevLetter(letterSpan.textContent);
       }
       nextNode = nextNode.nextSibling;
    }

    // Remove an option from the correct-answer select menu
    selectAnswer.removeChild(options[options.length-1]);
  };


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
   each of the following with question type prefix name (e.g., MultiChoiceRadioButton)
   -- CSS class names specific to this question type
   -- HTML id's
   -- Perl variables
*/

/**
 * GUIWorK MultiChoiceRadioButton property contains all JavaScript code associated with
 * the multiple-choice/radio-button question type.
 * The code inherits from QuestionType, so it is only necessary to
 * override methods needing non-default behavior.
 */
GUIWorK.MultiChoiceRadioButton = Object.create(GUIWorK.QuestionType.prototype);

GUIWorK.MultiChoiceRadioButton.PGgen =
function PGgen(questionElt) {
    var outString = '';
    var nQuestion = getQuestionNum(questionElt);
    var radioObject = '$MultiChoiceRadioButton_radio' + nQuestion;
    outString += radioObject +' = RadioButtons( \n';
    outString += '  [ \n';
    var answerBoxes = questionElt.getElementsByClassName("MultiChoiceRadioButton_inBox");
    var answerStrings = new Array();
    for (i=0; i<answerBoxes.length; i++) {
      answerStrings[i] =
        encodeQuotes(encodeLaTeXMathModePG(answerBoxes[i].value));
    }
    for (i=0; i<answerBoxes.length; i++) {
      outString += '    "' + answerStrings[i] +'", \n';
    }
    outString += '  ], \n';
    var selectAnswer = questionElt.getElementsByClassName("MultiChoiceRadioButton_selectAnswer")[0];
    if (selectAnswer.selectedIndex == 0) {
      throw "Must select an answer for Question " + nQuestion;
    }
    var correctAnswer = selectAnswer.value;
    outString +=
      '  "' + answerStrings[correctAnswer.charCodeAt()-'a'.charCodeAt()] + '", \n';
    outString += '  order=>[ \n';
    for (i=0; i<answerBoxes.length; i++) {
      outString += '    "' + answerStrings[i] +'", \n';
    }
    outString += '  ] \n';
    outString += '); \n';

    return outString;
  };

GUIWorK.MultiChoiceRadioButton.PGMLgen =
function PGMLgen(questionElt) {
    var outString = '';
    var nQuestion = getQuestionNum(questionElt);

    var question = questionElt.getElementsByClassName("MultiChoiceRadioButton_question")[0];
    var radioObject = '$MultiChoiceRadioButton_radio' + nQuestion;
    outString += encodeLaTeXMathModePGML(question.value) + '\n  \n';
    outString += '[@ ANS(' + radioObject + '->cmp); '
    	         + radioObject + '->buttons(); @]*\n';

    return outString;
  };

/******* Event handlers ********/

  // Add an answer box following the current answer box.
GUIWorK.MultiChoiceRadioButton.addAnswer =
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
    var input = newAnswer.getElementsByClassName("MultiChoiceRadioButton_inBox")[0];
    input.value = '';

    // Increment the newly created answer's letter as well as
    // the letters of all subsequent answers.
    var nextNode = newAnswer;
    do {
       if (nextNode.nodeType == Node.ELEMENT_NODE) {
       	  var letterSpan = nextNode.getElementsByClassName("MultiChoiceRadioButton_letter")[0];
       	  letterSpan.textContent = nextLetter(letterSpan.textContent);
       }
       nextNode = nextNode.nextSibling;
    } while (nextNode);

    // Add an option to the correct-answer select menu
    var selectAnswer = fieldset.getElementsByClassName("MultiChoiceRadioButton_selectAnswer")[0];
    var options = selectAnswer.options;
    var nOptions = options.length-1; // first "option" is disabled
    var newOptionText = String.fromCharCode('a'.charCodeAt()+nOptions) + ".";
    var newOption = document.createElement("option");
    selectAnswer.appendChild(newOption);
    newOption.textContent = newOptionText;
  };

  // Delete the current answer box.
GUIWorK.MultiChoiceRadioButton.delAnswer =
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
    var selectAnswer = fieldset.getElementsByClassName("MultiChoiceRadioButton_selectAnswer")[0];
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
       	  var letterSpan = nextNode.getElementsByClassName("MultiChoiceRadioButton_letter")[0];
       	  letterSpan.textContent = prevLetter(letterSpan.textContent);
       }
       nextNode = nextNode.nextSibling;
    }

    // Remove an option from the correct-answer select menu
    selectAnswer.removeChild(options[options.length-1]);
  };

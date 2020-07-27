import { GUIWorK } from "../Core/config.js"
/**
 * GUIWorK MultiChoiceCheckbox property contains all JavaScript code associated with
 * the multiple-choice/checkbox question type.
 * The code inherits from QuestionType, so it is only necessary to
 * override methods needing non-default behavior.
 */
GUIWorK.MultiChoiceCheckbox = Object.create(GUIWorK.QuestionType.prototype);

GUIWorK.MultiChoiceCheckbox.PGgen =
function PGgen(questionElt) {
    var outString = '';
    var nQuestion = getQuestionNum(questionElt);

    // Create the checkbox object.
    var checkboxObject = '$MultiChoiceCheckbox_checkbox' + nQuestion;
    outString += checkboxObject +' = new_checkbox_multiple_choice(); \n';

    // Call qa method to add question and correct answer(s) to checkbox object.
    outString += checkboxObject + '->qa( \n';
    var question = questionElt.getElementsByClassName("MultiChoiceCheckbox_question")[0];
    outString += '  "'+encodeQuotes(encodeLaTeXMathModePG(question.value))+'", \n';
    var answerCheckboxes = questionElt.getElementsByClassName("MultiChoiceCheckbox_checkBox");
    var answerBoxes = questionElt.getElementsByClassName("MultiChoiceCheckbox_inBox");
    var answerStrings = new Array();
    for (i=0; i<answerBoxes.length; i++) {
      answerStrings[i] =
        encodeQuotes(encodeLaTeXMathModePG(answerBoxes[i].value));
    }
    var nCorrect = 0;
    for (i=0; i<answerCheckboxes.length; i++) {
      if (answerCheckboxes[i].checked) {
        outString += '  "'+ answerStrings[i] +'", \n';
	nCorrect++;
      }
    }
    outString += '); \n';
    if (nCorrect++ <= 0) {
      throw "Must select at least one correct answer for Question " + nQuestion;
    }
    // Call makeLast method to add all possible answers, in order, to
    // the checkbox object.
    outString += checkboxObject + '->makeLast( \n';
    for (i=0; i<answerBoxes.length; i++) {
      outString += '  "' + answerStrings[i] +'", \n';
    }
    outString += '); \n';

    return outString;
  };

GUIWorK.MultiChoiceCheckbox.PGMLgen =
function PGMLgen(questionElt) {
    var outString = '';
    var nQuestion = getQuestionNum(questionElt);

    var intro = questionElt.getElementsByClassName("MultiChoiceCheckbox_intro")[0];
    outString += encodeLaTeXMathModePGML(intro.value)+'\n\n';

    var checkboxObject = '$MultiChoiceCheckbox_checkbox' + nQuestion;
    outString += '[@ ' + checkboxObject + '->print_q(); @]*  \n';
    outString += '[@ ANS(checkbox_cmp(' + checkboxObject + '->correct_ans())); '
    	         + checkboxObject + '->print_a(); @]*\n';

    return outString;
  };

/******* Event handlers ********/

  // Add an answer box following the current answer box.
GUIWorK.MultiChoiceCheckbox.addAnswer =
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
    var input = newAnswer.getElementsByClassName("MultiChoiceCheckbox_inBox")[0];
    input.value = '';

    // Increment the newly created answer's letter as well as
    // the letters of all subsequent answers.
    var nextNode = newAnswer;
    do {
       if (nextNode.nodeType == Node.ELEMENT_NODE) {
       	  var letterSpan = nextNode.getElementsByClassName("MultiChoiceCheckbox_letter")[0];
       	  letterSpan.textContent = nextLetter(letterSpan.textContent);
       }
       nextNode = nextNode.nextSibling;
    } while (nextNode);
  };

  // Delete the current answer box.
GUIWorK.MultiChoiceCheckbox.delAnswer =
function delAnswer(textBox)
  {
    // Retrieve pointers to the current answer paragraph,
    // the div containing all answers,
    // the next sibling following this answer paragraph.
    var paragraph = textBox.parentNode;
    var answerDiv = paragraph.parentNode;
    var nextNode = paragraph.nextSibling;

    // Don't delete if there is only one answer remaining.
    if (answerDiv.getElementsByClassName("MultiChoiceCheckbox_inBox").length <= 1) {
       window.alert("Cannot delete last remaining answer.");
       return;
    }

    // Delete this answer paragraph.
    answerDiv.removeChild(paragraph);

    // Decrement the letters of all subsequent answers.
    while (nextNode) {
       if (nextNode.nodeType == Node.ELEMENT_NODE) {
       	  var letterSpan = nextNode.getElementsByClassName("MultiChoiceCheckbox_letter")[0];
       	  letterSpan.textContent = prevLetter(letterSpan.textContent);
       }
       nextNode = nextNode.nextSibling;
    }
  };

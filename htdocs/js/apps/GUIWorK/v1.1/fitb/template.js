/**
 * GUIWorK fitb property contains all JavaScript code associated with
 * the fill-in-the-blank question type.
 * Currently, supports (automatically) numeric, List, and string data types.
 * The code inherits from QuestionType.
 */ 
GUIWorK.fitb = Object.create(GUIWorK.QuestionType.prototype);

// Maintain list of strings added to context (PG disallows re-adding)
GUIWorK.fitb.contextStrings = new Array();

// First call to PGgen for a new problem generation.
GUIWorK.fitb.firstPGgenCall = true;

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

  // Add all answer input strings
  // and any additional specified strings
  // to context.
GUIWorK.fitb.PGgen =
function PGgen(questionElt) {
    var outString = '';
    var nQuestion = getQuestionNum(questionElt);
    var stringList = new Array(); // Context strings for this question

    // If first call for a new problem generation, clear the contextStrings
    // array and tell WeBWorK to clear its strings from Context.
    if (GUIWorK.fitb.firstPGgenCall) {
      GUIWorK.fitb.contextStrings = new Array();
      outString += 'Context()->strings->are();\n';
      GUIWorK.fitb.firstPGgenCall = false;
    }

    // Compile list of new string answers, saving them so that
    // later questions will not attempt to also add them to context.
    // Throw error if any answers are blank.
    var answerElts = questionElt.getElementsByClassName("fitb_answer");
    for (var i=0; i<answerElts.length; i++) {
      var answer = answerElts[i].value;
      if (/^\s*$/.test(answer)) {
        throw "Question " + nQuestion + " has a blank answer.";
      }
      if (isNaN(answer)) {
        // If list, add all strings in list to the context
        if (GUIWorK.fitb.isList(answer)) {
	   var words = answer.split(",");
	   for (var w=0; w<words.length; w++) {
	     var execArray = /[a-zA-Z]+/.exec(words[w]);
	     if (execArray) {
	        word = execArray[0];
                if (!GUIWorK.fitb.contextStrings.includes(word)) {
	           GUIWorK.fitb.contextStrings.push(word);
		   stringList.push(word);
                }
             }
           }
	}
	else if (!GUIWorK.fitb.contextStrings.includes(answer)) {
           GUIWorK.fitb.contextStrings.push(answer);
   	   stringList.push(answer);
	}
      }
    }
    // Add any additional legal-answer strings to the list of
    // recognized answers.
    var allowableText = questionElt.getElementsByClassName("fitb_allowableText")[0].value;
    if (!(/^[,|\s]*$/.test(allowableText))) { // not merely separator chars
      if (/[^,\w\s]/.test(allowableText)) {
        throw "Question " + nQuestion + " 'Additional allowable input' box contains bad character(s).";
      }
      var additionalStringList = allowableText.split(/\s+|\s*,\s*/);
      for (var i=0; i<additionalStringList.length; i++) {
         var answer = additionalStringList[i];
         if (!GUIWorK.fitb.contextStrings.includes(answer)) {
           GUIWorK.fitb.contextStrings.push(answer);
   	   stringList.push(answer);
 	 }
      }
    }
    // Add answer strings to the context so that WeBWorK will
    // recognize them as possible answers.
    if (stringList.length > 0) {
      outString += 'Context()->strings->add(';
      for (var i=0; i<stringList.length; i++) {
        outString += stringList[i] + '=>{},'; 
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
      blankText = '[________________________________________]';
    }
    var qaPairs = questionElt.getElementsByClassName("fitb_qaPair");
    for (var i=0; i<qaPairs.length; i++) {
      var qaPair = qaPairs[i];
      outString += '*' + qaPair.getElementsByClassName("fitb_letter")[0].textContent + ")* ";
      outString += encodeLaTeXMathModePGML(qaPair.getElementsByClassName("fitb_question")[0].value);
      outString += '\n  ';
      outString += blankText;
      outString += '{';
      var rawAnswer = qaPair.getElementsByClassName("fitb_answer")[0].value;
      if (isNaN(rawAnswer)) {
        if (GUIWorK.fitb.isList(rawAnswer)) {
	  outString += "List('" + rawAnswer + "')";
	}
	else {
          outString += "String('" + rawAnswer + "')";
        }
      }
      else {
        outString += 'Real(' + rawAnswer + ')';
      }
      outString += '}\n\n';
    }    
    return outString;
  };

/******* Utilities *******/

GUIWorK.fitb.isList =
function isList(answer) {
  return /,/.test(answer);
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


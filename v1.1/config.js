/**
 * This file must be loaded before ProblemGenerator.js.

 * This defines the GUIWorK global object, the only object
 * that GUIWorK adds to the global namespace.

 * GUIWorK.config allows the user to customize various aspects of
 * GUIWorK, such as certain menus.

 * GUIWorK.QuestionType defines below an "abstract class" (interface
 * and default methods) from which the processing code for each
 * question type can inherit.

 * Each question type should add its own property to GUIWorK
 * containing all of its code and any shared variables used by this
 * code.  The property name should be the prefix name defined for the
 * question type.  So, for instance, all of the code and shared variables
 * for the multiple-choice radio button question type, prefix mcrb, should
 * be loaded as properties of the GUIWorK.mcrb object.

 */

/**
 * Global object, with basic properties (a question-type property will
 * be added later by other code for each supported question type)
 */
var GUIWorK = {
    VERSION: '1.1',
    blankQuestion: null,
    config: new Object(),
    QuestionType: new Object(),
};

/**
 Question type menu, defined on GUIWorK.config.  

 The text shown in the menu and/or the order of menu items can be
 customized.

 Prefix name of "" (empty string) displays but disables the option.
 HTML, CSS and JavaScript code for the question type is stored in
 folder having the prefix name.  

 Text of ----------- is a separator in the menu.
*/
GUIWorK.config.questionTypeMenu = 
[
  {
    text: "Question type",
    name: ""
  },
  {
    text: "Multiple choice (radio button)",
    name: "mcrb"
  },
  {
    text: "Multiple choice (drop-down)",
    name: "mcpu"
  },
  {
    text: "Fill in the blank",
    name: "fitb"
  },
  {
    text: "--------------------------",
    name: ""
  },
  {
    text: "PG/PGML (power user)",
    name: ""
  },
];

/**
 Action menu, defined on GUIWorK.config.

 The text shown in the menu and/or the order of menu items can be
 customized.

 Action name of "" (empty string) displays but disables the option.
 Action name is name of a method in ProblemGenerator.js that performs
    the specified action.

 Text of ----------- is a separator in the menu.
*/
GUIWorK.config.actionMenu = 
[
  {
    text: "Action menu",
    name: ""
  },
  {
    text: "Add a blank question immediately before this one",
    name: "addBlankBefore"
  },
  {
    text: "Add a blank question immediately after this one",
    name: "addBlankAfter"
  },
  {
    text: "Duplicate this question",
    name: "dupQuestion"
  },
  {
    text: "------------------",
    name: ""
  },
  {
    text: "Move this question earlier",
    name: ""
  },
  {
    text: "Move this question later",
    name: ""
  },
  {
    text: "------------------",
    name: ""
  },
  {
    text: "Delete this question",
    name: "delQuestion"
  },
];

// ***********
//Default functions inherited by processing code for each question type
// ***********

GUIWorK.QuestionType.prototype = new Object();

/**
 Called to allow initialization for the question type to be
 performed prior to any code being generated for questions of this type.
 Note that the init() method for a given question type will be called 
 multiple times before PGgen is called if the question type appears
 multiple times in the problem.
 No return value, does nothing by default.
*/
GUIWorK.QuestionType.prototype.init =
function init() {
};

/**
 Called to allow a question to add code to the PG (Perl variable
 initialization) portion of the generated code.
 Returns code to be added, empty string by default.
*/
GUIWorK.QuestionType.prototype.PGgen =
function PGgen(questionElt) {
  return '';
};

/**
 Called to allow a question to add code to the PGML (display) portion
 of the generated code.
 Returns code to be added, empty string by default.
*/
GUIWorK.QuestionType.prototype.PGMLgen =
function PGMLgen(questionElt) {
  return '';
};

# GUIWorK
Standalone GUI front-end for WeBWorK

Installation: Install the files where they can be accessed by a web server.

Usage: 

- Generating a problem
  1. Browse (http:, not file:) to Generate.html.
  2. Create the problem set.  The familiar $...$ and $$...$$ are used to delimit LaTeX (\$ is recognized as an escaped dollar sign).
     1. Select the type of each question from the drop-down menu.
     2. Enter information defining the question and answer as directed (or questions and answers, if there are multiple parts).
     3. Use the Action menu to create additional questions and/or delete questions.
  3. Click the Generate PGML button in order to generate WeBWorK PGML code (and HTML representing the generation page).
  4. Copy the content of the textarea beneath the Generate PGML button (click in the textarea and, in Windows, type Ctrl-A Ctrl-C)
  5. Navigate WeBWorK to a problem editing page and paste into the edit textarea (click in the textarea, Ctrl-A Ctrl-V).
  5. Submit the problem at WeBWorK.
  
- Editing an existing problem set
  1. Navigate to the edit page for a problem generated by GUIWorK.
  2. Copy the content of the edit text area.
  3. Browse to Edit.html.
  4. Paste into the textarea.
  5. Click the button.  You will be directed to the edit screen for the appropriate version of GUIWorK.
  6. Paste into the new textarea (yes, you're pasting twice for now).
  7. Click the button.
  8. You should see the page used to generate the problem.  Continue with step ii) of the generation process in order to edit the
     problem, regenerate the PGML, and update the problem in WeBWorK.
     
Adding a new question type:

- The folder mcrb contains the code for the multiple-choice (radio button) question type.  The comments in the mcrb.js code explain 
  how to create files implementing a new question type.  Other folders, such as fitb, implement other question types and can also
  be used as reference.
- Once the code has been written, add the new question type to the menu in config.js following the pattern of other question types.
- Add file imports for the new question type to ProblemGenerator.html following the pattern of other imports.

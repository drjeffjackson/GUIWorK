window.onload = (event) => {

  //Add space for the GUIWorK editor to go
  var pageBody = $("#page_body");
  pageBody.find("#editor").removeClass("span9").addClass("span4");

  //Build the GUIWorK editor
  pageBody.append(`<div id="questionDiv">
    </div>

    <form onsubmit="return false;">
      <fieldset>
	<legend>Finalize</legend>
	<label>Show partial answers to students on submit:
		<input type="checkbox" id="partial">
	</label>
	<br />
	<br />
	<button onclick="generatePGML(this);">Generate PGML code</button>
	<br />
	<br />
	<textarea id="outBox" class="outBox"></textarea>
      </fieldset>
    </form>`);
};

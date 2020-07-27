import { GUIWorK } from "./modules/Core/config.js";
import { ProblemGenerator } from "./modules/Core/ProblemGenerator.js";

(function (){
  	return new Promise(resolve => {
    	GUIWorK.init();
	})
	.then(ProblemGenerator.init(GUIWorK))
	.then((function(){
		var questionSelect = document.getElementsByClassName("questionTypeMenu")[0];
	    var actionSelect = document.getElementsByClassName("actionMenu")[0];
		questionSelect.addEventListener("change", ProblemGenerator.questionTypeMenu);
		actionSelect.addEventListener("change", ProblemGenerator.actionMenu);
	})())
})();

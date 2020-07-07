import { CreateContainer } from './builder.js';
import { ProblemGenerator } from './ProblemGenerator.js';

let myContainer = CreateContainer('myGUIWorK', document.body, 500, 500);
ProblemGenerator.init();

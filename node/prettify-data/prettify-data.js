import {Command} from "commander";
import {prettifyFile, prettifyFolder} from "./util-prettify-data.js";

const program = new Command()
	.option("--file <file>", `Input file`)
	.option("--dir <dir>", `Input directory ()`, "./data")
;

program.parse(process.argv);
const params = program.opts();

if (params.file) prettifyFile(params.file);
else prettifyFolder(params.dir);
console.log("Prettifying complete.");

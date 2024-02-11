import "../js/parser.js";
import "../js/utils.js";
import * as ut from "../node/util.js";

const _BLOCKLIST_SOURCES = new Set([
	Parser.SRC_SCREEN,
	Parser.SRC_SCREEN_WILDERNESS_KIT,
	Parser.SRC_SCREEN_DUNGEON_KIT,
	Parser.SRC_SCREEN_SPELLJAMMER,
]);

async function main () {
	console.log(`##### Validating adventure/book credits #####`);

	[
		{filename: "adventures.json", prop: "adventure"},
		{filename: "books.json", prop: "book"},
	]
		.map(({filename, prop}) => {
			const json = ut.readJson(`./data/${filename}`);

			const noCredits = json[prop]
				.filter(meta => {
					if (_BLOCKLIST_SOURCES.has(meta.source)) return false;
					return meta.contents && !meta.contents.some(it => it.name === "Credits");
				});
			if (!noCredits.length) return;

			console.error(`\nMissing "Credits" chapters in "${filename}":\n${noCredits.map(meta => `\t${meta.source}`).join("\n")}`);
		});

	return true;
}

export default main();

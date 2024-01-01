import "../js/parser.js";
import "../js/utils.js";
import * as ut from "../node/util.js";

const getClosestEntryId = stack => {
	const ent = [...stack].reverse().find(ent => ent.id);
	if (!ent) return null;
	return ent.id;
};

async function main () {
	console.log(`##### Validating adventure/book map grids #####`);

	const errors = [];
	const walker = MiscUtil.getWalker({isNoModification: true, keyBlocklist: MiscUtil.GENERIC_WALKER_ENTRIES_KEY_BLOCKLIST});
	const IMAGE_TYPES_MAP = new Set(["map", "mapPlayer"]);

	[
		{filename: "adventures.json", prop: "adventure", dir: "adventure"},
		{filename: "books.json", prop: "book", dir: "book"},
	]
		.flatMap(({filename, prop, dir}) => ut.readJson(`./data/${filename}`)[prop]
			.map(({id}) => ({filename: `./data/${dir}/${dir}-${id.toLowerCase()}.json`})))
		.forEach(({filename}) => {
			const json = ut.readJson(filename);

			const errorsFile = [];
			const stack = [];
			walker.walk(
				json,
				{
					object: (obj) => {
						if (obj.type !== "image" || !IMAGE_TYPES_MAP.has(obj.imageType)) return;

						if (obj.grid !== undefined) return;

						const closestEntryId = getClosestEntryId(stack);
						const ptsId = [
							obj.id ? `id "${obj.id}"` : "",
							obj.mapParent?.id ? `parent id "${obj.mapParent.id}"` : "",
							closestEntryId ? `closest entry id "${closestEntryId}"` : "",
						]
							.filter(Boolean)
							.join("; ");

						errorsFile.push(`${obj.title ? `"${obj.title}"` : "[Untitled]"}${ptsId ? ` (${ptsId})` : ""}`);
					},
				},
				null,
				stack,
			);
			if (!errorsFile.length) return;

			errors.push(`Found maps with no "grid" in "${filename}"\n${errorsFile.map(it => `\t${it}`).join("\n")}`);
		});

	if (errors.length) {
		errors.forEach(err => console.error(err));
		return false;
	}

	return true;
}

export default main();

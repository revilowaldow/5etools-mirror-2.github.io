import * as fs from "fs";
import "../js/parser.js";
import "../js/utils.js";
import * as ut from "../node/util.js";

class _TestTokenImages {
	static _IS_CLEAN_MM_EXTRAS = false;

	static _PATH_BASE = `./img/bestiary/tokens`;
	static _EXT = "webp";

	static _IGNORED_PREFIXES = [
		".",
		"_",
	];

	static _expected = new Set();
	static _expectedDirs = {};
	static _existing = new Set();
	static _expectedFromHashToken = {};

	static _mmTokens = null;

	static _isMmToken (filename) {
		if (!this._mmTokens) this._mmTokens = fs.readdirSync(`${this._PATH_BASE}/${Parser.sourceJsonToAbv(Parser.SRC_MM)}`).mergeMap(it => ({[it]: true}));
		return !!this._mmTokens[filename.split("/").last()];
	}

	static _readBestiaryJson () {
		fs.readdirSync("./data/bestiary")
			.filter(file => file.startsWith("bestiary") && file.endsWith(".json"))
			.forEach(file => {
				ut.readJson(`./data/bestiary/${file}`).monster
					.forEach(m => {
						const source = Parser.sourceJsonToAbv(m.source);
						const implicitTokenPath = `${this._PATH_BASE}/${source}/${Parser.nameToTokenName(m.name)}.${this._EXT}`;

						if (m.hasToken) this._expectedFromHashToken[implicitTokenPath] = true;

						if (!fs.existsSync(`${this._PATH_BASE}/${source}`)) {
							this._expectedDirs[source] = true;
							return;
						}

						this._expected.add(implicitTokenPath);

						// add tokens specified as part of variants
						if (m.variant) {
							m.variant
								.filter(it => it.token)
								.forEach(entry => this._expected.add(`${this._PATH_BASE}/${Parser.sourceJsonToAbv(entry.token.source)}/${Parser.nameToTokenName(entry.token.name)}.${this._EXT}`));
						}

						// add tokens specified as alt art
						if (m.altArt) {
							m.altArt
								.forEach(alt => this._expected.add(`${this._PATH_BASE}/${Parser.sourceJsonToAbv(alt.source)}/${Parser.nameToTokenName(alt.name)}.${this._EXT}`));
						}
					});
			});
	}

	static _readImageDirs () {
		fs.readdirSync(this._PATH_BASE)
			.filter(file => !(this._IGNORED_PREFIXES.some(it => file.startsWith(it))))
			.forEach(dir => {
				fs.readdirSync(`${this._PATH_BASE}/${dir}`)
					.forEach(file => {
						this._existing.add(`${this._PATH_BASE}/${dir.replace("(", "").replace(")", "")}/${file}`);
					});
			});
	}

	static _getIsError () {
		let isError = false;
		const results = [];
		this._expected.forEach((img) => {
			if (!this._existing.has(img)) results.push(`[ MISSING] ${img}`);
		});
		this._existing.forEach((img) => {
			delete this._expectedFromHashToken[img];
			if (!this._expected.has(img)) {
				if (this._IS_CLEAN_MM_EXTRAS && this._isMmToken(img)) {
					fs.unlinkSync(img);
					results.push(`[ !DELETE] ${img}`);
					return;
				}
				results.push(`[   EXTRA] ${img}`);
				isError = true;
			}
		});

		Object.keys(this._expectedDirs).forEach(k => results.push(`Directory ${k} doesn't exist!`));
		results
			.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
			.forEach((img) => console.warn(img));

		if (Object.keys(this._expectedFromHashToken).length) console.warn(`Declared in Bestiary data but not found:`);
		Object.keys(this._expectedFromHashToken).forEach(img => console.warn(`[MISMATCH] ${img}`));

		if (!this._expected.size && !Object.keys(this._expectedFromHashToken).length) console.log("Tokens are as expected.");

		return isError;
	}

	static run () {
		console.log(`##### Reconciling the PNG tokens against the bestiary JSON #####`);

		this._readBestiaryJson();
		this._readImageDirs();

		return this._getIsError();
	}
}

class _TestAdventureBookImages {
	static run () {
		const pathsMissing = [];

		const walker = MiscUtil.getWalker({isNoModification: true});

		const getHandler = (filename, out) => {
			const checkHref = (href) => {
				if (href?.type !== "internal") return;
				if (fs.existsSync(`./img/${href.path}`)) return;
				out.push(`${filename} :: ${href.path}`);
			};

			return (obj) => {
				if (obj.type !== "image") return;
				checkHref(obj.href);
				checkHref(obj.hrefThumbnail);
			};
		};

		[
			{filename: "adventures.json", prop: "adventure", dir: "adventure"},
			{filename: "books.json", prop: "book", dir: "book"},
		].flatMap(({filename, prop, dir}) => ut.readJson(`./data/${filename}`)[prop]
			.map(({id}) => `./data/${dir}/${dir}-${id.toLowerCase()}.json`))
			.forEach(filename => {
				walker.walk(
					ut.readJson(filename),
					{
						object: getHandler(filename, pathsMissing),
					},
				);
			});

		if (pathsMissing.length) {
			console.log(`Adventure/Book Errors:\n${pathsMissing.map(it => `\t${it}`).join("\n")}`);
			return true;
		}

		console.log(`##### Adventure/Book Image Tests Passed #####`);
		return false;
	}
}

function main () {
	if (!fs.existsSync("./img")) return true;

	if (_TestTokenImages.run()) return false;
	if (_TestAdventureBookImages.run()) return false;

	return true;
}

export default main();

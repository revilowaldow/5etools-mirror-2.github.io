import * as fs from "fs";
import * as ut from "./util.js";
import "../js/parser.js";
import "../js/utils.js";
import "../js/utils-proporder.js";

const FILE_BLOCKLIST = new Set([
	"loot.json",
	"msbcr.json",
	"monsterfeatures.json",
	"index.json",
	"life.json",
	"makecards.json",
	"renderdemo.json",
	"foundry.json",
	"makebrew-creature.json",

	"index-meta.json",
	"index-props.json",
	"index-sources.json",
	"index-timestamps.json",

	"package.json",
	"package-lock.json",
]);

const _FILE_PROP_ORDER = [
	"$schema",

	"_meta",

	// region Player options
	"class",
	"foundryClass",
	"subclass",
	"foundrySubclass",
	"classFeature",
	"foundryClassFeature",
	"subclassFeature",
	"foundrySubclassFeature",

	"optionalfeature",
	"optionalfeatureFluff",

	"background",
	"backgroundFeature",
	"backgroundFluff",

	"race",
	"subrace",
	"foundryRace",
	"foundryRaceFeature",
	"raceFluff",
	"raceFluffMeta",

	"feat",
	"foundryFeat",
	"featFluff",

	"reward",
	"rewardFluff",

	"charoption",
	"charoptionFluff",
	// endregion

	// region General entities
	"spell",
	"spellFluff",
	"foundrySpell",
	"spellList",

	"baseitem",
	"item",
	"itemGroup",
	"magicvariant",
	"itemFluff",

	"itemProperty",
	"reducedItemProperty",
	"itemType",
	"itemTypeAdditionalEntries",
	"reducedItemType",
	"itemEntry",
	"itemMastery",
	"linkedLootTables",

	"deck",
	"card",

	"deity",

	"language",
	"languageFluff",
	// endregion

	// region GM-specific
	"monster",
	"monsterFluff",
	"foundryMonster",
	"legendaryGroup",

	"object",
	"objectFluff",

	"vehicle",
	"vehicleUpgrade",
	"vehicleFluff",

	"cult",
	"boon",

	"trap",
	"trapFluff",
	"hazard",
	"hazardFluff",

	"encounter",
	"name",
	// endregion

	// region Rules
	"variantrule",
	"table",

	"condition",
	"conditionFluff",
	"disease",
	"status",

	"action",

	"skill",

	"sense",

	"citation",

	"adventure",
	"adventureData",
	"book",
	"bookData",
	// endregion

	// region Other
	"recipe",
	"recipeFluff",
	// endregion

	// region Legacy content
	"psionic",
	"psionicDisciplineFocus",
	"psionicDisciplineActive",
	// endregion

	// region Tooling
	"makebrewCreatureTrait",
	"makebrewCreatureAction",
	"monsterfeatures",
	// endregion

	// region Roll20-specific
	"roll20Spell",
	// endregion

	// region Non-brew data
	"blocklist",
	// endregion
];

const KEY_BLOCKLIST = new Set(["data", "itemTypeAdditionalEntries", "itemType", "itemProperty", "itemEntry"]);

const PROPS_TO_UNHANDLED_KEYS = {};

function getFnListSort (prop) {
	switch (prop) {
		case "spell":
		case "roll20Spell":
		case "foundrySpell":
		case "spellList":
		case "monster":
		case "foundryMonster":
		case "monsterFluff":
		case "monsterTemplate":
		case "makebrewCreatureTrait":
		case "makebrewCreatureAction":
		case "action":
		case "background":
		case "legendaryGroup":
		case "language":
		case "languageScript":
		case "name":
		case "condition":
		case "disease":
		case "status":
		case "cult":
		case "boon":
		case "feat":
		case "foundryFeat":
		case "vehicle":
		case "vehicleUpgrade":
		case "backgroundFluff":
		case "featFluff":
		case "optionalfeatureFluff":
		case "conditionFluff":
		case "spellFluff":
		case "itemFluff":
		case "languageFluff":
		case "vehicleFluff":
		case "objectFluff":
		case "raceFluff":
		case "item":
		case "baseitem":
		case "magicvariant":
		case "itemGroup":
		case "itemMastery":
		case "object":
		case "optionalfeature":
		case "psionic":
		case "reward":
		case "rewardFluff":
		case "variantrule":
		case "race":
		case "foundryRaceFeature":
		case "table":
		case "trap":
		case "trapFluff":
		case "hazard":
		case "hazardFluff":
		case "charoption":
		case "charoptionFluff":
		case "recipe":
		case "recipeFluff":
		case "sense":
		case "skill":
		case "deck":
		case "citation":
			return SortUtil.ascSortGenericEntity.bind(SortUtil);
		case "deity":
			return SortUtil.ascSortDeity.bind(SortUtil);
		case "card":
			return SortUtil.ascSortCard.bind(SortUtil);
		case "class":
		case "foundryClass":
			return (a, b) => SortUtil.ascSortDateString(Parser.sourceJsonToDate(b.source), Parser.sourceJsonToDate(a.source)) || SortUtil.ascSortLower(a.name, b.name) || SortUtil.ascSortLower(a.source, b.source);
		case "subclass":
			return (a, b) => SortUtil.ascSortDateString(Parser.sourceJsonToDate(b.source), Parser.sourceJsonToDate(a.source)) || SortUtil.ascSortLower(a.name, b.name);
		case "classFeature":
		case "foundryClassFeature":
			return (a, b) => SortUtil.ascSortLower(a.classSource, b.classSource)
				|| SortUtil.ascSortLower(a.className, b.className)
				|| SortUtil.ascSort(a.level, b.level)
				|| SortUtil.ascSortLower(a.name, b.name)
				|| SortUtil.ascSortLower(a.source, b.source);
		case "subclassFeature":
		case "foundrySubclassFeature":
			return (a, b) => SortUtil.ascSortLower(a.classSource, b.classSource)
				|| SortUtil.ascSortLower(a.className, b.className)
				|| SortUtil.ascSortLower(a.subclassSource, b.subclassSource)
				|| SortUtil.ascSortLower(a.subclassShortName, b.subclassShortName)
				|| SortUtil.ascSort(a.level, b.level)
				|| SortUtil.ascSort(a.header || 0, b.header || 0)
				|| SortUtil.ascSortLower(a.name, b.name)
				|| SortUtil.ascSortLower(a.source, b.source);
		case "subrace": return (a, b) => SortUtil.ascSortLower(a.raceName, b.raceName)
			|| SortUtil.ascSortLower(a.raceSource, b.raceSource)
			|| SortUtil.ascSortLower(a.name || "", b.name || "")
			|| SortUtil.ascSortLower(a.source, b.source);
		case "encounter":
			return SortUtil.ascSortEncounter.bind(SortUtil);
		case "adventure": return SortUtil.ascSortAdventure.bind(SortUtil);
		case "book": return SortUtil.ascSortBook.bind(SortUtil);
		case "adventureData":
		case "bookData":
			return SortUtil.ascSortBookData.bind(SortUtil);
		default: throw new Error(`Unhandled prop "${prop}"`);
	}
}

export const getPrettified = json => {
	let isModified = false;

	// region Sort keys within entities
	Object.entries(json)
		.filter(([k, v]) => !KEY_BLOCKLIST.has(k) && v instanceof Array)
		.forEach(([k, v]) => {
			if (PropOrder.hasOrder(k)) {
				PROPS_TO_UNHANDLED_KEYS[k] = PROPS_TO_UNHANDLED_KEYS[k] || new Set();

				json[k] = v.map(it => PropOrder.getOrdered(it, k, {fnUnhandledKey: uk => PROPS_TO_UNHANDLED_KEYS[k].add(uk)}));

				json[k].sort(getFnListSort(k));

				isModified = true;
				return;
			}
			console.warn(`\t\tUnhandled property: "${k}"`);
		});
	// endregion

	// region Sort file-level properties
	const keyOrder = Object.keys(json)
		.sort((a, b) => {
			const ixA = _FILE_PROP_ORDER.indexOf(a);
			const ixB = _FILE_PROP_ORDER.indexOf(b);
			return SortUtil.ascSort(~ixA ? ixA : Number.MAX_SAFE_INTEGER, ~ixB ? ixB : Number.MAX_SAFE_INTEGER);
		});
	const numUnhandledKeys = Object.keys(json).filter(it => !~_FILE_PROP_ORDER.indexOf(it));
	if (numUnhandledKeys > 1) console.warn(`\t\tUnhandled file-level properties: "${numUnhandledKeys}"`);
	if (!CollectionUtil.deepEquals(Object.keys(json), keyOrder)) {
		const nxt = {};
		keyOrder.forEach(k => nxt[k] = json[k]);
		json = nxt;
		isModified = true;
	}
	// endregion

	return {json, isModified};
};

export const prettifyFile = file => {
	console.log(`\tPrettifying ${file}...`);
	const json = ut.readJson(file);
	const {json: jsonPrettified, isModified} = getPrettified(json);
	if (isModified) fs.writeFileSync(file, CleanUtil.getCleanJson(jsonPrettified), "utf-8");
};

export const prettifyFolder = folder => {
	console.log(`Prettifying directory ${folder}...`);
	const files = ut.listFiles({dir: folder});
	files
		.filter(file => file.endsWith(".json") && !FILE_BLOCKLIST.has(file.split("/").last()))
		.forEach(file => prettifyFile(file));

	Object.entries(PROPS_TO_UNHANDLED_KEYS)
		.filter(([, set]) => set.size)
		.forEach(([prop, set]) => {
			console.warn(`Unhandled keys for data property "${prop}":`);
			set.forEach(k => console.warn(`\t${k}`));
		});
};

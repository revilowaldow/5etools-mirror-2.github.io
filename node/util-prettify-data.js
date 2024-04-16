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
	"makebrew-creature.json",
	"sources.json",
	"fluff-index.json",
	"changelog.json",

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
	"foundryOptionalfeature",

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

const KEY_BLOCKLIST = new Set([
	"data",
	"itemTypeAdditionalEntries",
	"itemType",
	"itemProperty",
	"itemEntry",
	"raceFluffMeta",
	"linkedLootTables",
]);

const PRIMITIVE_TYPES = new Set([
	"boolean",
	"number",
	"string",
]);

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
		case "foundryAction":
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
		case "foundryVehicleUpgrade":
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
		case "foundryItem":
		case "baseitem":
		case "magicvariant":
		case "foundryMagicvariant":
		case "itemGroup":
		case "itemMastery":
		case "object":
		case "optionalfeature":
		case "foundryOptionalfeature":
		case "psionic":
		case "reward":
		case "foundryReward":
		case "rewardFluff":
		case "variantrule":
		case "race":
		case "foundryRace":
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
		case "classFluff":
		case "foundryClass":
			return (a, b) => SortUtil.ascSortDateString(Parser.sourceJsonToDate(b.source), Parser.sourceJsonToDate(a.source)) || SortUtil.ascSortLower(a.name, b.name) || SortUtil.ascSortLower(a.source, b.source);
		case "subclass":
		case "subclassFluff":
		case "foundrySubclass":
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

export const getPrettified = (json, {isFoundryPrefixKeys = false} = {}) => {
	let isModified = false;

	// region Sort keys within entities
	Object.entries(json)
		.filter(([k]) => !KEY_BLOCKLIST.has(k))
		.forEach(([k, v]) => {
			if (v == null || PRIMITIVE_TYPES.has(typeof v)) return;

			const kMod = isFoundryPrefixKeys && !k.startsWith("_") ? `foundry${k.uppercaseFirst()}` : k;

			if (!PropOrder.hasOrder(kMod)) {
				console.warn(`\t\tUnhandled property: "${kMod}"`);
				return;
			}

			PROPS_TO_UNHANDLED_KEYS[kMod] = PROPS_TO_UNHANDLED_KEYS[kMod] || new Set();

			if (json[k] instanceof Array) {
				json[k] = v.map(it => PropOrder.getOrdered(
					it,
					kMod,
					{
						fnUnhandledKey: uk => {
							PROPS_TO_UNHANDLED_KEYS[kMod].add(uk);
						},
					},
				));

				json[k].sort(getFnListSort(kMod));
			} else {
				json[k] = PropOrder.getOrdered(
					v,
					kMod,
					{
						fnUnhandledKey: uk => {
							PROPS_TO_UNHANDLED_KEYS[kMod].add(uk);
						},
					},
				);
			}

			isModified = true;
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
	const {json: jsonPrettified, isModified} = getPrettified(
		json,
		{
			isFoundryPrefixKeys: file.includes("foundry.json") || file.split("/").last().startsWith("foundry-"),
		},
	);
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

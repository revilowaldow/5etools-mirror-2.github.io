import * as fs from "fs";
import "../js/parser.js";
import "../js/utils.js";
import "../js/render.js";
import * as ut from "./util.js";
import "../js/utils-generate-tables-data.js";
import "../js/utils-dataloader.js";
import "../js/hist.js";

class GenTables {
	_doLoadAdventureData () {
		return ut.readJson(`./data/adventures.json`).adventure
			.map(idx => {
				if (!GenTables.ADVENTURE_BLOCKLIST[idx.id]) {
					return {
						adventure: idx,
						adventureData: JSON.parse(fs.readFileSync(`./data/adventure/adventure-${idx.id.toLowerCase()}.json`, "utf-8")),
					};
				}
			})
			.filter(it => it);
	}

	_doLoadBookData () {
		return ut.readJson(`./data/books.json`).book
			.map(idx => {
				if (!GenTables.BOOK_BLOCKLIST[idx.id]) {
					return {
						book: idx,
						bookData: JSON.parse(fs.readFileSync(`./data/book/book-${idx.id.toLowerCase()}.json`, "utf-8")),
					};
				}
			})
			.filter(it => it);
	}

	async pRun () {
		const output = {tables: [], tableGroups: []};

		this._addBookAndAdventureData(output);
		await this._pAddClassData(output);
		await this._pAddVariantRuleData(output);
		await this._pAddBackgroundData(output);
		await this._pAddEncountersData(output);
		await this._pAddNamesData(output);

		const toSave = JSON.stringify({table: output.tables, tableGroup: output.tableGroups});
		fs.writeFileSync(`./data/generated/gendata-tables.json`, toSave, "utf-8");
		console.log("Regenerated table data.");
	}

	_addBookAndAdventureData (output) {
		const advDocs = this._doLoadAdventureData();
		const bookDocs = this._doLoadBookData();

		advDocs.forEach(doc => {
			const {
				table: foundTables,
				tableGroup: foundTableGroups,
			} = UtilGenTables.getAdventureBookTables(
				doc,
				{
					headProp: "adventure",
					bodyProp: "adventureData",
					isRequireIncludes: true,
				},
			);

			output.tables.push(...foundTables);
			output.tableGroups.push(...foundTableGroups);
		});

		bookDocs.forEach(doc => {
			const {
				table: foundTables,
				tableGroup: foundTableGroups,
			} = UtilGenTables.getAdventureBookTables(
				doc,
				{
					headProp: "book",
					bodyProp: "bookData",
				},
			);

			output.tables.push(...foundTables);
			output.tableGroups.push(...foundTableGroups);
		});
	}

	async _pAddClassData (output) {
		ut.patchLoadJson();
		const classData = await DataUtil.class.loadJSON();
		ut.unpatchLoadJson();

		classData.class.forEach(cls => {
			const {table: foundTables} = UtilGenTables.getClassTables(cls);
			output.tables.push(...foundTables);
		});

		classData.subclass.forEach(sc => {
			const {table: foundTables} = UtilGenTables.getSubclassTables(sc);
			output.tables.push(...foundTables);
		});
	}

	async _pAddVariantRuleData (output) {
		return this._pAddGenericEntityData({
			output,
			path: `./data/variantrules.json`,
			props: ["variantrule"],
		});
	}

	async _pAddBackgroundData (output) {
		return this._pAddGenericEntityData({
			output,
			path: `./data/backgrounds.json`,
			props: ["background"],
		});
	}

	async _pAddGenericEntityData (
		{
			output,
			path,
			props,
		},
	) {
		ut.patchLoadJson();
		const jsonData = await DataUtil.loadJSON(path);
		ut.unpatchLoadJson();

		props.forEach(prop => {
			jsonData[prop].forEach(it => {
				// Note that this implicitly requires each table to have a `"tableInclude"`
				const {table: foundTables} = UtilGenTables.getGenericTables(it, prop, "entries");
				output.tables.push(...foundTables);
			});
		});
	}

	// -----------------------

	async _pAddEncountersData (output) {
		return this._pAddEncounterOrNamesData({
			output,
			path: `./data/encounters.json`,
			prop: "encounter",
			fnGetNameCaption: Renderer.table.getConvertedEncounterTableName.bind(Renderer.table),
			colLabel1: "Encounter",
		});
	}

	async _pAddNamesData (output) {
		return this._pAddEncounterOrNamesData({
			output,
			path: `./data/names.json`,
			prop: "name",
			fnGetNameCaption: Renderer.table.getConvertedNameTableName.bind(Renderer.table),
			colLabel1: "Name",
		});
	}

	async _pAddEncounterOrNamesData (
		{
			output,
			path,
			prop,
			fnGetNameCaption,
			colLabel1,
		},
	) {
		ut.patchLoadJson();
		const jsonData = await DataUtil.loadJSON(path);
		ut.unpatchLoadJson();

		jsonData[prop].forEach(group => {
			group.tables.forEach(tableRaw => {
				output.tables.push(Renderer.table.getConvertedEncounterOrNamesTable({
					group,
					tableRaw,
					fnGetNameCaption,
					colLabel1,
				}));
			});
		});
	}

	// -----------------------
}
GenTables.BOOK_BLOCKLIST = {};
GenTables.ADVENTURE_BLOCKLIST = {};

const generator = new GenTables();
export default generator.pRun();

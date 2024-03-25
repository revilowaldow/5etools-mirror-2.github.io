import Handlebars from "handlebars";
import "../js/parser.js";
import "../js/utils.js";
import fs from "fs";

class _HtmlGenerator {
	static _getAttrClass (str, {classListAdditional = null} = {}) {
		const pts = [
			str,
			classListAdditional?.length ? classListAdditional.join(" ") : "",
		]
			.filter(Boolean)
			.join(" ");
		if (!pts) return null;
		return `class="${pts}"`;
	}
}

class _HtmlGeneratorListButtons extends _HtmlGenerator {
	static getBtnPreviewToggle () {
		return `<button type="button" class="ve-col-0-3 btn btn-default btn-xs p-0 lst__btn-collapse-all-previews" name="list-toggle-all-previews">[+]</button>`;
	}

	static getBtnSource () {
		return `<button type="button" class="sort btn btn-default btn-xs ve-grow" data-sort="source">Source</button>`;
	}

	/**
	 * @param {string} width
	 * @param {?string} sortIdent
	 * @param {string} text
	 * @param {?string} title
	 * @param {?boolean} isDisabled
	 * @param {?Array<string>} classListAdditional
	 * @return {string}
	 */
	static getBtn (
		{
			width,
			sortIdent = null,
			text,
			title = null,
			isDisabled = false,
			classListAdditional = null,
		},
	) {
		const attrs = [
			this._getAttrClass(`ve-col-${width} sort btn btn-default btn-xs`, {classListAdditional}),
			sortIdent ? `data-sort="${sortIdent}"` : null,
			title ? `title="${title}"` : null,
			isDisabled ? `disabled` : null,
		]
			.filter(Boolean)
			.join(" ");

		return `<button type="button" ${attrs}>${text}</button>`;
	}
}

/** @abstract */
class _PageGeneratorBase {
	_filename;
	_page;

	init () {
		this._registerPartials();
		return this;
	}

	_registerPartial ({ident, filename}) {
		Handlebars.registerPartial(ident, this.constructor._getLoadedSource({filename}));
	}

	_registerPartials () {
		this._registerPartial({ident: "head", filename: "head/template-head.hbs"});

		this._registerPartial({ident: "adRhs", filename: "ad/template-ad-rhs.hbs"});
		this._registerPartial({ident: "adLeaderboard", filename: "ad/template-ad-leaderboard.hbs"});
		this._registerPartial({ident: "adMobile1", filename: "ad/template-ad-mobile-1.hbs"});
		this._registerPartial({ident: "adFooter", filename: "ad/template-ad-footer.hbs"});

		this._registerPartial({ident: "navbar", filename: "navbar/template-navbar.hbs"});

		this._registerPartial({ident: "blank", filename: "misc/template-blank.hbs"});
	}

	/**
	 * @abstract
	 * @return {object}
	 */
	_getData () { throw new Error("Unimplemented!"); }

	generatePage () {
		const template = Handlebars.compile(this.constructor._getLoadedSource({filename: this._filename}));
		const rendered = template(this._getData())
			.split("\n")
			.map(l => l.trimEnd())
			.join("\n");
		fs.writeFileSync(this._page, rendered, "utf-8");
	}

	static _getLoadedSource ({filename}) {
		return fs.readFileSync(`./node/generate-pages/${filename}`, "utf-8");
	}
}

class _PageGeneratorListBase extends _PageGeneratorBase {
	_filename = "list/template-list.hbs";

	_page;
	_titlePage;
	_navbarTitle;
	_isFontAwesome = false;
	_stylesheets;
	_isStyleBook = false;
	_scriptIdentList;
	_scriptsUtilsAdditional;
	_scriptsPrePageAdditional;
	_isModule = false;
	_isMultisource = false;
	_btnsList;
	_btnsSublist;
	_isWrpToken;
	_onscrollPageContent;
	_styleListContainerAdditional;
	_styleContentWrapperAdditional;
	_stylePageContentAdditional;
	_isPrinterView = false;

	_registerPartials () {
		super._registerPartials();

		this._registerPartial({ident: "listListcontainer", filename: "list/template-list-listcontainer.hbs"});
		this._registerPartial({ident: "listFilterSearchGroup", filename: "list/template-list-filter-search-group.hbs"});
		this._registerPartial({ident: "listFiltertools", filename: "list/template-list-filtertools.hbs"});
		this._registerPartial({ident: "listList", filename: "list/template-list-list.hbs"});

		this._registerPartial({ident: "listContentwrapper", filename: "list/template-list-contentwrapper.hbs"});
		this._registerPartial({ident: "listSublistContainer", filename: "list/template-list-sublist-container.hbs"});
		this._registerPartial({ident: "listSublist", filename: "list/template-list-sublist.hbs"});
		this._registerPartial({ident: "listSublistsort", filename: "list/template-list-sublistsort.hbs"});
		this._registerPartial({ident: "listStatsTabs", filename: "list/template-list-stats-tabs.hbs"});
		this._registerPartial({ident: "listWrpPagecontent", filename: "list/template-list-wrp-pagecontent.hbs"});
		this._registerPartial({ident: "listRhsWrpFooterControls", filename: "list/template-list-rhs-wrp-footer-controls.hbs"});
		this._registerPartial({ident: "listRhsWrpToken", filename: "list/template-list-rhs-wrp-token.hbs"});

		this._registerPartial({ident: "listScripts", filename: "list/template-list-scripts.hbs"});
	}

	/**
	 * @return {object}
	 */
	_getData () {
		return {
			titlePage: this._titlePage,
			navbarTitle: this._navbarTitle ?? this._titlePage,
			navbarDescription: "Search by name on the left, click a name to display on the right.",
			isFontAwesome: this._isFontAwesome,
			stylesheets: this._stylesheets,
			scriptIdentList: this._scriptIdentList,
			scriptsUtilsAdditional: this._scriptsUtilsAdditional,
			scriptsPrePageAdditional: this._scriptsPrePageAdditional,
			isModule: this._isModule,
			isMultisource: this._isMultisource,
			btnsList: this._btnsList,
			btnsSublist: this._btnsSublist,
			isWrpToken: this._isWrpToken,
			onscrollPageContent: this._onscrollPageContent,
			isStyleBook: this._isStyleBook,
			styleListContainerAdditional: this._styleListContainerAdditional,
			styleContentWrapperAdditional: this._styleContentWrapperAdditional,
			stylePageContentAdditional: this._stylePageContentAdditional,
			identPartialListListcontainer: "listListcontainer",
			identPartialListContentwrapper: "listContentwrapper",
			isPrinterView: this._isPrinterView,
		};
	}
}

class _PageGeneratorListActions extends _PageGeneratorListBase {
	_page = UrlUtil.PG_ACTIONS;
	_titlePage = "Actions";
	_scriptIdentList = "actions";

	_btnsList = [
		_HtmlGeneratorListButtons.getBtnPreviewToggle(),
		_HtmlGeneratorListButtons.getBtn({width: "5-7", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "time", text: "Time"}),
		_HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		_HtmlGeneratorListButtons.getBtn({width: "8", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "time", text: "Time"}),
	];
}

class _PageGeneratorListBackgrounds extends _PageGeneratorListBase {
	_page = UrlUtil.PG_BACKGROUNDS;
	_titlePage = "Backgrounds";
	_scriptIdentList = "backgrounds";

	_btnsList = [
		_HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "6", sortIdent: "skills", text: "Skill Proficiencies"}),
		_HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		_HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "8", sortIdent: "skills", text: "Skills"}),
	];

	_isPrinterView = true;
}

class _PageGeneratorListBestiary extends _PageGeneratorListBase {
	_page = UrlUtil.PG_BESTIARY;
	_titlePage = "Bestiary";

	_stylesheets = [
		"bestiary",
		"encounterbuilder-bundle",
	];

	_scriptIdentList = "bestiary";

	_scriptsUtilsAdditional = [
		"utils-tableview.js",
	];

	_isModule = true;
	_isMultisource = true;

	_btnsList = [
		_HtmlGeneratorListButtons.getBtn({width: "4-2", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "4-1", sortIdent: "type", text: "Type"}),
		_HtmlGeneratorListButtons.getBtn({width: "1-7", sortIdent: "cr", text: "CR"}),
		_HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		_HtmlGeneratorListButtons.getBtn({width: "5", sortIdent: "name", text: "Name"}),

		_HtmlGeneratorListButtons.getBtn({width: "3-8", classListAdditional: ["best-ecgen__hidden"], sortIdent: "type", text: "Type"}),
		_HtmlGeneratorListButtons.getBtn({width: "3-8", classListAdditional: ["best-ecgen__visible"], isDisabled: true, text: "&nbsp;"}),

		_HtmlGeneratorListButtons.getBtn({width: "1-2", sortIdent: "cr", text: "CR"}),
		_HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "count", text: "Number"}),
	];

	_registerPartials () {
		super._registerPartials();

		this._registerPartial({
			ident: "listContentwrapperBestiary",
			filename: "list/template-list-contentwrapper--bestiary.hbs",
		});

		this._registerPartial({
			ident: "listSublistContainerBestiary",
			filename: "list/template-list-sublist-container--bestiary.hbs",
		});
	}

	_getData () {
		return {
			...super._getData(),
			identPartialListContentwrapper: "listContentwrapperBestiary",
		};
	}

	_isPrinterView = true;
}

class _PageGeneratorListCharCreationOptions extends _PageGeneratorListBase {
	_page = UrlUtil.PG_CHAR_CREATION_OPTIONS;
	_titlePage = "Other Character Creation Options";
	_scriptIdentList = "charcreationoptions";

	_btnsList = [
		_HtmlGeneratorListButtons.getBtn({width: "5", sortIdent: "type", text: "Type"}),
		_HtmlGeneratorListButtons.getBtn({width: "5", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		_HtmlGeneratorListButtons.getBtn({width: "5", sortIdent: "type", text: "Type"}),
		_HtmlGeneratorListButtons.getBtn({width: "7", sortIdent: "name", text: "Name"}),
	];
}

class _PageGeneratorListConditionsDiseases extends _PageGeneratorListBase {
	_page = UrlUtil.PG_CONDITIONS_DISEASES;
	_titlePage = "Conditions & Diseases";
	_scriptIdentList = "conditionsdiseases";

	_btnsList = [
		_HtmlGeneratorListButtons.getBtnPreviewToggle(),
		_HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "type", text: "Type"}),
		_HtmlGeneratorListButtons.getBtn({width: "6-7", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		_HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "type", text: "Type"}),
		_HtmlGeneratorListButtons.getBtn({width: "10", sortIdent: "name", text: "Name"}),
	];
}

class _PageGeneratorListCultsBoons extends _PageGeneratorListBase {
	_page = UrlUtil.PG_CULTS_BOONS;
	_titlePage = "Cults & Supernatural Boons";
	_scriptIdentList = "cultsboons";

	_btnsList = [
		_HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "type", text: "Type"}),
		_HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "subType", text: "Subtype"}),
		_HtmlGeneratorListButtons.getBtn({width: "6", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		_HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "type", text: "Type"}),
		_HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "subType", text: "Subtype"}),
		_HtmlGeneratorListButtons.getBtn({width: "8", sortIdent: "name", text: "Name"}),
	];
}

class _PageGeneratorListDecks extends _PageGeneratorListBase {
	_page = UrlUtil.PG_DECKS;
	_titlePage = "Decks";

	_isFontAwesome = true;

	_stylesheets = [
		"decks",
	];
	_isStyleBook = true;

	_scriptIdentList = "decks";

	_styleListContainerAdditional = "ve-flex-4";
	_styleContentWrapperAdditional = "ve-flex-7";

	_btnsList = [
		_HtmlGeneratorListButtons.getBtn({width: "10", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		_HtmlGeneratorListButtons.getBtn({width: "12", sortIdent: "name", text: "Name"}),
	];
}

class _PageGeneratorListDeities extends _PageGeneratorListBase {
	_page = UrlUtil.PG_DEITIES;
	_titlePage = "Deities";
	_scriptIdentList = "deities";

	_styleListContainerAdditional = "ve-flex-6";
	_styleContentWrapperAdditional = "ve-flex-4";

	_btnsList = [
		_HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "pantheon", text: "Pantheon"}),
		_HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "alignment", text: "Alignment"}),
		_HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "domains", text: "Domains"}),
		_HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		_HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "pantheon", text: "Pantheon"}),
		_HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "alignment", text: "Alignment"}),
		_HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "domains", text: "Domains"}),
	];
}

class _PageGeneratorListFeats extends _PageGeneratorListBase {
	_page = UrlUtil.PG_FEATS;
	_titlePage = "Feats";
	_scriptIdentList = "feats";

	_btnsList = [
		_HtmlGeneratorListButtons.getBtnPreviewToggle(),
		_HtmlGeneratorListButtons.getBtn({width: "3-5", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "3-5", sortIdent: "ability", text: "Ability"}),
		_HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "prerequisite", text: "Prerequisite"}),
		_HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		_HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "ability", text: "Ability"}),
		_HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "prerequisite", text: "Prerequisite"}),
	];

	_isPrinterView = true;
}

class _PageGeneratorListItems extends _PageGeneratorListBase {
	_page = UrlUtil.PG_ITEMS;
	_titlePage = "Items";

	_stylesheets = [
		"items",
	];

	_scriptIdentList = "items";

	_scriptsUtilsAdditional = [
		"utils-tableview.js",
	];

	_styleContentWrapperAdditional = "itm__wrp-stats";

	_btnsSublist = [
		_HtmlGeneratorListButtons.getBtn({width: "6", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "weight", text: "Weight"}),
		_HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "cost", text: "Cost"}),
		_HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "count", text: "Number"}),
	];

	_registerPartials () {
		super._registerPartials();

		this._registerPartial({
			ident: "listListcontainerItems",
			filename: "list/template-list-listcontainer--items.hbs",
		});

		this._registerPartial({
			ident: "listContentwrapperItems",
			filename: "list/template-list-contentwrapper--items.hbs",
		});

		this._registerPartial({
			ident: "listSublistContainerItems",
			filename: "list/template-list-sublist-container--items.hbs",
		});
	}

	_getData () {
		return {
			...super._getData(),
			identPartialListListcontainer: "listListcontainerItems",
			identPartialListContentwrapper: "listContentwrapperItems",
		};
	}

	_isPrinterView = true;
}

class _PageGeneratorListTrapsHazards extends _PageGeneratorListBase {
	_page = UrlUtil.PG_TRAPS_HAZARDS;
	_titlePage = "Traps & Hazards";
	_scriptIdentList = "trapshazards";

	_btnsList = [
		_HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "trapType", text: "Type"}),
		_HtmlGeneratorListButtons.getBtn({width: "7", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		_HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "trapType", text: "Type"}),
		_HtmlGeneratorListButtons.getBtn({width: "8", sortIdent: "name", text: "Name"}),
	];
}

class _PageGeneratorListRewards extends _PageGeneratorListBase {
	_page = UrlUtil.PG_REWARDS;
	_titlePage = "Supernatural Gifts & Rewards";
	_scriptIdentList = "rewards";

	_btnsList = [
		_HtmlGeneratorListButtons.getBtnPreviewToggle(),
		_HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "type", text: "Type"}),
		_HtmlGeneratorListButtons.getBtn({width: "7-7", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		_HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "type", text: "Type"}),
		_HtmlGeneratorListButtons.getBtn({width: "10", sortIdent: "name", text: "Name"}),
	];
}

class _PageGeneratorListLanguages extends _PageGeneratorListBase {
	_page = UrlUtil.PG_LANGUAGES;
	_titlePage = "Languages";
	_scriptIdentList = "languages";

	_stylesheets = [
		"languages",
	];

	_btnsList = [
		_HtmlGeneratorListButtons.getBtn({width: "6", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "type", text: "Type"}),
		_HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "script", text: "Script"}),
		_HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		_HtmlGeneratorListButtons.getBtn({width: "8", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "type", text: "Type"}),
		_HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "script", text: "Script"}),
	];
}

class _PageGeneratorListObjects extends _PageGeneratorListBase {
	_page = UrlUtil.PG_OBJECTS;
	_titlePage = "Objects";
	_scriptIdentList = "objects";

	_stylesheets = [
		"objects",
	];

	_btnsList = [
		_HtmlGeneratorListButtons.getBtn({width: "8", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "size", text: "Size"}),
		_HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		_HtmlGeneratorListButtons.getBtn({width: "9", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "size", text: "Size"}),
	];

	_isWrpToken = true;

	_onscrollPageContent = `TokenUtil.handleStatblockScroll(event, this)`;
}

class _PageGeneratorListOptionalFeatures extends _PageGeneratorListBase {
	_page = UrlUtil.PG_OPT_FEATURES;
	_titlePage = "Other Options and Features";
	_scriptIdentList = "optionalfeatures";

	_isPrinterView = true;

	_stylesheets = [
		"optionalfeatures",
	];

	_styleListContainerAdditional = "ve-flex-6";
	_styleContentWrapperAdditional = "ve-flex-4";

	_btnsList = [
		_HtmlGeneratorListButtons.getBtnPreviewToggle(),
		_HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "1-5", sortIdent: "type", text: "Type"}),
		_HtmlGeneratorListButtons.getBtn({width: "4-7", sortIdent: "prerequisite", text: "Prerequisite"}),
		_HtmlGeneratorListButtons.getBtn({width: "1", sortIdent: "level", text: "Level"}),
		_HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		_HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "type", text: "Type"}),
		_HtmlGeneratorListButtons.getBtn({width: "4-5", sortIdent: "prerequisite", text: "Prerequisite"}),
		_HtmlGeneratorListButtons.getBtn({width: "1-5", sortIdent: "level", text: "Level"}),
	];
}

class _PageGeneratorListPsionics extends _PageGeneratorListBase {
	_page = UrlUtil.PG_PSIONICS;
	_titlePage = "Psionics";
	_scriptIdentList = "psionics";

	_scriptsUtilsAdditional = [
		"utils-tableview.js",
	];

	_btnsList = [
		_HtmlGeneratorListButtons.getBtn({width: "6", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "type", text: "Type"}),
		_HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "order", text: "Order"}),
		_HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		_HtmlGeneratorListButtons.getBtn({width: "6", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "type", text: "Type"}),
		_HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "order", text: "Order"}),
	];

	_registerPartials () {
		super._registerPartials();

		this._registerPartial({
			ident: "listContentwrapperPsionics",
			filename: "list/template-list-contentwrapper--psionics.hbs",
		});
	}

	_getData () {
		return {
			...super._getData(),
			identPartialListContentwrapper: "listContentwrapperPsionics",
		};
	}
}

class _PageGeneratorListRaces extends _PageGeneratorListBase {
	_page = UrlUtil.PG_RACES;
	_titlePage = "Races";
	_scriptIdentList = "races";

	_btnsList = [
		_HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "ability", text: "Ability"}),
		_HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "size", text: "Size"}),
		_HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		_HtmlGeneratorListButtons.getBtn({width: "5", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "5", sortIdent: "ability", text: "Ability"}),
		_HtmlGeneratorListButtons.getBtn({width: "2", sortIdent: "size", text: "Size"}),
	];

	_isPrinterView = true;
}

class _PageGeneratorListRecipes extends _PageGeneratorListBase {
	_page = UrlUtil.PG_RECIPES;
	_titlePage = "Recipes";
	_scriptIdentList = "recipes";

	_stylesheets = [
		"recipes",
	];

	_isStyleBook = true;

	_styleListContainerAdditional = "ve-flex-4";
	_styleContentWrapperAdditional = "ve-flex-7";
	_stylePageContentAdditional = "recipes__tbl-recipes";

	_btnsList = [
		_HtmlGeneratorListButtons.getBtn({width: "6", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "type", text: "Category"}),
		_HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		_HtmlGeneratorListButtons.getBtn({width: "9", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "type", text: "Category"}),
	];

	_registerPartials () {
		super._registerPartials();

		this._registerPartial({
			ident: "listContentwrapperRecipes",
			filename: "list/template-list-contentwrapper--recipes.hbs",
		});
	}

	_getData () {
		return {
			...super._getData(),
			identPartialListContentwrapper: "listContentwrapperRecipes",
		};
	}
}

class _PageGeneratorListSpells extends _PageGeneratorListBase {
	_page = UrlUtil.PG_SPELLS;
	_titlePage = "Spells";
	_scriptIdentList = "spells";

	_stylesheets = [
		"spells",
	];

	_styleListContainerAdditional = "ve-flex-7";
	_styleContentWrapperAdditional = "ve-flex-5";

	_isMultisource = true;

	_scriptsUtilsAdditional = [
		"utils-tableview.js",
	];

	_btnsList = [
		_HtmlGeneratorListButtons.getBtn({width: "2-9", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "1-5", sortIdent: "level", text: "Level"}),
		_HtmlGeneratorListButtons.getBtn({width: "1-7", sortIdent: "time", text: "Time"}),
		_HtmlGeneratorListButtons.getBtn({width: "1-2", sortIdent: "school", text: "School"}),
		_HtmlGeneratorListButtons.getBtn({width: "0-6", sortIdent: "concentration", title: "Concentration", text: "C."}),
		_HtmlGeneratorListButtons.getBtn({width: "2-4", sortIdent: "range", text: "Range"}),
		_HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		_HtmlGeneratorListButtons.getBtn({width: "3-2", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "1-5", sortIdent: "level", text: "Level"}),
		_HtmlGeneratorListButtons.getBtn({width: "1-8", sortIdent: "time", text: "Time"}),
		_HtmlGeneratorListButtons.getBtn({width: "1-6", sortIdent: "school", text: "School"}),
		_HtmlGeneratorListButtons.getBtn({width: "0-7", sortIdent: "concentration", title: "Concentration", text: "C."}),
		_HtmlGeneratorListButtons.getBtn({width: "3-2", sortIdent: "range", text: "Range"}),
	];

	_registerPartials () {
		super._registerPartials();

		this._registerPartial({
			ident: "listContentwrapperSpells",
			filename: "list/template-list-contentwrapper--spells.hbs",
		});
	}

	_getData () {
		return {
			...super._getData(),
			identPartialListContentwrapper: "listContentwrapperSpells",
		};
	}
}

class _PageGeneratorListTables extends _PageGeneratorListBase {
	_page = UrlUtil.PG_TABLES;
	_titlePage = "Tables";
	_scriptIdentList = "tables";

	_styleListContainerAdditional = "ve-flex-4";
	_styleContentWrapperAdditional = "ve-flex-6";

	_btnsList = [
		_HtmlGeneratorListButtons.getBtn({width: "10", sortIdent: "sortName", text: "Name"}),
		_HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		_HtmlGeneratorListButtons.getBtn({width: "12", sortIdent: "sortName", text: "Name"}),
	];
}

class _PageGeneratorListVariantRules extends _PageGeneratorListBase {
	_page = UrlUtil.PG_VARIANTRULES;
	_titlePage = "Optional, Variant, and Expanded Rules";
	_navbarTitle = "Optional/etc. Rules";
	_scriptIdentList = "variantrules";

	_btnsList = [
		_HtmlGeneratorListButtons.getBtn({width: "7", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "ruleType", text: "Type"}),
		_HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		_HtmlGeneratorListButtons.getBtn({width: "9", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtn({width: "3", sortIdent: "ruleType", text: "Type"}),
	];
}

class _PageGeneratorListVehicles extends _PageGeneratorListBase {
	_page = UrlUtil.PG_VEHICLES;
	_titlePage = "Vehicles";
	_scriptIdentList = "vehicles";

	_stylesheets = [
		"vehicles",
	];

	_btnsList = [
		_HtmlGeneratorListButtons.getBtn({width: "6", sortIdent: "type", text: "Type"}),
		_HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "name", text: "Name"}),
		_HtmlGeneratorListButtons.getBtnSource(),
	];

	_btnsSublist = [
		_HtmlGeneratorListButtons.getBtn({width: "8", sortIdent: "type", text: "Type"}),
		_HtmlGeneratorListButtons.getBtn({width: "4", sortIdent: "name", text: "Name"}),
	];

	_isWrpToken = true;

	_onscrollPageContent = `TokenUtil.handleStatblockScroll(event, this)`;
}

const generators = [
	new _PageGeneratorListActions(),
	new _PageGeneratorListBackgrounds(),
	new _PageGeneratorListBestiary(),
	new _PageGeneratorListCharCreationOptions(),
	new _PageGeneratorListConditionsDiseases(),
	new _PageGeneratorListCultsBoons(),
	new _PageGeneratorListDecks(),
	new _PageGeneratorListDeities(),
	new _PageGeneratorListFeats(),
	new _PageGeneratorListItems(),
	new _PageGeneratorListTrapsHazards(),
	new _PageGeneratorListRewards(),
	new _PageGeneratorListLanguages(),
	new _PageGeneratorListObjects(),
	new _PageGeneratorListOptionalFeatures(),
	new _PageGeneratorListPsionics(),
	new _PageGeneratorListRaces(),
	new _PageGeneratorListRecipes(),
	new _PageGeneratorListSpells(),
	new _PageGeneratorListTables(),
	new _PageGeneratorListVariantRules(),
	new _PageGeneratorListVehicles(),
];

generators
	.map(gen => gen.init())
	.forEach(generator => generator.generatePage());

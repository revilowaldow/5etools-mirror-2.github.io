import {FilterItem} from "./filter-item.js";

export class PageFilterBase {
	static defaultSourceSelFn (val) {
		// Assume the user wants to select their loaded homebrew by default
		// Overridden by the "Deselect Homebrew Sources by Default" option
		return SourceUtil.getFilterGroup(val) === SourceUtil.FILTER_GROUP_STANDARD
			|| (SourceUtil.getFilterGroup(val) === SourceUtil.FILTER_GROUP_PARTNERED && (typeof BrewUtil2 === "undefined" || BrewUtil2.hasSourceJson(val)))
			|| SourceUtil.getFilterGroup(val) === SourceUtil.FILTER_GROUP_HOMEBREW;
	}

	constructor (opts) {
		opts = opts || {};
		this._sourceFilter = new SourceFilter(opts.sourceFilterOpts);
		this._filterBox = null;
	}

	get filterBox () { return this._filterBox; }
	get sourceFilter () { return this._sourceFilter; }

	mutateAndAddToFilters (entity, isExcluded, opts) {
		this.constructor.mutateForFilters(entity, opts);
		this.addToFilters(entity, isExcluded, opts);
	}

	static mutateForFilters (entity, opts) { throw new Error("Unimplemented!"); }
	addToFilters (entity, isExcluded, opts) { throw new Error("Unimplemented!"); }
	toDisplay (values, entity) { throw new Error("Unimplemented!"); }
	async _pPopulateBoxOptions () { throw new Error("Unimplemented!"); }

	async pInitFilterBox (opts) {
		opts = opts || {};
		await this._pPopulateBoxOptions(opts);
		this._filterBox = new FilterBox(opts);
		await this._filterBox.pDoLoadState();
		return this._filterBox;
	}

	trimState () { return this._filterBox.trimState_(); }

	// region Helpers
	static _getClassFilterItem ({className, classSource, isVariantClass, definedInSource}) {
		const nm = className.split("(")[0].trim();
		const variantSuffix = isVariantClass ? ` [${definedInSource ? Parser.sourceJsonToAbv(definedInSource) : "Unknown"}]` : "";
		const sourceSuffix = (
			SourceUtil.isNonstandardSource(classSource || Parser.SRC_PHB)
			|| (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(classSource || Parser.SRC_PHB))
			|| (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(classSource || Parser.SRC_PHB))
		)
			? ` (${Parser.sourceJsonToAbv(classSource)})` : "";
		const name = `${nm}${variantSuffix}${sourceSuffix}`;

		const opts = {
			item: name,
			userData: {
				group: SourceUtil.getFilterGroup(classSource || Parser.SRC_PHB),
			},
		};

		if (isVariantClass) {
			opts.nest = definedInSource ? Parser.sourceJsonToFull(definedInSource) : "Unknown";
			opts.userData.equivalentClassName = `${nm}${sourceSuffix}`;
			opts.userData.definedInSource = definedInSource;
		}

		return new FilterItem(opts);
	}

	static _getSubclassFilterItem ({className, classSource, subclassShortName, subclassName, subclassSource, subSubclassName, isVariantClass, definedInSource}) {
		const group = SourceUtil.isSubclassReprinted(className, classSource, subclassShortName, subclassSource) || Parser.sourceJsonToFull(subclassSource).startsWith(Parser.UA_PREFIX) || Parser.sourceJsonToFull(subclassSource).startsWith(Parser.PS_PREFIX);

		const classFilterItem = this._getClassFilterItem({
			className: subclassShortName || subclassName,
			classSource: subclassSource,
		});

		return new FilterItem({
			item: `${className}: ${classFilterItem.item}${subSubclassName ? `, ${subSubclassName}` : ""}`,
			nest: className,
			userData: {
				group,
			},
		});
	}

	static _isReprinted ({reprintedAs, tag, page, prop}) {
		return reprintedAs?.length && reprintedAs.some(it => {
			const {name, source} = DataUtil.generic.unpackUid(it?.uid ?? it, tag);
			const hash = UrlUtil.URL_TO_HASH_BUILDER[page]({name, source});
			return !ExcludeUtil.isExcluded(hash, prop, source, {isNoCount: true});
		});
	}

	static getListAliases (ent) {
		return (ent.alias || []).map(it => `"${it}"`).join(",");
	}

	static _hasFluff (ent) { return ent.hasFluff || ent.fluff?.entries; }
	static _hasFluffImages (ent) { return ent.hasFluffImages || ent.fluff?.images; }
	// endregion
}

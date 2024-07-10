import {FilterRegistry} from "../filter-registry.js";

export class FilterBase extends BaseComponent {
	/**
	 * @param opts
	 * @param opts.header Filter header (name)
	 * @param [opts.headerHelp] Filter header help text (tooltip)
	 */
	constructor (opts) {
		super();
		this._filterBox = null;

		this.header = opts.header;
		this._headerHelp = opts.headerHelp;

		this.__meta = {...this.getDefaultMeta()};
		this._meta = this._getProxy("meta", this.__meta);

		this._hasUserSavedState = false;
	}

	_getRenderedHeader () {
		return `<span ${this._headerHelp ? `title="${this._headerHelp.escapeQuotes()}" class="help-subtle"` : ""}>${this.header}</span>`;
	}

	set filterBox (it) { this._filterBox = it; }

	show () { this._meta.isHidden = false; }

	hide () { this._meta.isHidden = true; }

	getBaseSaveableState () { return {meta: {...this.__meta}}; }

	_getNextState_base () {
		return {
			[this.header]: {
				state: MiscUtil.copyFast(this.__state),
				meta: MiscUtil.copyFast(this.__meta),
			},
		};
	}

	setStateFromNextState (nxtState) {
		this._proxyAssignSimple("state", nxtState[this.header].state, true);
		this._proxyAssignSimple("meta", nxtState[this.header].meta, true);
	}

	reset ({isResetAll = false} = {}) {
		const nxtState = this._getNextState_base();
		this._mutNextState_reset(nxtState, {isResetAll});
		this.setStateFromNextState(nxtState);
	}

	_mutNextState_resetBase (nxtState, {isResetAll = false} = {}) {
		Object.assign(nxtState[this.header].meta, MiscUtil.copy(this.getDefaultMeta()));
	}

	getMetaSubHashes () {
		const compressedMeta = this._getCompressedMeta();
		if (!compressedMeta) return null;
		return [UrlUtil.packSubHash(this.getSubHashPrefix("meta", this.header), compressedMeta)];
	}

	_mutNextState_meta_fromSubHashState (nxtState, subHashState) {
		const hasMeta = this._mutNextState_meta_fromSubHashState_mutGetHasMeta(nxtState, subHashState, this.getDefaultMeta());
		if (!hasMeta) this._mutNextState_resetBase(nxtState);
	}

	_mutNextState_meta_fromSubHashState_mutGetHasMeta (nxtState, state, defaultMeta) {
		let hasMeta = false;

		Object.entries(state)
			.forEach(([k, vals]) => {
				const prop = FilterBase.getProp(k);
				if (prop !== "meta") return;

				hasMeta = true;
				const data = vals.map(v => UrlUtil.mini.decompress(v));
				Object.keys(defaultMeta).forEach((k, i) => {
					if (data[i] !== undefined) nxtState[this.header].meta[k] = data[i];
					else nxtState[this.header].meta[k] = defaultMeta[k];
				});
			});

		return hasMeta;
	}

	setBaseStateFromLoaded (toLoad) { Object.assign(this._meta, toLoad.meta); }

	getSubHashPrefix (prop, header) {
		if (FilterBase._SUB_HASH_PREFIXES[prop]) {
			const prefix = this._filterBox.getNamespacedHashKey(FilterBase._SUB_HASH_PREFIXES[prop]);
			return `${prefix}${header.toUrlified()}`;
		}
		throw new Error(`Unknown property "${prop}"`);
	}

	static getProp (prefix) {
		return Parser._parse_bToA(FilterBase._SUB_HASH_PREFIXES, prefix);
	}

	_getBtnMobToggleControls (wrpControls) {
		const btnMobToggleControls = e_({
			tag: "button",
			clazz: `btn btn-xs btn-default mobile__visible ml-auto px-3 mr-2`,
			html: `<span class="glyphicon glyphicon-option-vertical"></span>`,
			click: () => this._meta.isMobileHeaderHidden = !this._meta.isMobileHeaderHidden,
		});
		const hkMobHeaderHidden = () => {
			btnMobToggleControls.toggleClass("active", !this._meta.isMobileHeaderHidden);
			wrpControls.toggleClass("mobile__hidden", !!this._meta.isMobileHeaderHidden);
		};
		this._addHook("meta", "isMobileHeaderHidden", hkMobHeaderHidden);
		hkMobHeaderHidden();

		return btnMobToggleControls;
	}

	getChildFilters () { return []; }
	getDefaultMeta () { return {...FilterBase._DEFAULT_META}; }

	/**
	 * @param vals Previously-read filter value may be passed in for performance.
	 */
	isActive (vals) {
		vals = vals || this.getValues();
		return vals[this.header]._isActive;
	}

	_getCompressedMeta ({isStripUiKeys = false} = {}) {
		const defaultMeta = this.getDefaultMeta();
		const isAnyNotDefault = Object.keys(defaultMeta).some(k => this._meta[k] !== defaultMeta[k]);
		if (!isAnyNotDefault) return null;

		let keys = Object.keys(defaultMeta);

		if (isStripUiKeys) {
			// Always pop the trailing n keys, as these are all UI options, which we don't want to embed in @filter tags
			const popCount = Object.keys(FilterBase._DEFAULT_META).length;
			if (popCount) keys = keys.slice(0, -popCount);
		}

		// Pop keys from the end if they match the default value
		while (keys.length && defaultMeta[keys.last()] === this._meta[keys.last()]) keys.pop();

		return keys.map(k => UrlUtil.mini.compress(this._meta[k] === undefined ? defaultMeta[k] : this._meta[k]));
	}

	$render () { throw new Error(`Unimplemented!`); }
	$renderMinis () { throw new Error(`Unimplemented!`); }
	getValues ({nxtState = null} = {}) { throw new Error(`Unimplemented!`); }
	_mutNextState_reset () { throw new Error(`Unimplemented!`); }
	update () { throw new Error(`Unimplemented!`); }
	toDisplay () { throw new Error(`Unimplemented!`); }
	addItem () { throw new Error(`Unimplemented!`); }
	// N.B.: due to a bug in Chrome, these return a copy of the underlying state rather than a copy of the proxied state
	getSaveableState () { throw new Error(`Unimplemented!`); }
	setStateFromLoaded () { throw new Error(`Unimplemented!`); }
	getSubHashes () { throw new Error(`Unimplemented!`); }
	getNextStateFromSubhashState () { throw new Error(`Unimplemented!`); }
	setFromValues () { throw new Error(`Unimplemented!`); }
	handleSearch () { throw new Error(`Unimplemented`); }
	getFilterTagPart () { throw new Error(`Unimplemented`); }
	getDisplayStatePart ({nxtState = null} = {}) { throw new Error(`Unimplemented`); }
	_doTeardown () { /* No-op */ }
	trimState_ () { /* No-op */ }
}

FilterBase._DEFAULT_META = {
	isHidden: false,
	isMobileHeaderHidden: true,
};

// These are assumed to be the same length (4 characters)
FilterBase._SUB_HASH_STATE_PREFIX = "flst";
FilterBase._SUB_HASH_META_PREFIX = "flmt";
FilterBase._SUB_HASH_NESTS_HIDDEN_PREFIX = "flnh";
FilterBase._SUB_HASH_OPTIONS_PREFIX = "flop";
FilterBase._SUB_HASH_PREFIXES = {
	state: FilterBase._SUB_HASH_STATE_PREFIX,
	meta: FilterBase._SUB_HASH_META_PREFIX,
	nestsHidden: FilterBase._SUB_HASH_NESTS_HIDDEN_PREFIX,
	options: FilterBase._SUB_HASH_OPTIONS_PREFIX,
};

FilterRegistry.registerSubhashes(Object.values(FilterBase._SUB_HASH_PREFIXES));

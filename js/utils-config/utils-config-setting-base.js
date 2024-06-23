import {UtilConfigHelpers} from "./util-config-helpers.js";

// TODO rename this file

/** @abstract */
class _ConfigSettingBase {
	_groupId;
	_configId;
	_name;
	_help;

	_isRowLabel = false;

	constructor (
		{
			configId,
			name,
			help,

			isRowLabel,
		} = {},
	) {
		this._configId = configId;
		this._name = name;
		this._help = help;
		this._isRowLabel = isRowLabel;
	}

	setGroupId (groupId) { this._groupId = groupId; }

	/* -------------------------------------------- */

	render (rdState, wrpRows) {
		const tag = this._isRowLabel ? "label" : "div";

		ee`<${tag} class="py-1 w-100 split-v-center" title="${this._help.qq()}">
			${this._renderLabel(rdState)}
			${this._renderUi(rdState)}
		</${tag}>`
			.appendTo(wrpRows);
	}

	_renderLabel (rdState) {
		return `<div class="w-66 no-shrink mr-2">${this._name}</div>`;
	}

	/**
	 * @abstract
	 * @return {HTMLElementModified}
	 */
	_renderUi (rdState) { throw new Error("Unimplemented!"); }

	/* -------------------------------------------- */

	/** @abstract */
	mutDefaults (group) {
		throw new Error("Unimplemented!");
	}
}

/** @abstract */
export class ConfigSettingExternal extends _ConfigSettingBase {
	_renderUi (rdState) { return this._getEleExternal(); }

	/**
	 * @abstract
	 * @return {HTMLElementModified}
	 */
	_getEleExternal () { throw new Error("Unimplemented!"); }

	mutDefaults (group) { /* No-op */ }
}

/** @abstract */
class _ConfigSettingStandardBase extends _ConfigSettingBase {
	_default;

	constructor (opts) {
		super(opts);
		this._default = opts.default;
	}

	mutDefaults (group) {
		if (group[this._configId] !== undefined) return;
		group[this._configId] = this._default;
	}
}

export class ConfigSettingBoolean extends _ConfigSettingStandardBase {
	_renderUi (rdState) {
		const prop = UtilConfigHelpers.packSettingId(this._groupId, this._configId);
		return ComponentUiUtil.getCbBool(rdState.comp, prop);
	}
}

export class ConfigSettingEnum extends _ConfigSettingStandardBase {
	_values;
	_fnDisplay;

	constructor ({values, fnDisplay, ...rest}) {
		super(rest);
		this._values = values;
		this._fnDisplay = fnDisplay;
	}

	_renderUi (rdState) {
		const prop = UtilConfigHelpers.packSettingId(this._groupId, this._configId);

		return ComponentUiUtil.getSelEnum(
			rdState.comp,
			prop,
			{
				values: this._values,
				fnDisplay: this._fnDisplay,
			},
		);
	}
}

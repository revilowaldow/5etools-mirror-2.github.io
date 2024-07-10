export class FilterItem {
	/**
	 * An alternative to string `Filter.items` with a change-handling function
	 * @param options containing:
	 * @param options.item the item string
	 * @param [options.pFnChange] (optional) function to call when filter is changed
	 * @param [options.group] (optional) group this item belongs to.
	 * @param [options.nest] (optional) nest this item belongs to
	 * @param [options.nestHidden] (optional) if nested, default visibility state
	 * @param [options.isIgnoreRed] (optional) if this item should be ignored when negative filtering
	 * @param [options.userData] (optional) extra data to be stored as part of the item
	 */
	constructor (options) {
		this.item = options.item;
		this.pFnChange = options.pFnChange;
		this.group = options.group;
		this.nest = options.nest;
		this.nestHidden = options.nestHidden;
		this.isIgnoreRed = options.isIgnoreRed;
		this.userData = options.userData;

		this.rendered = null;
		this.searchText = null;
	}
}

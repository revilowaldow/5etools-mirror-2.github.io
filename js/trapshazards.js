"use strict";

class TrapsHazardsSublistManager extends SublistManager {
	static get _ROW_TEMPLATE () {
		return [
			new SublistCellTemplate({
				name: "Type",
				css: "col-4 ve-text-center pl-0",
				colStyle: "text-center",
			}),
			new SublistCellTemplate({
				name: "Name",
				css: "bold col-8 pr-0",
				colStyle: "",
			}),
		];
	}

	pGetSublistItem (it, hash) {
		const trapType = Parser.trapHazTypeToFull(it.trapHazType);
		const cellsText = [trapType, it.name];

		const $ele = $(`<div class="lst__row lst__row--sublist ve-flex-col">
			<a href="#${hash}" class="lst--border lst__row-inner">
				${this.constructor._getRowCellsHtml({values: cellsText})}
			</a>
		</div>`)
			.contextmenu(evt => this._handleSublistItemContextMenu(evt, listItem))
			.click(evt => this._listSub.doSelect(listItem, evt));

		const listItem = new ListItem(
			hash,
			$ele,
			it.name,
			{
				hash,
				trapType,
			},
			{
				entity: it,
				mdRow: [...cellsText],
			},
		);
		return listItem;
	}
}

class TrapsHazardsPage extends ListPage {
	constructor () {
		const pageFilter = new PageFilterTrapsHazards();

		super({
			dataSource: "data/trapshazards.json",

			pFnGetFluff: Renderer.traphazard.pGetFluff.bind(Renderer.traphazard),

			pageFilter,

			dataProps: ["trap", "hazard"],

			isMarkdownPopout: true,

			listSyntax: new ListSyntaxTrapsHazards({fnGetDataList: () => this._dataList}),
		});
	}

	getListItem (it, thI, isExcluded) {
		this._pageFilter.mutateAndAddToFilters(it, isExcluded);

		const eleLi = document.createElement("div");
		eleLi.className = `lst__row ve-flex-col ${isExcluded ? "lst__row--blocklisted" : ""}`;

		const source = Parser.sourceJsonToAbv(it.source);
		const hash = UrlUtil.autoEncodeHash(it);
		const trapType = Parser.trapHazTypeToFull(it.trapHazType);

		eleLi.innerHTML = `<a href="#${hash}" class="lst--border lst__row-inner">
			<span class="col-3 pl-0 ve-text-center">${trapType}</span>
			<span class="bold col-7">${it.name}</span>
			<span class="col-2 ve-text-center ${Parser.sourceJsonToColor(it.source)} pr-0" title="${Parser.sourceJsonToFull(it.source)}" ${Parser.sourceJsonToStyle(it.source)}>${source}</span>
		</a>`;

		const listItem = new ListItem(
			thI,
			eleLi,
			it.name,
			{
				hash,
				source,
				trapType,
			},
			{
				isExcluded,
			},
		);

		eleLi.addEventListener("click", (evt) => this._list.doSelect(listItem, evt));
		eleLi.addEventListener("contextmenu", (evt) => this._openContextMenu(evt, this._list, listItem));

		return listItem;
	}

	_renderStats_doBuildStatsTab ({ent}) {
		this._$pgContent.empty().append(RenderTrapsHazards.$getRenderedTrapHazard(ent));
	}
}

const trapsHazardsPage = new TrapsHazardsPage();
trapsHazardsPage.sublistManager = new TrapsHazardsSublistManager();
window.addEventListener("load", () => trapsHazardsPage.pOnLoad());

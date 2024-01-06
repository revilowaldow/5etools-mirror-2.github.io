"use strict";

class DeitiesSublistManager extends SublistManager {
	static get _ROW_TEMPLATE () {
		return [
			new SublistCellTemplate({
				name: "Name",
				css: "bold col-4 pl-0",
				colStyle: "",
			}),
			new SublistCellTemplate({
				name: "Pantheon",
				css: "col-2 ve-text-center",
				colStyle: "text-center",
			}),
			new SublistCellTemplate({
				name: "Alignment",
				css: "col-2 ve-text-center",
				colStyle: "text-center",
			}),
			new SublistCellTemplate({
				name: "Domains",
				css: "col-4",
				colStyle: "",
			}),
		];
	}

	pGetSublistItem (it, hash) {
		const alignment = it.alignment ? it.alignment.join("") : "\u2014";
		const domains = it.domains.join(", ");
		const cellsText = [it.name, it.pantheon, alignment, domains];

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
				pantheon: it.pantheon,
				alignment,
				domains,
			},
			{
				entity: it,
				mdRow: [...cellsText],
			},
		);
		return listItem;
	}
}

class DeitiesPage extends ListPage {
	constructor () {
		const pageFilter = new PageFilterDeities();
		super({
			dataSource: DataUtil.deity.loadJSON.bind(DataUtil.deity),

			pageFilter,

			dataProps: ["deity"],

			isMarkdownPopout: true,
		});
	}

	getListItem (ent, dtI, isExcluded) {
		this._pageFilter.mutateAndAddToFilters(ent, isExcluded);

		const eleLi = document.createElement("div");
		eleLi.className = `lst__row ve-flex-col ${isExcluded ? "lst__row--blocklisted" : ""}`;

		const source = Parser.sourceJsonToAbv(ent.source);
		const hash = UrlUtil.autoEncodeHash(ent);
		const alignment = ent.alignment ? ent.alignment.join("") : "\u2014";
		const domains = ent.domains.join(", ");

		eleLi.innerHTML = `<a href="#${hash}" class="lst--border lst__row-inner">
			<span class="bold col-3 pl-0">${ent.name}</span>
			<span class="col-2 ve-text-center">${ent.pantheon}</span>
			<span class="col-2 ve-text-center">${alignment}</span>
			<span class="col-3 ${ent.domains[0] === VeCt.STR_NONE ? `list-entry-none` : ""}">${domains}</span>
			<span class="col-2 ve-text-center ${Parser.sourceJsonToColor(ent.source)} pr-0" title="${Parser.sourceJsonToFull(ent.source)}" ${Parser.sourceJsonToStyle(ent.source)}>${source}</span>
		</a>`;

		const listItem = new ListItem(
			dtI,
			eleLi,
			ent.name,
			{
				hash,
				source,
				title: ent.title || "",
				pantheon: ent.pantheon,
				alignment,
				domains,
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
		this._$pgContent.empty().append(RenderDeities.$getRenderedDeity(ent));
	}
}

const deitiesPage = new DeitiesPage();
deitiesPage.sublistManager = new DeitiesSublistManager();
window.addEventListener("load", () => deitiesPage.pOnLoad());

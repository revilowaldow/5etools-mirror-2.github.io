"use strict";

class RewardsSublistManager extends SublistManager {
	constructor () {
		super({
			sublistClass: "subrewards",
		});
	}

	static get _ROW_TEMPLATE () {
		return [
			new SublistCellTemplate({
				name: "Type",
				css: "col-2 pl-0 ve-text-center",
				colStyle: "text-center",
			}),
			new SublistCellTemplate({
				name: "Name",
				css: "bold col-10 pr-0",
				colStyle: "",
			}),
		];
	}

	pGetSublistItem (reward, hash) {
		const cellsText = [reward.type, reward.name];

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
			reward.name,
			{
				hash,
				type: reward.type,
			},
			{
				entity: reward,
				mdRow: [...cellsText],
			},
		);
		return listItem;
	}
}

class RewardsPage extends ListPage {
	constructor () {
		const pageFilter = new PageFilterRewards();
		super({
			dataSource: DataUtil.reward.loadJSON.bind(DataUtil.reward),
			dataSourceFluff: DataUtil.rewardFluff.loadJSON.bind(DataUtil.rewardFluff),

			pFnGetFluff: Renderer.reward.pGetFluff.bind(Renderer.feat),

			pageFilter,

			listClass: "rewards",

			dataProps: ["reward"],

			isPreviewable: true,

			isMarkdownPopout: true,
		});
	}

	getListItem (reward, rwI, isExcluded) {
		this._pageFilter.mutateAndAddToFilters(reward, isExcluded);

		const eleLi = document.createElement("div");
		eleLi.className = `lst__row ve-flex-col ${isExcluded ? "lst__row--blocklisted" : ""}`;

		const source = Parser.sourceJsonToAbv(reward.source);
		const hash = UrlUtil.autoEncodeHash(reward);

		eleLi.innerHTML = `<a href="#${hash}" class="lst--border lst__row-inner">
			<span class="col-0-3 px-0 ve-flex-vh-center lst__btn-toggle-expand ve-self-flex-stretch">[+]</span>
			<span class="col-2 ve-text-center px-1">${reward.type}</span>
			<span class="bold col-7-7">${reward.name}</span>
			<span class="col-2 ve-text-center ${Parser.sourceJsonToColor(reward.source)} pr-0" title="${Parser.sourceJsonToFull(reward.source)}" ${Parser.sourceJsonToStyle(reward.source)}>${source}</span>
		</a>
		<div class="ve-flex ve-hidden relative lst__wrp-preview">
			<div class="vr-0 absolute lst__vr-preview"></div>
			<div class="ve-flex-col py-3 ml-4 lst__wrp-preview-inner"></div>
		</div>`;

		const listItem = new ListItem(
			rwI,
			eleLi,
			reward.name,
			{
				hash,
				source,
				type: reward.type,
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
		this._$pgContent.empty().append(RenderRewards.$getRenderedReward(ent));
	}
}

const rewardsPage = new RewardsPage();
rewardsPage.sublistManager = new RewardsSublistManager();
window.addEventListener("load", () => rewardsPage.pOnLoad());

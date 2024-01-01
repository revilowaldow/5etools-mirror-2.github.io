"use strict";

class _ParseStateTextFeat extends BaseParseStateText {

}

class FeatParser extends BaseParserFeature {
	/**
	 * Parses feats from raw text pastes
	 * @param inText Input text.
	 * @param options Options object.
	 * @param options.cbWarning Warning callback.
	 * @param options.cbOutput Output callback.
	 * @param options.isAppend Default output append mode.
	 * @param options.source Entity source.
	 * @param options.page Entity page.
	 * @param options.titleCaseFields Array of fields to be title-cased in this entity (if enabled).
	 * @param options.isTitleCase Whether title-case fields should be title-cased in this entity.
	 */
	static doParseText (inText, options) {
		options = this._getValidOptions(options);

		const {toConvert, entity: feat} = this._doParse_getInitialState(inText, options);
		if (!toConvert) return;

		const state = new _ParseStateTextFeat({toConvert, options, entity: feat});

		state.doPreLoop();
		for (; state.ixToConvert < toConvert.length; ++state.ixToConvert) {
			state.initCurLine();
			if (state.isSkippableCurLine()) continue;

			switch (state.stage) {
				case "name": this._doParseText_stepName(state); state.stage = "entries"; break;
				case "entries": this._doParseText_stepEntries(state, options); break;
				default: throw new Error(`Unknown stage "${state.stage}"`);
			}
		}
		state.doPostLoop();

		if (!feat.entries.length) delete feat.entries;
		else {
			this._mutMergeHangingListItems(feat, options);
			this._setAbility(feat, options);
		}

		const statsOut = this._getFinalState(state, options);

		options.cbOutput(statsOut, options.isAppend);
	}

	static _doParseText_stepName (state) {
		state.entity.name = this._getAsTitle("name", state.curLine, state.options.titleCaseFields, state.options.isTitleCase);
	}

	static _doParseText_stepEntries (state, options) {
		// prerequisites
		if (/^prerequisite:/i.test(state.curLine)) {
			state.entity.entries = [
				{
					name: "Prerequisite:",
					entries: [
						state.curLine
							.replace(/^prerequisite:/i, "")
							.trim(),
					],
				},
			];
			state.ixToConvert++;
			state.initCurLine();
		}

		const ptrI = {_: state.ixToConvert};
		const entries = EntryConvert.coalesceLines(
			ptrI,
			state.toConvert,
		);
		state.ixToConvert = ptrI._;

		state.entity.entries = [
			...(state.entity.entries || []),
			...entries,
		];
	}

	static _getFinalState (state, options) {
		this._doFeatPostProcess(state, options);
		return PropOrder.getOrdered(state.entity, state.entity.__prop || "feat");
	}

	// SHARED UTILITY FUNCTIONS ////////////////////////////////////////////////////////////////////////////////////////
	static _doFeatPostProcess (state, options) {
		TagCondition.tryTagConditions(state.entity);
		if (state.entity.entries) {
			state.entity.entries = state.entity.entries.map(it => DiceConvert.getTaggedEntry(it));
			EntryConvert.tryRun(state, "entries");
			this._doPostProcess_setPrerequisites(state, options);
			state.entity.entries = SkillTag.tryRun(state.entity.entries);
			state.entity.entries = ActionTag.tryRun(state.entity.entries);
			state.entity.entries = SenseTag.tryRun(state.entity.entries);
		}
	}

	// SHARED PARSING FUNCTIONS ////////////////////////////////////////////////////////////////////////////////////////
	static _mutMergeHangingListItems (feat, options) {
		const ixStart = feat.entries.findIndex(ent => typeof ent === "string" && /(?:following|these) benefits:$/.test(ent));
		if (!~ixStart) return;

		let list;
		for (let i = ixStart + 1; i < feat.entries.length; ++i) {
			const ent = feat.entries[i];
			if (ent.type !== "entries" || !ent.name || !ent.entries?.length) break;

			if (!list) list = {type: "list", style: "list-hang-notitle", items: []};

			list.items.push({
				...ent,
				type: "item",
			});
			feat.entries.splice(i, 1);
			--i;
		}

		if (!list?.items?.length) return;

		feat.entries.splice(ixStart + 1, 0, list);
	}

	static _setAbility (feat, options) {
		const walker = MiscUtil.getWalker({
			keyBlocklist: MiscUtil.GENERIC_WALKER_ENTRIES_KEY_BLOCKLIST,
			isNoModification: true,
		});
		walker.walk(
			feat.entries,
			{
				object: (obj) => {
					if (obj.type !== "list") return;

					const str = typeof obj.items[0] === "string" ? obj.items[0] : obj.items[0].entries?.[0];
					if (typeof str !== "string") return;

					if (/^increase your/i.test(str)) {
						const abils = [];
						str.replace(/(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)/g, (...m) => {
							abils.push(m[1].toLowerCase().slice(0, 3));
						});

						if (abils.length === 1) {
							feat.ability = [{[abils[0]]: 1}];
						} else {
							feat.ability = [
								{
									choose: {
										from: abils,
										amount: 1,
									},
								},
							];
						}

						obj.items.shift();
					} else if (/^increase (?:one|an) ability score of your choice by 1/i.test(str)) {
						feat.ability = [
							{
								choose: {
									from: [...Parser.ABIL_ABVS],
									amount: 1,
								},
							},
						];

						obj.items.shift();
					}
				},
			},
		);
	}
}

globalThis.FeatParser = FeatParser;

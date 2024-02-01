class BaseParserFeature extends BaseParser {
	static _doParse_getInitialState (inText, options) {
		if (!inText || !inText.trim()) {
			options.cbWarning("No input!");
			return {};
		}

		const toConvert = this._getCleanInput(inText, options)
			.split("\n")
			.filter(it => it && it.trim());

		const entity = {};
		entity.source = options.source;
		// for the user to fill out
		entity.page = options.page;

		return {toConvert, entity};
	}

	static _doPostProcess_setPrerequisites (state, options) {
		const [entsPrereq, entsRest] = state.entity.entries.segregate(ent => ent.name === "Prerequisite:");
		if (!entsPrereq.length) return;

		if (entsPrereq.length > 1) {
			options.cbWarning(`(${state.entity.name}) Prerequisites requires manual conversion`);
			return;
		}

		const [entPrereq] = entsPrereq;
		if (entPrereq.entries.length > 1 || (typeof entPrereq.entries[0] !== "string")) {
			options.cbWarning(`(${state.entity.name}) Prerequisites requires manual conversion`);
			return;
		}
		const [entPrereqString] = entPrereq.entries;

		state.entity.entries = entsRest;

		const pres = [];
		const tokens = ConvertUtil.getTokens(entPrereqString);

		let tkStack = [];

		const handleStack = () => {
			if (!tkStack.length) return;

			const joinedStack = tkStack.join(" ").trim();

			const parts = joinedStack.split(StrUtil.COMMA_SPACE_NOT_IN_PARENTHESES_REGEX);

			const pre = {};

			parts.forEach(pt => {
				pt = pt.trim();

				if (/^the ability to cast at least one spell$/i.test(pt)) return pre.spellcasting = true;

				if (/^spellcasting$/i.test(pt)) return pre.spellcasting2020 = true;
				if (/^pact magic feature$/i.test(pt)) return pre.spellcasting2020 = true;

				if (/^spellcasting feature$/i.test(pt)) return pre.spellcastingFeature = true;
				if (/^spellcasting feature from a class that prepares spells$/i.test(pt)) return pre.spellcastingPrepared = true;

				if (/proficiency with a martial weapon/i.test(pt)) {
					pre.proficiency = pre.proficiency || [{}];
					pre.proficiency[0].weapon = "martial";
					return;
				}

				if (/Martial Weapon Proficiency/i.test(pt)) {
					pre.proficiency = pre.proficiency || [{}];
					pre.proficiency[0].weaponGroup = "martial";
					return;
				}

				const mLevel = /^(?<level>\d+).. level$/i.exec(pt);
				if (mLevel) return pre.level = Number(mLevel.groups.level);

				const mFeat = /^(?<name>.*?) feat$/i.exec(pt);
				if (mFeat) {
					pre.feat ||= [];
					const rawFeat = mFeat.groups.name.toLowerCase().trim();

					const [ptName, ptSpecifier] = rawFeat.split(/ \(([^)]+)\)$/);
					if (!ptSpecifier) return pre.feat.push(`${rawFeat}|${state.entity.source.toLowerCase()}`);

					return pre.feat.push(`${ptName}|${state.entity.source.toLowerCase()}|${rawFeat}`);
				}

				const mBackground = /^(?<name>.*?) background$/i.exec(pt);
				if (mBackground) {
					const name = mBackground.groups.name.trim();
					return (pre.background = pre.background || []).push({
						name,
						displayEntry: `{@background ${name}}`,
					});
				}

				const mAlignment = /^(?<align>.*?) alignment/i.exec(pt);
				if (mAlignment) {
					const {alignment} = AlignmentUtil.tryGetConvertedAlignment(mAlignment.groups.align);
					if (alignment) {
						pre.alignment = alignment;
						return;
					}
				}

				const mCampaign = /^(?<name>.*)? Campaign$/i.exec(pt);
				if (mCampaign) {
					return (pre.campaign = pre.campaign || []).push(mCampaign.groups.name);
				}

				const mClass = new RegExp(`^${ConverterConst.STR_RE_CLASS}(?: class)?$`, "i").exec(pt);
				if (mClass) {
					return pre.level = {
						level: 1,
						class: {
							name: mClass.groups.name,
							visible: true,
						},
					};
				}

				pre.other = pt;
				options.cbWarning(`(${state.entity.name}) Prerequisite "${pt}" requires manual conversion`);
			});

			if (Object.keys(pre).length) pres.push(pre);

			tkStack = [];
		};

		for (const tk of tokens) {
			if (tk === "or") {
				handleStack();
				continue;
			}
			tkStack.push(tk);
		}
		handleStack();

		if (!pres.length) return;

		const presDeduped = [];
		pres.forEach(pre => {
			if (presDeduped.some(it => CollectionUtil.deepEquals(pre, it))) return;
			presDeduped.push(pre);
		});

		state.entity.prerequisite = presDeduped;
	}
}

globalThis.BaseParserFeature = BaseParserFeature;

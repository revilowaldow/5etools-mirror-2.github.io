"use strict";

class RenderRaces {
	static $getRenderedRace (race) {
		const renderer = Renderer.get().setFirstSection(true);

		const ptHeightWeight = RenderRaces._getHeightAndWeightPart(race);

		return $$`
		${Renderer.utils.getBorderTr()}
		${Renderer.utils.getExcludedTr({entity: race, dataProp: "race"})}
		${Renderer.utils.getNameTr(race, {controlRhs: race.soundClip ? RenderRaces._getPronunciationButton(race) : "", page: UrlUtil.PG_RACES})}
		<tr><td colspan="6"><b>Ability Scores:</b> ${(race.ability ? Renderer.getAbilityData(race.ability) : {asText: "None"}).asText}</td></tr>
		${(race.creatureTypes || []).filter(it => `${it}`.toLowerCase() !== "humanoid").length ? `<tr><td colspan="6"><b>Creature Type:</b> ${Parser.raceCreatureTypesToFull(race.creatureTypes)}</td></tr>` : ""}
		<tr><td colspan="6"><b>Size:</b> ${Renderer.utils.getRenderedSize(race.size || [Parser.SZ_VARIES])}</td></tr>
		<tr><td colspan="6"><b>Speed:</b> ${Parser.getSpeedString(race)}</td></tr>
		<tr><td class="divider" colspan="6"><div></div></td></tr>
		${race._isBaseRace ? `<tr class="text"><td colspan="6">${renderer.render({type: "entries", entries: race._baseRaceEntries}, 1)}</td></tr>` : `<tr class="text"><td colspan="6">${renderer.render({type: "entries", entries: race.entries}, 1)}</td></tr>`}

		${race.traitTags && race.traitTags.includes("NPC Race") ? `<tr class="text"><td colspan="6"><section class="text-muted">
			${renderer.render(`{@note Note: This race is listed in the {@i Dungeon Master's Guide} as an option for creating NPCs. It is not designed for use as a playable race.}`, 2)}
		 </section></td></tr>` : ""}

		${ptHeightWeight ? $$`<tr class="text"><td colspan="6"><hr class="rd__hr">${ptHeightWeight}</td></tr>` : ""}

		${Renderer.utils.getPageTr(race, {tag: "race", fnUnpackUid: (uid) => DataUtil.generic.unpackUid(uid, "race")})}
		${Renderer.utils.getBorderTr()}`;
	}

	static _getPronunciationButton (race) {
		return `<button class="btn btn-xs btn-default btn-name-pronounce ml-2 mb-2 ve-self-flex-end">
			<span class="glyphicon glyphicon-volume-up name-pronounce-icon"></span>
			<audio class="name-pronounce" preload="none">
			   <source src="${Renderer.utils.getEntryMediaUrl(race, "soundClip", "audio")}" type="audio/mpeg">
			</audio>
		</button>`;
	}

	static _getHeightAndWeightPart (race) {
		const outer = Renderer.race.getHeightAndWeightPart(race);
		if (!outer) return null;
		const ele = e_({outer});
		Renderer.race.bindListenersHeightAndWeight(race, ele);
		return ele;
	}
}

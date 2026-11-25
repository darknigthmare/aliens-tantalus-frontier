// V188 — the empty ECHO-8 locker in the cryo bay (bible §4 P-1, ship-cryo
// "Le casier vide", §8). A sealed locker drawn with primitives (no bitmap);
// E nearby reads what the campaign has established so far. It never moves
// actors, opens doors or grants anything.

export const ECHO8_LOCKER_V188 = Object.freeze({ deck: 0, roomId: 'cryo-bay', x: 3920, reach: 70, w: 46, h: 112, floorY: 624 });

const NOTES = Object.freeze([
  Object.freeze({ id: 'sealed', when: () => true,
    fr: 'Casier ECHO-8 vidé et scellé. Abordage de la station Asphodèle il y a trente et une heures ; contact perdu à la sixième.',
    en: 'ECHO-8 locker emptied and sealed. Boarded Asphodèle station thirty-one hours ago; contact lost at hour six.' }),
  Object.freeze({ id: 'quarantine', when: save => (save?.storyCampaignV188?.cinematicsSeen || []).includes('cin-02'),
    fr: 'Le code de quarantaine rouge vient d’Asphodèle. Echo-8 est monté voir.',
    en: 'The red quarantine code comes from Asphodèle. Echo-8 went up to look.' }),
  Object.freeze({ id: 'signature', when: save => (save?.storyCampaignV188?.cinematicsSeen || []).includes('cin-20-rook'),
    fr: 'La priorité cargaison de QZ-18 a été autorisée depuis Asphodèle, la station où Echo-8 a disparu.',
    en: 'The QZ-18 cargo priority was authorised from Asphodèle, the station where Echo-8 vanished.' }),
  // V188 spec 007 (bible §7.4): Kessler's tag, brought back from S3 and placed here; [PROPOSÉ] texts (§7.6).
  Object.freeze({ id: 'kessler-tag', when: save => save?.asphodeleHubV188?.kesslerTag === 'locker',
    fr: 'La plaque du sergent Dario Kessler pend au crochet du casier. Echo-8 a tenu six heures et a barricadé les survivants avant de sortir.',
    en: 'Sergeant Dario Kessler’s tag hangs from the locker hook. Echo-8 held for six hours and barricaded the survivors before going out.' }),
  Object.freeze({ id: 'last-round', when: save => (save?.galaxy?.completedCampaignIds || []).includes('station-a-echo8'),
    fr: 'Dernière ronde d’Echo-8 suivie jusqu’au bout : l’enregistrement complet est au dossier de l’équipe.',
    en: 'Echo-8’s last round followed to the end: the full recording is in the team file.' })
]);

/** Pure: the notes the player can read now, oldest first ([PROPOSÉ] texts, bible §56.7). */
export function echo8LockerNotesV188(save, language = 'fr') {
  return NOTES.filter(note => note.when(save)).map(note => ({ id: note.id, text: note[language === 'en' ? 'en' : 'fr'] }));
}

export function withHubEcho8LockerV188(Base) {
  if (Base.hubEcho8LockerV188) return Base;
  return class HubEcho8LockerV188 extends Base {
    static hubEcho8LockerV188 = true;
    echo8LockerContactV188() {
      const locker = ECHO8_LOCKER_V188;
      if (!this.running || !this.player?.alive || this.forgeSessionV141 || this.state?.deck !== locker.deck || this.isAnnexActiveV71?.()) return null;
      if (this.onboardingActiveV84?.() && this.onboardingV84?.phase === 'wake') return null;
      if (this.currentRoom?.()?.id !== locker.roomId) return null;
      const center = this.player.x + this.player.w / 2;
      return Math.abs(center - (locker.x + locker.w / 2)) <= locker.reach ? { action: 'story:echo8-locker', roomId: locker.roomId } : null;
    }
    interact() {
      const contact = this.echo8LockerContactV188();
      if (contact) { this.onAction?.(contact); return; }
      return super.interact();
    }
    // Drawn with the room props, before crew and player, so actors pass in front.
    drawInteractionProp(ctx, room) {
      const result = super.drawInteractionProp(ctx, room);
      if (!ctx || room?.id !== ECHO8_LOCKER_V188.roomId || this.forgeSessionV141 || this.state?.deck !== ECHO8_LOCKER_V188.deck) return result;
      const { x, w, h, floorY } = ECHO8_LOCKER_V188, top = floorY - h;
      ctx.save();
      ctx.fillStyle = '#1d2a2e'; ctx.fillRect(x, top, w, h);
      ctx.strokeStyle = '#3e5157'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, top + 1, w - 2, h - 2);
      ctx.fillStyle = '#2b3b40'; for (let i = 0; i < 4; i++) ctx.fillRect(x + 8, top + 22 + i * 6, w - 16, 2); // vents
      ctx.fillStyle = '#d8e6d8'; ctx.font = '700 9px monospace'; ctx.textAlign = 'center'; ctx.fillText('ECHO-8', x + w / 2, top + 13);
      ctx.strokeStyle = '#e9d07a'; ctx.lineWidth = 3; ctx.beginPath();
      ctx.moveTo(x + 4, top + 50); ctx.lineTo(x + w - 4, top + 94); ctx.moveTo(x + w - 4, top + 50); ctx.lineTo(x + 4, top + 94); ctx.stroke();
      if (this.kesslerTagInLockerV188) { // V188 spec 007: the tag on its chain, hung from the locker's label plate
        ctx.strokeStyle = '#c9ccc4'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + w / 2, top + 16); ctx.lineTo(x + w / 2 - 4, top + 34); ctx.lineTo(x + w / 2 + 4, top + 34); ctx.closePath(); ctx.stroke();
        ctx.fillStyle = '#dfe3da'; ctx.fillRect(x + w / 2 - 7, top + 34, 14, 9); ctx.fillStyle = '#5a5f58'; ctx.fillRect(x + w / 2 - 5, top + 37, 10, 1); ctx.fillRect(x + w / 2 - 5, top + 40, 7, 1);
      }
      if (this.echo8LockerContactV188()) { ctx.fillStyle = '#8df0b0'; ctx.font = '11px monospace'; ctx.fillText('E · CASIER ECHO-8', x + w / 2, top - 10); }
      ctx.restore();
      return result;
    }
  };
}

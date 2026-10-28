const detail = (id, roomId, kind, purpose, x, y, w, h, note) => Object.freeze({
  id, roomId, kind, purpose, bounds: Object.freeze({ x, y, w, h }),
  mount: 'rear-wall', note
});

/** Twenty-five industrial wall installations, each assigned to its real
 * compartment task. Coordinates are local to the compartment. Their complete
 * mounted bounds avoid the measured native furnishings and architecture;
 * the range additions all remain behind its firing line. */
export const HUB_INDUSTRIAL_DETAILS_V168 = Object.freeze([
  detail('T168-I01', 'science-lab', 'lab-sample-rack', 'sealed-sample-transfer-rack',
    608, 270, 88, 44,
    'Beside the observation window, above the preparation zone; sealed containers never cover the viewport.'),
  detail('T168-I02', 'science-lab', 'hazard-monitor', 'analysis-bench-condition-readout',
    160, 278, 72, 44,
    'Left wall above the sample cold store, separate from the glass and the specimen preparation counter.'),
  detail('T168-I03', 'science-lab', 'sterile-cabinet', 'clean-sample-handling-consumables',
    512, 432, 72, 64,
    'Closed sterile supply above the existing mobile preparation station, clear of its worktop and catwalk stock.'),

  detail('T168-I04', 'quarantine', 'hygiene-dispenser', 'quarantine-glove-and-wipe-dispenser',
    160, 278, 56, 48,
    'Clean supply on the left wall, outside the observation glass and both the room entry and annex doorway.'),
  detail('T168-I05', 'quarantine', 'air-filter', 'negative-pressure-prefilter-service',
    624, 270, 88, 52,
    'Filter access occupies the narrow service bay between the viewport and the existing extraction equipment.'),
  detail('T168-I06', 'quarantine', 'oxygen-locker', 'sealed-escape-breathing-set',
    496, 412, 56, 72,
    'Sealed breathing reserve beside the decontamination access; elevated clear of the door and standing lane.'),

  detail('T168-I07', 'armory', 'ammo-shelf', 'segregated-issue-ammunition',
    392, 270, 80, 48,
    'Secure boxed ammunition mounted beyond the viewport and above the armourer issue side of the room.'),
  detail('T168-I08', 'armory', 'weapons-cleaning', 'armorer-cleaning-and-clearing-kit',
    536, 270, 112, 40,
    'Wall tools occupy their own bay beside the ammunition stock, away from the counter and route signage.'),
  detail('T168-I09', 'armory', 'electrical-isolator', 'weapons-bench-test-power-isolation',
    544, 402, 64, 56,
    'Test-power isolation above the armourer chest, between the annex doorway and the issue-record stock.'),

  detail('T168-I10', 'workshop', 'tool-board', 'repair-bench-outline-tools',
    160, 270, 96, 64,
    'Bolted tool silhouettes on the left repair wall; neither the observation glass nor a floor worktop is covered.'),
  detail('T168-I11', 'workshop', 'parts-bins', 'fastener-and-service-fittings-stock',
    656, 246, 96, 52,
    'Labelled small-parts bins use the bay below the room sign and above the existing electrical service panel.'),
  detail('T168-I12', 'workshop', 'battery-charger', 'tool-battery-charging-station',
    824, 390, 72, 48,
    'A dedicated charging dock below the utility panel, away from the bench stock and its useful surface.'),

  detail('T168-I13', 'vehicle-bay', 'hydraulic-accumulator', 'vehicle-jack-hydraulic-reserve',
    392, 246, 64, 72,
    'Hydraulic service on the free wall return beside the viewport, entirely above the parked vehicle silhouette.'),
  detail('T168-I14', 'vehicle-bay', 'pressure-gauges', 'vehicle-service-pressure-check',
    944, 258, 72, 40,
    'Pressure instruments on the right service wall, separate from the ceiling feeds and inspection stock.'),
  detail('T168-I15', 'vehicle-bay', 'service-conduits', 'vehicle-tool-air-line-return',
    928, 316, 112, 28,
    'A compact fixed return line below the gauges and above the existing service supplies; no loose floor hose.'),

  detail('T168-I16', 'logistics', 'cargo-manifest', 'freight-route-and-load-checklists',
    288, 270, 72, 48,
    'Route records on the inbound freight wall above the packing-tools area, clear of all cargo approach volumes.'),
  detail('T168-I17', 'logistics', 'muster-kit', 'cargo-team-restraint-and-response-kit',
    1040, 246, 80, 48,
    'Closed handling-team safety stock on the upper central bay; no additional freight obstructs the floor.'),
  detail('T168-I18', 'logistics', 'emergency-cabinet', 'freight-bay-fire-response-stock',
    1544, 278, 48, 72,
    'A narrow emergency locker on the right handling wall, outside the entrance and the raised-deck geometry.'),
  detail('T168-I19', 'logistics', 'flight-kit', 'outbound-flight-restraint-kit',
    1216, 412, 80, 52,
    'Packed restraint equipment in the free wall pocket next to freight records, above the working deck and crates.'),

  detail('T168-I20', 'bioforge', 'lab-sample-rack', 'sealed-entry-sample-container-rack',
    232, 278, 88, 44,
    'Closed transfer containers in the existing entry compartment, clear of the tall pipe and cargo storage.'),
  detail('T168-I21', 'bioforge', 'hygiene-dispenser', 'biological-entry-cleaning-dispenser',
    712, 270, 56, 48,
    'A clean-handling dispenser between the native service fixture and the upper sign; no new biological room is implied.'),
  detail('T168-I22', 'bioforge', 'hazard-monitor', 'entry-containment-differential-readout',
    1504, 278, 72, 44,
    'Containment readout on the right clean-entry bay, separate from pipework and the real return doorway.'),

  detail('T168-I23', 'proving-ground', 'medical-stock', 'range-first-response-and-eye-care-stock',
    232, 278, 80, 52,
    'First-response supplies on the wall behind the muzzle and target field, above the preparation equipment.'),
  detail('T168-I24', 'proving-ground', 'clock-bank', 'range-session-reference-timers',
    704, 270, 80, 40,
    'Fixed session clocks remain left of the muzzle, distinct from the nine active target silhouettes and their suspension paths.'),
  detail('T168-I25', 'proving-ground', 'weapons-cleaning', 'unloaded-weapon-cleaning-kit',
    352, 438, 112, 40,
    'Unloaded-weapon care tools below the left service fixture and behind the firing pad; no object occupies a shot ray.')
]);

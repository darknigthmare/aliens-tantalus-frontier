# Enemy 034 — Caravan Stalker production review

Built-in OpenAI ImageGen only: eleven real generation/edit calls. Four active boards provide 32 candidate poses; seven superseded PNG boards are preserved under rejected/.

| Clip | Generation receipt | Source SHA-256 | Technical source status |
| --- | --- | --- | --- |
| idle | content-addressed, provider ID not returned | f5c433b58c5c91bc3495358a8fb8fcbaf8c76ebe667fa8f7276382ddbb45a9dd | 8/8 strict; all-quadrupedal continuity; no border clue |
| move | content-addressed, provider ID not returned | 835a98fe4418ffc99c88cd1336d778df7849c266fb61eb4ebbe91c1e617b1deb | 8/8 strict; complete low run |
| attack | content-addressed, provider ID not returned | 1bc3f0bffe5bfa929d075c11b5b39734d1396a093673ce04d7f21f740b3aa820 | 8/8 strict; brief rear and four-foot recovery |
| death | content-addressed, provider ID not returned | 6af6176aaf5f7f2e4cd8a930e0c963b539b829d65d3b6dd948ebfe318a56ac9d | 8/8 strict; irreversible collapse |

The exact selected prompts and the two final idle correction prompts are preserved locally. The generated-image tool exposed image payloads but no provider generation IDs for these calls, so receipts state that limitation and bind each selected source by SHA-256 rather than inventing an external identifier.

Technical extraction, right-facing review and the measured cranial scale correction are complete. Physical roots, normalized playback, loop seams, hitbox timing, artistic acceptance and runtime integration remain separate gates.

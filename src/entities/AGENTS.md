# Entities

Entities represent runtime actors.

Examples:

- Player
- Enemy
- Boss

Entities own their runtime state.

They should not contain:

- menu navigation
- dialogue scripts
- save/load implementation
- stage progression
- large amounts of content definitions

---

## Player

Player is universal.

Character-specific differences should normally come from:

- character data
- stats
- visuals
- weapon
- abilities
- sigils

Do not create a new Player class for every character.
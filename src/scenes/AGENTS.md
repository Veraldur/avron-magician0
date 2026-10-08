# Scenes

Scenes orchestrate game flow and presentation.

Scenes may own:

- Phaser lifecycle
- scene-specific objects
- camera
- level layout
- scene UI
- transitions

Scenes should not duplicate shared gameplay mechanics.

If a mechanic is required by more than one scene,
move it into a shared system/entity/mechanic.
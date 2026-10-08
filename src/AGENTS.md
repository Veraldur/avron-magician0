# src/

This directory contains runtime game code.

## Layers

core/
    global game state and infrastructure

entities/
    runtime game objects

systems/
    reusable gameplay/application systems

mechanics/
    low-level gameplay mechanics

data/
    content definitions

scenes/
    Phaser scene orchestration

config/
    global configuration and controls

---

## Dependency Direction

Preferred dependency direction:

scenes
   ↓
systems
   ↓
entities / mechanics
   ↓
data

Data should not import Scenes.

Entities should not depend on specific Scenes when avoidable.

Generic systems should not contain character-specific content.

---

## Adding New Code

Before creating a file ask:

1. Is this runtime state?
2. Is this reusable behavior?
3. Is this content?
4. Is this scene-specific?
5. Is this configuration?

Choose the directory accordingly.
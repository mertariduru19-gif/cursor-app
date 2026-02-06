# City Puzzle (Unity 2022 LTS)

This repository hosts a Unity 2022 LTS project for a 2D isometric city builder + road puzzle game.

## Core loop (MVP)
- Place road pieces to connect target nodes.
- Solving a puzzle upgrades a factory.
- Factories produce stone, wood, and concrete over time.
- Production continues offline up to a capped storage capacity.

## Project structure
- Assets/Scripts/Core: ScriptableObjects and configs
- Assets/Scripts/Game: Runtime systems (inventory, factories, save)
- Assets/Scripts/Puzzle: Grid, road pieces, puzzle logic, isometric helpers

## Setup
1. Open the project with Unity 2022.3 LTS.
2. Create a GameConfig asset and define resources/factories.
3. Add GameManager, ResourceInventory, and FactoryController to a scene.
4. Wire PuzzleController and PuzzleRewarder to connect puzzles to upgrades.
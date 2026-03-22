---
title: Solo-First Architecture and Pressure Design
slug: solo-first-architecture-and-pressure-design
module: 3
order: 5
---

## Objectives
- Design a solo mode that preserves the core logic of your multiplayer game instead of feeling bolted on.
- Learn how to create pressure, tempo, and denial for one player without drowning them in upkeep.
- Define the solo identity of your game before writing a detailed bot.

## Lesson
You said you design for solo play first. Good. That changes the design job in an important way: you are not merely making a multiplayer euro and then asking how to simulate another player later. You are deciding from the beginning what kind of pressure the system must generate when only one human is at the table.

The most common solo-design mistake in this genre is building a lovely multiplayer puzzle and then stapling on a bot whose main job is "block random spaces." Sometimes that works well enough. Often it does not. The solo mode feels arbitrary, over-scripted, or detached from the logic that makes the multiplayer game interesting.

The better question is this: **what pressures must exist in solo for the game to still feel like itself?**

For a worker placement and tableau game, these pressures often include:

- contested access
- tempo deadlines
- scarcity of card opportunities
- score races or milestone races
- maintenance costs or negative consequences if ignored

Energy Empire is a useful anchor because it already softens contest through energy payments and environmental pressure instead of relying only on direct hostility. The solo rules sharpen that lesson. The solo game uses the 2-player setup as a base, adds neutral workers to the three markets plus Power Plant and Clean Up, trims the structure markets to only left and right slots, removes two achievements, reduces the available dice mix, and shrinks the Global Impact track to just two pollution tokens per space. That is a strong example of solo design through selective constraint rather than through a giant opponent script.

### Three good solo-first approaches

### 1. System pressure first

The board itself creates urgency through:

- rising costs
- pollution
- crises
- event timers
- expiring milestones

This is elegant because it keeps the solo player focused on the same decisions the multiplayer game cares about.

### 2. Focused opponent pressure

A bot or automa primarily does a few things well:

- takes or taxes key spaces
- races achievements
- alters card availability
- creates a score target

This is often better than giving the bot a fake full tableau. Energy Empire's official solo mode does exactly this: it does not ask you to run a simulated empire turn by turn. Instead it reshapes the environment and gives you clear objective gates.

### 3. Hybrid pressure

The system creates baseline urgency, while the bot creates specific competition.

This is often the sweet spot for medium-weight solo design.

### What a solo bot should *not* usually do

- perform every subsystem at full fidelity
- require the player to maintain a second full strategic puzzle
- use random blocking with no thematic or structural logic
- take long turns that interrupt the player's flow

Automa design is at its best when it preserves the heart of the decision space while compressing administration. If your solo opponent is clever but exhausting, it has missed the point.

### A practical solo-first blueprint

For your first prototype, define solo in four sentences:

1. The solo player is trying to achieve: `__________`
2. The game pressures them through: `__________`
3. The opponent/system interferes by: `__________`
4. The loss condition or target line is: `__________`

Example:

- build the strongest clean-energy state by round 8
- while containing pollution and civic unrest
- while a bot claims high-value spaces and accelerates global-impact cards
- and finish above 65 points with pollution below 6

That already gives you something testable.

The Energy Empire solo objectives are especially instructive because they are multi-criteria rather than merely "beat a score." To win, the player must reach the last space of the United Nations track, earn at least 20 points from achievements, and finish with 100 or more total points. That is a great reminder that solo victory conditions can focus the design on the experience you want to emphasize.

> [!TIP]
> The first solo question is not "How does the bot take turns?" It is "What tension is missing when another human is not here?"

If you answer that well, the bot design becomes easier.

### Solo-first ideas you can steal in spirit

- a global-impact deck that advances when certain action families are overused
- a rival track that claims one premium action family each round
- an urgency dial that makes late cleanup or repair increasingly expensive
- objective cards that ask the solo player to specialize while the board keeps tempting them to diversify
- a multi-part victory condition that forces the solo player to build a rounded engine instead of optimizing a single exploit

These all create pressure without forcing the player to administrate a giant shadow game.

## Checklist
- Write the four-sentence solo blueprint for your game.
- Decide whether your solo mode is system-pressure, focused-opponent, or hybrid.
- List the 3 most important pressures a solo player must feel.
- Cut one imagined bot feature that sounds impressive but would create extra upkeep.

## Reflection
- When you imagine playing your own game solo, what kind of pressure sounds most satisfying: outracing a rival, surviving system stress, or building the cleanest engine under constraint?
- What part of your multiplayer design would feel most hollow if the solo mode failed to preserve it?

## Quiz
### Question 1
What is the healthiest first question in solo-first design?
- [ ] How many bot actions should happen per round?
- [ ] What icon color should the solo deck use?
- [x] What important tension disappears when no human opponent is present?
- [ ] How can the bot fully mimic a human player turn by turn?
Explanation: Solo design starts by identifying missing pressure, not by immediately scripting fake behavior.

### Question 2
What is a common weakness of a bolted-on solo bot?
- [ ] It makes the game too thematic
- [ ] It usually creates too many achievements
- [x] It blocks or acts randomly without preserving the real logic of the design
- [ ] It creates clear goals for the player
Explanation: A weak solo system feels arbitrary and detached from what makes the multiplayer game interesting.

### Question 3
Why is hybrid pressure often strong in medium-weight solo design?
- [ ] Because it removes the need for any scoring target
- [x] Because the system can create baseline urgency while a lighter bot creates focused competition
- [ ] Because it guarantees all players will prefer solo
- [ ] Because it makes card design unnecessary
Explanation: Hybrid systems often preserve tension while avoiding the burden of simulating an entire second player.

## Resources
- Manhattan Project: Energy Empire
- Automa Factory: The Automa Approach
- How to Design a Worker Placement Game Part 4: Energy Empire

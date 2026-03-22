---
title: Designing the Worker Placement Layer
slug: designing-the-worker-placement-layer
module: 2
order: 3
---

## Objectives
- Design action spaces that create tension, tempo, and identity instead of feeling like a list of chores.
- Understand several ways to make worker placement interactive without making it miserable.
- Draft the first version of your board's core action economy.

## Lesson
Worker placement is easy to imitate badly. The common weak version is a row of actions that all sound reasonable but do not create pressure. Players gather wood here, stone there, cards somewhere else, and maybe build with another action. The problem is not that these actions exist. The problem is that they do not force prioritization.

The best worker placement systems make each placement valuable for a reason. In the original Manhattan Project, action tempo matters because the board is shared, retrieval is asynchronous, and opponent tableaus can become relevant through espionage. In Energy Empire, occupied spaces remain accessible, but only if your new stack is the tallest in that location. Because a stack may contain any amount of energy but only one worker, the game turns contest into a visible tax race. That means tension stays alive even when the board is not using hard blocking everywhere.

There are several good tension tools. You do not need all of them.

### Tool 1: Hard blocking

One worker takes the space. Everyone else must pivot.

Use this when:

- you want sharp timing races
- the number of critical actions is intentionally limited
- the game should feel more knife-edge

Risk:

- can feel punishing if alternatives are weak
- can make solo conversion awkward if your bot must simply steal actions at random

### Tool 2: Escalating cost

Players may still use the space, but it gets more expensive after the first user. Energy Empire's tallest-stack rule is the clearest benchmark here: if a location already contains a worker, you must stack enough energy under your worker to exceed the current height, and you may intentionally overpay to make the location harder for later players.

Use this when:

- you want pressure without dead turns
- you want solo pressure that feels legible
- you want the game to reward efficient preparation

Risk:

- if the surcharge is too small, tension vanishes
- if the surcharge is too large, it behaves like hard blocking with extra bookkeeping

### Tool 3: Worker-type requirements

The space is available only if the right kind of worker or specialist is available. Paladins is a strong reference for how this creates internal tension.

Use this when:

- you want different action families to feel distinct
- you want planning around recruitment or conversion
- you want "I can do this, but not with *this* worker" moments

Risk:

- if overused, it creates fiddly frustration instead of meaningful planning

### Tool 4: Seasonal, round, or phase partitioning

Viticulture demonstrates how splitting the board by season makes timing itself part of the design. Players are not only choosing actions; they are choosing windows.

Use this when:

- you want a natural rhythm
- you want the board to tell a story across a round
- you want workers to feel tied to a cycle

Risk:

- if each phase has too many weak actions, the split adds structure without drama

### Tool 5: Rewarding contested spaces more highly

Instead of making all early spaces equally valuable, give two or three spaces clear importance. This tells players where the drama lives.

The Energy Empire rulebook also highlights another useful principle: your main-board action should do more than grant a resource. It should often determine what kind of tableau activations are legal afterward. In that game, a Government placement unlocks Government structures for phase two, an Industry placement unlocks Industry structures, and so on. That is a strong way to keep the board and tableau talking to each other.

For a medium-weight prototype, a strong starting board often has:

- 2 to 3 core economy spaces
- 2 conversion spaces
- 1 card or blueprint acquisition space
- 1 build/construct action
- 1 tempo or initiative action
- 1 cleanup or mitigation action

That is enough to create real structure without turning the board into a menu novella.

Here is a useful first-board sketch:

| Space family | Job in the system | Example question it creates |
| --- | --- | --- |
| Gather | Fuels your next two turns | Do I stabilize now or rush the build line? |
| Convert | Turns base resources into better ones | Is this the moment to upgrade or am I too early? |
| Build | Adds tableau pieces | Which engine lane am I committing to? |
| Acquire cards | Expands possibility space | Do I need flexibility or immediate power? |
| Tempo | Changes turn order, discounts, or worker timing | Is control worth a lower raw action? |
| Repair / clean up | Prevents pressure from snowballing | Can I afford to ignore this another round? |

> [!TIP]
> Every action space should threaten to be someone's favorite and someone else's painful miss.

If a space is never urgent, it is probably not doing enough. If every space is urgent all the time, the game becomes mud. Good boards have hot spots and supporting actions.

For your own design, draft the first version of your action layer with one sentence per space:

- what is the action for?
- why would a player want it now?
- what does it compete with?

If you cannot answer those three questions cleanly, the action probably is not ready.

One more benchmark lesson from Energy Empire's Generate turn is worth stealing in spirit: tension does not only come from placement. It can also come from your energy economy. In the rulebook, players choose when to stop working, recover workers, refine up to four oil into temporary petroleum dice, roll any number of dice, and then accept pollution based on the highest die result. That means your action system can be stronger if its downstream recovery phase also asks a real strategic question.

## Checklist
- Sketch 7 to 9 action spaces for your first board.
- Mark each space as hard blocked, tax-contested, worker-restricted, or phase-restricted.
- Identify the 2 or 3 spaces that should create the most table drama.
- Remove one action from your draft board that feels merely "useful" rather than necessary.

## Reflection
- Does your current design instinct lean toward sharp denial, softer pressure, or internal worker constraints, and what does that say about the experience you want?
- Which kind of tension would make your solo mode easier to build cleanly without draining the multiplayer game of life?

## Quiz
### Question 1
What is a common failure mode of weak worker placement boards?
- [ ] They contain too few actions to support strategy
- [ ] They focus too much on player interaction
- [x] They offer reasonable-sounding actions that do not create real prioritization
- [ ] They use any kind of blocking at all
Explanation: The problem is usually not the number of actions, but that too few of them create urgency, opportunity cost, or distinct pressure.

### Question 2
Why is escalating cost often attractive for solo-first design?
- [ ] Because it removes all need for action tension
- [x] Because it preserves contest and pressure without requiring absolute denial
- [ ] Because it guarantees easier balancing than hard blocking
- [ ] Because it makes worker types unnecessary
Explanation: Softer contest systems can adapt well to solo while still making timing and preparation matter.

### Question 3
What is a strong test for whether an action space belongs on the board?
- [ ] It sounds thematic
- [ ] It produces a resource no other action produces
- [ ] It can be explained in one sentence
- [x] It creates a meaningful "why now?" question
Explanation: Useful action spaces do not just exist; they create timing pressure and tradeoffs.

### Question 4
What is the best reason to keep only a few highly contested spaces on the board?
- [ ] To make every turn obvious
- [ ] To ensure everyone always chooses the same actions
- [x] To concentrate drama and keep the board from feeling equally flat everywhere
- [ ] To reduce the need for a tableau system
Explanation: Hot spots give the action system shape and help players read where the key decisions live.

## Resources
- The Manhattan Project Game Rules
- Manhattan Project: Energy Empire
- How to Design a Worker Placement Game Part 2
- Paladins of the West Kingdom
- Viticulture Essential Edition

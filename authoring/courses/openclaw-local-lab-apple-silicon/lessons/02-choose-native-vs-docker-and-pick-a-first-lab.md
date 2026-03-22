---
title: Choose Native vs Docker and Pick a First Lab That Will Actually Teach You Something
slug: choose-native-vs-docker-and-pick-a-first-lab-that-will-actually-teach-you-something
module: 1
order: 2
durationMinutes: 45
---

## Objectives
- Compare native and Docker-based OpenClaw deployment in a practical way.
- Choose a first lab path that matches both the official docs and your real goals.
- Understand what Docker does and does not solve for a self-hosted agent.

## Lesson
There is a tempting beginner thought that goes something like this:

"Docker makes things safer and easier to undo, so I should put the whole thing in Docker from day one."

That instinct is not crazy. It is also not the whole story.

The official OpenClaw Docker guide is refreshingly blunt. It says Docker is optional, that it is useful when you want an isolated throwaway gateway environment or when you are running OpenClaw on a host without local installs, and that **if you are running on your own machine and just want the fastest dev loop, you should use the normal install flow instead**.

That is the key design choice for this course.

We are not choosing between "safe" and "unsafe." We are choosing between:

- the **clearest beginner path**
- and the **most disposable packaging**

Those are not always the same thing.

Here is the practical comparison:

| Choice | What it is good for | What it costs you |
| --- | --- | --- |
| Native install | Fastest first success, fewer moving pieces, easiest dashboard-first learning path on your own Mac | Less disposable if you like to nuke and repave everything |
| Docker gateway | Easy to tear down and rebuild, good for experimentation, good for running on a separate host | More moving pieces, more networking confusion, more bind/persistence questions |
| Native gateway + Docker sandbox | Strong compromise: easy main install plus isolated tool execution later | More advanced than a first-day lab |

For your situation, I recommend:

**Native gateway first, local-only, dashboard-first, local Ollama model first.**

Why?

1. You are on your own Apple silicon Mac, not a remote server.
2. You want handholding and low confusion.
3. You care about local models and controlled cost.
4. The official docs themselves say the normal install flow is the better first move on your own machine.

This does **not** mean Docker is bad.

Docker remains genuinely useful in three situations:

- you want an easy wipe-and-rebuild lab
- you want the gateway more separate from the host
- you later want to compare packaging styles and understand persistence more clearly

But Docker does not magically erase agent risk. If you expose the wrong port, keep sloppy tokens, connect untrusted channels, or let a weak model roam too broadly, Docker will not save you from bad decisions. It changes the packaging and isolation story, not the need for judgment.

The course lab sequence is therefore:

| Phase | Goal |
| --- | --- |
| Phase 1 | Native install, dashboard only, local model only |
| Phase 2 | Security hardening, audit, and recovery habits |
| Phase 3 | Optional Docker gateway experiment |
| Phase 4 | Evaluate usefulness before expanding channels or automation |

That sequence protects you from a classic mistake: solving the wrong problem first.

Many beginners spend hours arguing with Docker networking, volumes, and bind modes before they have even sent one successful message through the OpenClaw dashboard. That is backward. First prove the gateway, model, and dashboard stack can work together. Then earn the right to complicate the packaging.

> [!TIP]
> Use Docker when you have a reason, not because it feels like the responsible thing by default. The most responsible first move is often the one you can understand and repair.

There is one more subtle point worth keeping: the OpenClaw docs separate **running the gateway in Docker** from **using Docker for agent sandboxing**. Those are different decisions. You can keep the gateway native and later use Docker-backed sandboxing for tool execution. That is often a better safety upgrade than containerizing the gateway purely out of habit.

So your first lab choice should be boring and specific:

- Gateway on the Mac
- Dashboard on localhost
- Ollama on the same machine
- No channels yet
- No public exposure
- Docker reserved for the optional comparison lesson

That setup is not only safer. It is also more teachable.

## Checklist
- Write down whether your first lab will be native or Docker based.
- If you chose Docker, write one concrete reason beyond "it feels safer."
- State your first success condition in one sentence, such as "I can open the dashboard and get a reply from a local model."
- Promise yourself you will not add a chat channel until that first success condition is stable.

## Reflection
- When something new feels intimidating, do you usually over-containerize it, or do you tend to run too much natively and hope for the best?
- Would a throwaway lab make you bolder in a good way, or would it tempt you to avoid learning the actual moving parts?

## Quiz
### Question 1
According to the official Docker guidance, when is Docker a strong fit?
- [ ] Whenever you are on your own Mac and want the fastest first setup
- [ ] Only when using hosted models
- [ ] Never; OpenClaw does not support Docker
- [x] When you want an isolated, throwaway gateway environment or you are running on a host without local installs
Explanation: The Docker docs say Docker is optional and useful for isolation or non-local-install hosts.

### Question 2
What is the best recommendation for this course's first lab on your Mac?
- [x] Native gateway, local-only dashboard, and a local model first
- [ ] Public dashboard plus hosted fallback model
- [ ] Docker gateway plus external channels on day one
- [ ] Native gateway plus browser automation immediately
Explanation: That path has the lowest confusion and best aligns with the official guidance for a machine you personally control.

### Question 3
What is a common beginner mistake with Docker in this context?
- [ ] Using it for sandboxing later
- [x] Solving packaging complexity before proving the gateway, model, and dashboard work together
- [ ] Keeping a local-only lab at first
- [ ] Delaying public exposure
Explanation: Docker can become a distraction when it arrives before basic end-to-end validation.

## Resources
- OpenClaw Docker Guide
- OpenClaw Getting Started
- OpenClaw GitHub README

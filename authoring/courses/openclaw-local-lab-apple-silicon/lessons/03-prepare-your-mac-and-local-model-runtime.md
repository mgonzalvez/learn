---
title: Prepare Your Mac and Local Model Runtime Before You Install the Gateway
slug: prepare-your-mac-and-local-model-runtime-before-you-install-the-gateway
module: 2
order: 3
durationMinutes: 45
---

## Objectives
- Prepare the basic dependencies for a local-first OpenClaw lab.
- Choose a realistic first local model for an M1 Max with 64 GB of RAM.
- Verify your model runtime before OpenClaw depends on it.

## Lesson
One of the easiest ways to make OpenClaw feel flaky is to install it before your model runtime is behaving. If the gateway, onboarding flow, and model stack are all uncertain at the same time, every symptom becomes harder to read.

So we will do the cleaner thing:

1. prepare the machine
2. bring up the local model runtime
3. verify the runtime
4. then install and configure OpenClaw

### What you need

From the official docs, the important baseline is:

- Node 24 recommended, or Node 22.16+ supported
- a model provider
- the OpenClaw CLI

Because you want a local-first, no-token-cost setup, the local model provider in this course is **Ollama**.

Why Ollama first?

- the OpenClaw docs have a dedicated Ollama provider page
- it is beginner-friendly compared with hand-rolled local proxies
- it supports tool calling through the native API path
- it fits the "local, practical, easy to undo" goal well

### Choose a sensible first model

The OpenClaw local-model docs are unusually candid: local use is doable, but the project expects large context and strong defenses against prompt injection. The docs explicitly say smaller or aggressively quantized models raise risk.

That means your job is not to chase the cutest tiny model. Your job is to pick the strongest model your Mac can run *comfortably enough for learning*.

For your M1 Max with 64 GB, this is a practical beginner ladder:

| Model | Why start here | Tradeoff |
| --- | --- | --- |
| `gpt-oss:20b` | Strong practical first choice for a local OpenClaw lab, manageable size, useful for general assistant work | Not the strongest model OpenClaw would ideally want |
| `qwen2.5-coder:32b` | Stronger for code-heavy tasks and useful comparison against GPT-OSS 20B | Heavier, slower, and more demanding |
| `llama3.3` | Easy mainstream option if you want a general assistant baseline | May feel less specialized for coding-style tasks |
| `deepseek-r1:32b` | Interesting if you want a reasoning-style comparison | Often slower and not my first pick for a calm beginner lab |

My recommendation for this course:

- start with `gpt-oss:20b`
- add `qwen2.5-coder:32b` as your second comparison model

That gives you a balanced first pass without pretending your laptop is a rack of GPU servers.

### Install and verify Ollama

Use Ollama's official macOS install path from their docs, then verify the CLI is available.

Once Ollama is installed, the practical lab commands are:

```bash
ollama pull gpt-oss:20b
ollama pull qwen2.5-coder:32b
ollama list
```

If Ollama is not already serving requests, start it:

```bash
ollama serve
```

Then confirm the local API responds:

```bash
curl http://localhost:11434/api/tags
```

That curl check matters. It tells you whether your local runtime is reachable **before** OpenClaw gets involved.

### Tell OpenClaw that Ollama exists

The official OpenClaw Ollama docs say any value works for `OLLAMA_API_KEY` because Ollama does not require a real key locally. That means you can use a simple local marker:

```bash
export OLLAMA_API_KEY="ollama-local"
```

If you want that to persist, add it to your shell profile later. For a first lab, exporting it in the active shell is enough.

### Why not jump straight to LM Studio?

The OpenClaw local-model docs currently describe LM Studio plus full-size MiniMax M2.5 as the best local stack. That is valuable guidance, but it is not the easiest beginner path and it pushes toward very powerful hardware. For this course, Ollama is the right first lab choice because:

- it gets you moving faster
- it keeps the model-runtime story simple
- it makes it easier to separate "gateway issue" from "runtime issue"

Later, if OpenClaw proves useful enough to deserve a more ambitious local model stack, LM Studio becomes a serious next experiment.

> [!TIP]
> A local model runtime is part of your infrastructure now. Treat "is it running?" as a first-class troubleshooting question, not as a side note.

### Your pre-install checkpoint

Before touching the OpenClaw install, you want to be able to say:

- Node is ready
- Ollama is installed
- at least one local model is pulled
- the Ollama API responds on `localhost:11434`

That is a much calmer place to begin.

## Checklist
- Confirm your Node version meets the OpenClaw requirement.
- Pull `gpt-oss:20b` and one second comparison model.
- Run `curl http://localhost:11434/api/tags` successfully.
- Export `OLLAMA_API_KEY="ollama-local"` in the shell you plan to use for the install.

## Reflection
- Do you usually try to validate dependencies one by one, or do you tend to pile them together and hope the error messages tell a story?
- Which matters more to you in this lab: a model that feels fast enough to keep momentum, or one that feels strong enough to earn more trust?

## Quiz
### Question 1
Why is it smart to verify Ollama before installing OpenClaw?
- [ ] Because OpenClaw cannot use local models at all
- [ ] Because verifying the runtime reduces ambiguity when something goes wrong later
- [x] Because it separates runtime problems from gateway problems
- [ ] Because the dashboard requires Ollama to open in a browser
Explanation: A clean dependency chain makes troubleshooting far easier.

### Question 2
Which starter model is the recommended first stop in this course?
- [ ] `deepseek-r1:32b`
- [ ] `llama3.3`
- [ ] `qwen2.5-coder:32b`
- [x] `gpt-oss:20b`
Explanation: `gpt-oss:20b` is a practical first model for this local-first lab, with `qwen2.5-coder:32b` as the next comparison step.

### Question 3
What does `OLLAMA_API_KEY="ollama-local"` do in this setup?
- [x] It gives OpenClaw the marker it expects to enable and check the local Ollama provider
- [ ] It purchases hosted Ollama usage credits
- [ ] It turns Ollama into a Docker container
- [ ] It disables model discovery
Explanation: The OpenClaw Ollama docs say any value works locally; the point is enabling the provider path, not authenticating to a paid service.

## Resources
- OpenClaw Ollama Provider
- OpenClaw Local Models
- Ollama Quickstart

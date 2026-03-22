---
title: Install OpenClaw and Get Your First Local Reply
slug: install-openclaw-and-get-your-first-local-reply
module: 2
order: 4
durationMinutes: 50
---

## Objectives
- Install OpenClaw using the normal beginner-friendly path.
- Point the gateway at a local Ollama model.
- Verify that the dashboard works and that your first reply is coming from your local stack.

## Lesson
This lesson is the heart of the practical lab. We are aiming for one clean outcome:

**You can open the OpenClaw dashboard on your Mac and get a reply from a local model.**

That is enough. We are not adding channels yet, and we are not chasing fancy agent behavior yet.

### Step 1: Install OpenClaw

The official getting started guide recommends this install path on macOS and Linux:

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Once that finishes, verify the CLI exists:

```bash
openclaw --help
```

If the shell does not find `openclaw`, open a new terminal window or reload your shell profile.

### Step 2: Run onboarding

The recommended setup path is:

```bash
openclaw onboard --install-daemon
```

This step matters because onboarding installs and configures the gateway service so it can stay running in the background.

If the wizard strongly nudges you toward hosted providers, remember your goal in this course is different: you want the gateway up and then you want the model set to your local Ollama runtime. So treat onboarding as the gateway/bootstrap step, not as a reason to abandon the local plan.

### Step 3: Verify the gateway service

After onboarding, check the gateway:

```bash
openclaw gateway status
```

You want confirmation that the gateway is running and listening on port `18789`.

### Step 4: Set the default model to Ollama

Now point the default model at your local runtime:

```bash
openclaw config set agents.defaults.model.primary "ollama/gpt-oss:20b"
openclaw config set agents.defaults.model.fallbacks '["ollama/qwen2.5-coder:32b"]'
openclaw config set models.providers.ollama.apiKey "ollama-local"
```

Then inspect what OpenClaw sees:

```bash
openclaw models list
openclaw models status
```

You are looking for a clean story:

- your primary model resolves to `ollama/gpt-oss:20b`
- OpenClaw can see your local models
- there is no missing-auth confusion for the local runtime

### Step 5: Open the dashboard

Use the official dashboard command:

```bash
openclaw dashboard
```

That should open the Control UI in your browser. If it asks for a token, the official dashboard docs say the token source is `gateway.auth.token` or `OPENCLAW_GATEWAY_TOKEN`.

If needed:

```bash
openclaw config get gateway.auth.token
```

Paste that token into the dashboard's auth field.

### Step 6: Send a boring first message

Do not test with something huge. Start with one or two simple prompts that tell you the pipeline is working.

Good first prompts:

- "Give me a three-line summary of what OpenClaw is."
- "List two benefits and two risks of running a local AI assistant on my Mac."
- "Tell me whether you are using a local model or a hosted model in this setup."

Why boring prompts first?

Because you are testing:

- gateway health
- dashboard auth
- model routing
- reply behavior

You are **not** yet testing brilliance.

### Step 7: Verify the reply is truly local enough for your goal

A beginner trap is assuming "the dashboard replied, therefore the local plan worked." Slow down.

Check the model status and your config. Make sure you did not accidentally leave a hosted primary in place during onboarding.

Useful follow-up commands:

```bash
openclaw models status
openclaw config get agents.defaults.model.primary
```

If those point to Ollama, you are in good shape.

### A minimal first-lab command sequence

Here is the practical sequence in one place:

```bash
export OLLAMA_API_KEY="ollama-local"

curl -fsSL https://openclaw.ai/install.sh | bash
openclaw onboard --install-daemon
openclaw gateway status

openclaw config set agents.defaults.model.primary "ollama/gpt-oss:20b"
openclaw config set agents.defaults.model.fallbacks '["ollama/qwen2.5-coder:32b"]'
openclaw config set models.providers.ollama.apiKey "ollama-local"

openclaw models list
openclaw models status
openclaw dashboard
```

That is the first real win condition for the course.

> [!TIP]
> If you can open the dashboard and get a simple reply from a local model, resist the urge to celebrate by connecting five other things. Freeze the system, write down what worked, and only then proceed.

## Checklist
- Run the OpenClaw install successfully.
- Complete onboarding with the gateway daemon installed.
- Verify `openclaw gateway status` shows a healthy gateway.
- Set the primary model to `ollama/gpt-oss:20b` and confirm it with `openclaw models status`.
- Open the dashboard and get a first reply.

## Reflection
- Which part of the setup felt most uncertain to you: install, onboarding, model routing, or dashboard auth?
- If your first reply worked but felt slow, would you rather improve speed first or security confidence first?

## Quiz
### Question 1
What is the clearest success condition for this lesson?
- [ ] Connecting WhatsApp and Telegram at the same time
- [x] Opening the dashboard and getting a reply from a local model
- [ ] Enabling every available tool
- [ ] Running the gateway in Docker
Explanation: A narrow first win is the right target for a beginner lab.

### Question 2
Why is `openclaw models status` useful right after onboarding?
- [ ] It builds the Docker image
- [ ] It opens the dashboard
- [x] It confirms which model OpenClaw actually plans to use and whether auth is missing
- [ ] It erases old sessions
Explanation: This command helps you verify that the gateway is truly pointed at the local model you intended.

### Question 3
Why should your first prompts be boring?
- [ ] Because OpenClaw rejects long prompts by default
- [ ] Because the dashboard cannot render rich answers
- [ ] Because local models cannot answer practical questions
- [x] Because simple prompts test the plumbing without mixing in too many variables
Explanation: You want to validate the system path before you try to evaluate its intelligence.

## Resources
- OpenClaw Getting Started
- OpenClaw GitHub README
- OpenClaw Dashboard Guide
- OpenClaw Ollama Provider

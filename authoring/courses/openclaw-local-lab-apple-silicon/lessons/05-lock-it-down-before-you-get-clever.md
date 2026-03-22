---
title: Lock It Down Before You Get Clever
slug: lock-it-down-before-you-get-clever
module: 3
order: 5
durationMinutes: 45
---

## Objectives
- Apply the most important beginner-friendly security habits for a local OpenClaw lab.
- Understand what the official security tooling can catch for you.
- Avoid the common mistake of expanding capabilities before hardening the basics.

## Lesson
You now have a working local lab. Good. This is the exact moment when many people make it worse.

They think:

"It works. Now let's add remote access, connect a channel, enable browser control, and see what happens."

That is how beginner labs become messy and hard to trust.

The official OpenClaw security docs give you a much better order of operations. They repeatedly steer you toward the simple truth that **access control comes before intelligence**. A mediocre but tightly contained setup is safer than a brilliant but overexposed one.

### Rule 1: Keep the dashboard local

The official dashboard docs say the Control UI is an admin surface for chat, config, and exec approvals, and that you should not expose it publicly. For a beginner lab, the safest default is:

- open it on `http://127.0.0.1:18789/`
- do not put it on the public internet
- if you later need remote access, prefer Tailscale Serve or an SSH tunnel

That one rule removes a lot of unnecessary risk.

### Rule 2: Run the security audit

OpenClaw gives you a genuinely helpful command:

```bash
openclaw security audit
```

And for a deeper pass:

```bash
openclaw security audit --deep
```

This is one of the highest-value beginner commands in the project because it turns invisible bad decisions into visible warnings. It is not a magic shield, but it is exactly the kind of boring, trustworthy tool you want in a system like this.

### Rule 3: Remember that local session logs live on disk

The official security guide says session transcripts live under:

```text
~/.openclaw/agents/<agentId>/sessions/*.jsonl
```

That means disk access is part of your trust boundary. In practical terms:

- do not assume the system is private just because it is local
- remember that stored sessions can contain sensitive prompts and outputs
- be thoughtful about what you ask OpenClaw to process

If you need much stronger isolation later, the docs recommend separate OS users or separate hosts for stronger trust separation.

### Rule 4: Stay narrow with tools

A beginner-friendly local lab does not need every powerful capability on day one.

What to keep narrow:

- no public channels yet
- no broad remote access yet
- no casual use of command execution just because it is available
- no assumption that local models are good enough to safely interpret every messy input

The local-model docs are clear that weaker local setups have weaker prompt-injection defenses. That does not mean "never use local." It means "use local with humility."

### Rule 5: Build the habit of repair

Two commands deserve a permanent place in your mental toolkit:

```bash
openclaw doctor
openclaw security audit
```

`openclaw doctor` is the project’s repair-and-migrate command. The updating guide treats it as the safe, boring maintenance command, which is exactly the right energy.

### A practical hardening mini-routine

After your first working install, do this:

```bash
openclaw security audit
openclaw doctor
openclaw models status
openclaw gateway status
```

That gives you a quick answer to four important questions:

- Is the config obviously risky?
- Is the install healthy?
- Is the intended model still selected?
- Is the gateway service up?

### What not to do yet

Do not do these in your first security pass:

- expose the dashboard publicly
- assume "localhost" and "publicly safe" are the same thing if you later add tunnels without reading the docs
- let curiosity talk you into broad tool permissioning
- trust that a cheap or weak model will handle adversarial or messy input gracefully

> [!TIP]
> Security maturity often looks boring from the outside. That is a compliment.

If you can keep the system local, verify it regularly, and expand only when you understand what each new capability changes, you are already ahead of a lot of self-hosting mistakes.

## Checklist
- Run `openclaw security audit` and save any warnings you see.
- Run `openclaw doctor` once after the install stabilizes.
- Confirm you are opening the dashboard only on localhost.
- Write down where session logs live on disk.
- Delay public channels or remote exposure until after you can explain your current trust boundary.

## Reflection
- Which feels more natural to you: tightening scope before adding features, or adding features and cleaning up later?
- If a future-you forgets that session logs live on disk, what kind of mistake do you most want to avoid?

## Quiz
### Question 1
What is the safest beginner posture for the dashboard?
- [x] Keep it on localhost and do not expose it publicly
- [ ] Publish it publicly with a memorable URL for convenience
- [ ] Use it only through Discord
- [ ] Disable auth because the Mac is already yours
Explanation: The official dashboard docs explicitly warn that the Control UI is an admin surface and should not be publicly exposed.

### Question 2
Why is `openclaw security audit` especially valuable for beginners?
- [ ] It guarantees there are no model hallucinations
- [x] It surfaces risky configuration choices in a way you can act on
- [ ] It permanently blocks all prompt injection
- [ ] It converts the whole system to Docker
Explanation: It is useful because it makes security posture more visible, not because it solves every risk automatically.

### Question 3
Why should you care that session logs live on disk?
- [ ] Because OpenClaw cannot reply without internet access
- [ ] Because it means Docker is required
- [x] Because local transcript files become part of your trust boundary
- [ ] Because it disables model fallback
Explanation: Local storage can contain sensitive prompts and outputs, so filesystem access matters.

## Resources
- OpenClaw Security Guide
- OpenClaw Security CLI
- OpenClaw Dashboard Guide
- OpenClaw Updating Guide

# Course Resources

### OpenClaw Overview
- Type: reference
- URL: https://docs.openclaw.ai/
- Description: The clearest official summary of what OpenClaw is, who it is for, and the role of the Gateway, dashboard, channels, and model stack.
- Tags: official, overview, architecture

### OpenClaw GitHub README
- Type: reference
- URL: https://github.com/openclaw/openclaw
- Description: The main source for recommended install paths, platform expectations, and the project's own framing of security defaults and operational posture.
- Tags: official, repository, install

### OpenClaw Getting Started
- Type: guide
- URL: https://docs.openclaw.ai/start/getting-started
- Description: The best official beginner sequence for install, onboarding, gateway verification, and opening the dashboard.
- Tags: official, getting-started, onboarding

### OpenClaw Docker Guide
- Type: guide
- URL: https://docs.openclaw.ai/install/docker
- Description: The official explanation of when Docker is worth using, how the containerized gateway works, what persists, and which Docker-specific security and troubleshooting details matter.
- Tags: official, docker, deployment

### OpenClaw Security Guide
- Type: guide
- URL: https://docs.openclaw.ai/gateway/security
- Description: The most important operational source in this course. It explains prompt injection, session logs on disk, admin-surface risk, network exposure, DM policy, and hardening priorities.
- Tags: official, security, hardening

### OpenClaw Dashboard Guide
- Type: guide
- URL: https://docs.openclaw.ai/web/dashboard
- Description: High-value reference for the Control UI, token handling, and the critical rule that the dashboard is an admin surface and should not be publicly exposed.
- Tags: official, dashboard, security

### OpenClaw Local Models
- Type: guide
- URL: https://docs.openclaw.ai/gateway/local-models
- Description: Official guidance on local-model tradeoffs, why OpenClaw benefits from strong models, and why pure local operation is possible but more demanding than many people expect.
- Tags: official, local-models, model-selection

### OpenClaw Ollama Provider
- Type: guide
- URL: https://docs.openclaw.ai/providers/ollama
- Description: The best practical source for connecting Ollama to OpenClaw, including native API usage, tool-calling caveats, auto-discovery, and starter model examples.
- Tags: official, ollama, local-models

### OpenClaw Security CLI
- Type: reference
- URL: https://docs.openclaw.ai/cli/security
- Description: Documents `openclaw security audit`, which is one of the best beginner-friendly safety checks in the project because it turns risky config into visible warnings.
- Tags: official, cli, security

### OpenClaw Updating Guide
- Type: guide
- URL: https://docs.openclaw.ai/install/updating
- Description: Useful because it reinforces the habit of running `openclaw doctor` after updates and when switching install methods.
- Tags: official, maintenance, updates

### Ollama Quickstart
- Type: guide
- URL: https://docs.ollama.com/quickstart
- Description: The official Ollama quickstart for running local models and confirming the local runtime is available before OpenClaw depends on it.
- Tags: official, ollama, runtime

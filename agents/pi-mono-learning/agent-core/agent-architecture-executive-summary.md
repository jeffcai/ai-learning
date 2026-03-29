# pi-agent-core executive summary

`@mariozechner/pi-agent-core` is the reusable agent runtime in the monorepo.

It provides the orchestration layer between:
- application state
- LLM streaming
- tool execution
- event delivery

## Core idea

The package keeps conversation state as `AgentMessage[]`, not just raw provider messages.

Before each LLM call, it runs a two-step adaptation pipeline:

```text
AgentMessage[] -> transformContext() -> convertToLlm() -> Message[]
```

That lets applications:
- keep custom message types in memory
- prune or enrich context before inference
- send only provider-compatible messages to the model

## Main architecture

### `Agent`
The `Agent` class is the stateful public API.

It:
- stores `AgentState`
- exposes `prompt()`, `continue()`, `abort()`, `steer()`, `followUp()`
- tracks streaming state and pending tool calls
- manages steering/follow-up queues
- subscribes listeners to agent events
- delegates execution to the loop runtime

### Agent loop
The loop in `src/agent-loop.ts` is the execution engine.

It:
- emits lifecycle events
- streams assistant messages
- detects tool calls
- validates and executes tools
- feeds tool results back into context
- repeats until no more work remains

### Tool subsystem
Tools are declared as `AgentTool` and executed through a structured pipeline:
- detect tool call
- validate args
- run `beforeToolCall`
- execute tool
- emit progress updates
- run `afterToolCall`
- append `toolResult` message

Execution modes:
- `sequential`
- `parallel`

### Event model
The package is event-driven and UI-friendly.

Main event categories:
- `agent_start`, `agent_end`
- `turn_start`, `turn_end`
- `message_start`, `message_update`, `message_end`
- `tool_execution_start`, `tool_execution_update`, `tool_execution_end`

## Request lifecycle

1. App calls `agent.prompt()` or `agent.continue()`
2. `Agent` builds runtime context and config
3. loop starts a turn
4. context is transformed and converted for the LLM
5. provider stream emits assistant events
6. loop emits message events while updating partial/final assistant state
7. if tool calls are present, tools execute and emit tool events
8. tool results are appended as messages
9. next turn runs with tool results in context
10. loop ends when there are no more tool calls, steering messages, or follow-ups

## Why it matters

`pi-agent-core` is the reusable foundation for building higher-level agents.

Its main strengths are:
- clear separation of state, orchestration, transport, and tools
- strong extension hooks
- support for streaming-first UI
- deterministic event ordering with optional parallel tool execution
- support for mid-run steering and deferred follow-up inputs

## Short comparison to `pi-coding-agent`

- `pi-agent-core` is a general-purpose runtime library
- `pi-coding-agent` is the end-user product that builds a full terminal coding experience on top of agent/runtime/package/UI infrastructure

Use `pi-agent-core` when you want to embed or build your own agent.
Use `pi-coding-agent` when you want the complete interactive coding harness.

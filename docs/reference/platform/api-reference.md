# API Reference

Fluxive is designed to integrate seamlessly with your existing infrastructure.

## fxPersistence API

Manage the long-term memory of your agents.

*   `POST /v1/memory/store`: Save a conversation snippet or context vector.
*   `GET /v1/memory/retrieve`: Fetch relevant context based on a query vector.

## Webhooks

Subscribe to real-time events.

*   `agent.drift_detected`: Triggered when an agent's output deviates from the norm.
*   `task.completed`: Triggered when a complex workflow is finished.
*   `intervention.required`: Triggered when an agent encounters a situation requiring human review.

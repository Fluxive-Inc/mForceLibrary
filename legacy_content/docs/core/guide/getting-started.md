# Getting Started with Machineforce

Fluxive Machineforce is designed to be the robust backbone of your personal AI infrastructure.

## Auditing your Machineforce

Before installing the technical software, we recommend performing a brief "Influence Audit" to identify where AI is currently operating in your business.

### Step 1: Audit
List every AI tool, bot, or agent currently in use. Don't just list the official ones—ask your teams what they use daily (e.g., ChatGPT, Midjourney, Coding Assistants).

### Step 2: Classify
Categorize these agents based on their **autonomy** and **impact**:
*   **Low Autonomy / Low Impact**: Spelling checkers, basic chatbots.
*   **High Autonomy / High Impact**: Autonomous trading bots, customer support agents that can issue refunds.

### Step 3: Align
For every High Impact agent, assign a human **Influence Owner**. This person is responsible for the agent's "Intent Alignment."

---

## Installation

```bash
npm install @fluxive/machineforce
```

## Quick Start
Initialize the agent in your project:

```typescript
import { Machineforce } from '@fluxive/machineforce'

const agent = new Machineforce({
  edge: true,
  persistence: 'local'
})

await agent.start()
```

## Configuration
See the full configuration options in the [Architecture](/core/guide/architecture) section.

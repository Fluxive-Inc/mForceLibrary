# Reference Module: Trackback App

**Goal:** Use this as the "Hello World" or "Gold Standard" example.

## Overview
The Trackback App logs assets and tracks requests across the edge network.

## Code Walkthrough
Snippets showing how it handles data ingestion.

```typescript
// Example ingestion handler
export async function onRequest(ctx) {
  const data = await ctx.request.json();
  console.log('Tracking asset:', data.assetId);
  await ctx.store.save('logs', data);
}
```

## Configuration
Specific environment variables it needs:
*   `TRACKBACK_API_KEY`
*   `LOG_LEVEL`

## Installation
Installation guide for this specific module.

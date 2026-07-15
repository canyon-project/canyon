---
description: Categorize coverage with scene key/value pairs for per-case views.
---

# Scene

During collection, Canyon uses a **scene** (key/value map) to classify hits from different cases. Together with `buildHash`, the server knows:

- Which CI build (source / map) the hits belong to
- Which test scene produced them

## Why Scene

E2E suites run many cases. A single global total cannot answer:

- Which branches did a failing case actually hit?
- Is a business path never covered by automation?

Scene enables storage and queries at case granularity.

## Declaring a scene

```html
<script>
  window.CANYON_DSN = 'https://app.canyonjs.io/api/coverage/client';
  window.CANYON_SCENE = {
    suite: 'checkout',
    caseId: 'pay-success',
    browser: 'chromium',
  };
</script>
```

Automation frameworks can swap the scene per case (e.g. Playwright `beforeEach`).

## Relationship to buildHash

| Field | Role |
| --- | --- |
| `buildHash` | Locates source version + map |
| `scene` | Locates case / scenario |

They are orthogonal: one build can have many scenes; the same scene labels may appear across builds.

## Scene Hash

The server hashes scene key/values into a **scene hash** for indexing and [aggregation](/guide/concepts/aggregation).

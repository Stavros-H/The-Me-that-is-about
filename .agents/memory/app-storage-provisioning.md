---
name: App Storage provisioning
description: Replit Object Storage requires a provisioned default bucket before contact persistence can be exercised.
---

The Replit Object Storage client can be imported without issue, but storage operations fail when the workspace has no default bucket provisioned. Keep storage initialization lazy so the web server can still serve the site, and surface a clear 500 error for persistence operations until App Storage is enabled.

**Why:** The imported workspace did not have an App Storage bucket available during initial setup.

**How to apply:** Before testing valid contact submissions or admin message management, provision App Storage and then verify `data/contactReceived.json` creation and updates.
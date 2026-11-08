# D2C Operations Hub — Shortage Center

A static, data-free starter dashboard for Vercel. No real warehouse records are included.

## Deploy without a terminal
1. Create a **private** GitHub repository named `d2c-operations-hub`.
2. In GitHub, choose **Add file → Upload files**, upload `index.html` from this folder, and commit.
3. In Vercel, choose **Add New → Project**, import the GitHub repository, and deploy with **Framework Preset: Other** (no build command needed).
4. Open the resulting `.vercel.app` address and click **Load new exports**.

## Security and limitations
- A Vercel URL is publicly reachable by default. **Do not upload actual company data** without employer authorization and appropriate access controls. A private GitHub repo does not make the deployed website private.
- The browser processes selected files in memory, but XLSX support dynamically loads a third-party JavaScript library from jsDelivr. Do not use sensitive exports until this dependency is vetted/self-hosted and organizational approval is obtained.
- No Logiwa or Jira integration, no authentication, no persistent database, no background sync.
- Report output is a prototype and needs operational validation before use.
- For an authenticated production version, add identity provider access controls, reviewed dependencies, and a secure server/API design.

# D2C Assist + D2C Runner

Internal warehouse operations workspace and mobile replenishment companion. Designed to reduce manual report processing, printed pull lists and communication delays between the office and warehouse floor.

## Applications

| Application | Purpose |
| --- | --- |
| [D2C Assist](https://d2c-assist.vercel.app/) | Office dashboard, shortage analysis, task dispatch, reports and operational tools |
| [D2C Runner](https://d2c-assist.vercel.app/runner/) | Mobile assignment queue for warehouse runners; installable web app for compatible Zebra devices |

## Current capabilities

- Import Logiwa shortage, inventory-by-location and optional replenishment task exports.
- Calculate outstanding needs after shelf stock and pending replenishment coverage; distinguish physical storage, virtual locations and exceptions.
- Manage SKU-level decisions, notes, printable pull lists, MV-M1 email requests and investigation sheets.
- Dispatch assigned shortage pulls automatically or create manual Runner requests.
- View open jobs, completed-today jobs and issues; expand assignments to see quantities, locations and LPNs.
- Prioritize urgent work and sort new shortage assignments by oldest outstanding order within priority.
- Report partial pulls, completion or issues. Linked completion updates the office status to Resolved; issues update it to Under Investigation and surface an in-app notice.
- Access saved reports, POD hat replenishment, purchase order builder, list and ticket generators, quick links, emergency handbook and SmartSearch.

## Operational workflow

1. Export current reports from Logiwa and upload them in Assist.
2. Review inventory coverage and choose a SKU status.
3. Mark a verified physical pull Assigned or use Dispatch Runner for a manual request.
4. Runner receives the assignment through periodic database polling.
5. Runner confirms quantities or reports an issue with notes.
6. Assist receives the linked outcome through shared workspace state. Resolved items are hidden from the default active view but remain accessible through the Resolved filter while present in the current report.
7. Verify and record inventory movements in Logiwa separately.

## Architecture

Static HTML, CSS and JavaScript hosted on Vercel. GitHub holds application source. Supabase provides authentication, PostgreSQL storage and row-level security. Browser-side XLSX/JSZip libraries process uploaded files; shared report results and operational state are persisted to Supabase. Both clients use periodic polling, not background push notifications.

Key database tables:

| Table | Responsibility |
| --- | --- |
| workspace_members | Approved workspace membership and roles |
| workspace_state | Shared report and SKU decisions |
| workspace_activity | Workspace activity history |
| runner_tasks | Assignment quantities, locations, priority, status and results |

The runner_result_sync database trigger updates linked SKU state when a Runner task changes to Completed or Issue. The open-shortage uniqueness index prevents duplicate active tasks for a source key. Database schema and policies are managed in Supabase; this README is not a substitute for a migration backup.

## Source code guide

Both HTML entry points include numbered section comments and a source table of contents.

### index.html — Assist

1. Document head, dependencies and styles
2. Sidebar and workspace toolbar
3. Dashboard, shortage center, reports, replenishment and POD hats
4. Purchase orders, list generator and ticket generator
5. Quick links, emergency handbook and SmartSearch
6. Core application logic (utilities, inventory, reporting, exports and tool modules)
7. Supabase client and legacy tracker
8. Shortage Action Center and automatic Runner dispatch
9. Workspace authentication, account controls and shared state
10. Manual Runner dispatch and assignment activity
11. Runner issue notifications

### runner/index.html — Runner

1. Document head, installable app metadata and styles
2. App shell, sign-in and dashboard views
3. Supabase dependency
4. Workspace authentication and navigation
5. Live assignment polling and dashboard counters
6. Job sorting and category views
7. Collapsible assignment details
8. Pull confirmation, issue reporting and startup

Other Runner files: manifest.webmanifest (installation metadata), icon.svg (branding), sw.js (service worker).

## Deployment and access

Deploy the repository through Vercel as a static site, without a build command. The root serves Assist and /runner/ serves Runner. Existing Supabase configuration and approved workspace membership are required. Users can sign in with approved accounts; new registrations require membership approval. On compatible Android/Zebra Chrome devices, open Runner and use the browser's install or add-to-home-screen option.

## Security and production readiness

- Obtain company approval before processing real warehouse or customer information.
- The deployed URL and client source are publicly reachable; access to shared data relies on authentication and database policies, not URL secrecy.
- Never place service-role keys, Logiwa credentials or private API tokens in client code.
- Review row-level security, role separation (including Runner-only access), dependency integrity, data retention, audit logs and backups with IT.
- Validate multi-user edits, report accuracy, task completion, issue handling and device installation before wider rollout.
- The app does not directly update Logiwa inventory. Automatic reconciliation of resolved SKUs against subsequent reports is not implemented.
- Foreground polling requires connectivity; offline task processing and background push are not implemented.

## Proposed Logiwa integration

Subject to employer authorization and supported Logiwa API access:

1. Confirm available endpoints, authentication, permissions, rate limits and sandbox access with IT/Logiwa.
2. Introduce a server-side integration layer that securely stores credentials.
3. Start with read-only shortage, inventory and replenishment task retrieval, preserving existing report rules.
4. Validate results against manual exports and introduce freshness, error handling and reconciliation.
5. Consider authorized write-back only after approval, testing, auditability and explicit inventory verification.

No direct Logiwa or Jira API integration is currently implemented.

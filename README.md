# SC Fleet Planner

A fully offline, privacy-first fleet planner and CCU chain builder for Star Citizen.

**No accounts. No cloud. No data leaves your browser.**

![Fleet Planner Screenshot](screenshots/planner.png)

## What It Does

- **Export your RSI hangar** with a lightweight browser extension (Chrome, Edge, Brave, Firefox, Opera)
- **See your fleet** with melt values, current store prices, insurance, and warbond savings
- **Plan CCU chains** — pick source ships, add intermediate steps, see costs and savings vs direct upgrades
- **Auto-detects owned CCUs** from your hangar and suggests them in your chains
- **Save your plan** as a JSON file to continue later or share with friends
- **Export for your org** — a clean ship list with zero financial data (no melt values, no prices)

## What Makes This Different

Yes, [CCU Game](https://ccugame.app/) exists and it's great. So do SC Org Tools, Hangar Link, and others. This tool fills a different niche:

- **Runs entirely offline** — one HTML file, open it from your desktop. No web service, no backend, no server.
- **Zero accounts** — no login, no registration, no cloud sync. Ever.
- **Financial privacy** — your melt values and CCU plans never leave your machine. The org export deliberately strips all pricing data.
- **Fully open source** — every line of code is readable. The extension is ~200 lines of JavaScript. Audit it yourself.

## Quick Start

### 1. Install the Extension

Download this repo. In your browser:

- **Chrome / Edge / Brave:** Go to `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, select the `extension/` folder.
- **Firefox:** Go to `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**, select `extension/manifest.json`.

### 2. Export Your Hangar

Go to [robertsspaceindustries.com/account/pledges](https://robertsspaceindustries.com/account/pledges). The export bar appears at the bottom. Click **Start Export**. It auto-pages through your entire hangar and downloads a CSV with your ships + current store prices from the Star Citizen Wiki API.

### 3. Open the Planner

Open `fleetplanner.html` in your browser (just double-click it). Drop your CSV on the import zone. Done.

## Store Prices

The extension fetches current ship prices from the [Star Citizen Wiki API](https://api.star-citizen.wiki) during export. These are community-maintained and updated daily. The prices are included in your CSV export, so the planner always has fresh data — no hardcoded price database to maintain.

## Privacy

- The extension only reads your RSI hangar page using your existing browser session
- Ship prices come from the public Star Citizen Wiki API (no authentication)
- No data is sent anywhere else. No analytics. No telemetry.
- The planner is a self-contained HTML file with zero network requests
- The org export contains only ship names and insurance — no melt values, no account info

## Known Issues & Limitations

- Store prices come from the Star Citizen Wiki and may lag behind RSI by up to 24 hours after a price change
- Some ship names from the wiki API may not perfectly match RSI hangar names (the planner handles most cases, but edge cases exist)
- The CCU chain builder is manual — you plan your own chains. It doesn't auto-optimize like CCU Game does.
- Firefox: the extension loads as a temporary add-on and needs to be re-added after browser restart
- This is a hobby project and might have bugs. Issues and PRs welcome!

## Credits

- Ship prices from [Star Citizen Wiki API](https://api.star-citizen.wiki)
- Star Citizen® is a trademark of Cloud Imperium Games
- Unofficial fan project, not affiliated with CIG


## Support

If this tool saved you some time (or some dollars on your CCU chains), feel free to:

☕ [Buy me a coffee](https://buymeacoffee.com/schindi21)

**BTC:** `bc1qdyh5g2zska7s9e4vu27hzqyyre60t6khl4srnx`

No pressure — the tool is and will always be free and open source.

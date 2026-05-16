# SC Fleet Export — Chrome Extension

Exports your RSI hangar (ships, paints, gear, CCUs) to CSV with one click.

## Install (Developer Mode)

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select this folder
5. Go to [robertsspaceindustries.com/account/pledges](https://robertsspaceindustries.com/account/pledges)
6. The export bar appears at the bottom — click **Start Export**

## How It Works

- Fetches your pledge pages using your existing RSI login session
- Parses each page for pledge items, prices, and contained ships
- Downloads a CSV compatible with SC Fleet Viewer
- All data stays in your browser — nothing is sent anywhere

## Troubleshooting

If the export finds 0 items:
1. Make sure you're logged in at RSI
2. Click the **Debug** button to see the log
3. The log shows which CSS classes were found on the page
4. Share the debug output so we can update the selectors

CIG occasionally changes their website structure, which can break the parser.
The debug log helps identify what changed so we can fix it quickly.

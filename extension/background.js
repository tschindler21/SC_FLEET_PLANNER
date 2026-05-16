// background.js - Fetches pages with appropriate settings per domain

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "FETCH_PAGE") {
    const isRSI = request.url.indexOf("robertsspaceindustries.com") >= 0;
    const fetchOpts = isRSI
      ? { credentials: "include", headers: { "X-Requested-With": "XMLHttpRequest" } }
      : {};  // No special headers for external APIs

    fetch(request.url, fetchOpts)
      .then(r => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      })
      .then(html => sendResponse({ success: true, html }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

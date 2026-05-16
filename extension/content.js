// content.js - SC Fleet Export v4.0
// Exports hangar (melt-value only) + ALL ship store prices from star-citizen.wiki API

(function() {
  if (document.getElementById("fleet-export-ui")) return;

  var panel = document.createElement("div");
  panel.id = "fleet-export-ui";
  panel.innerHTML = '<div style="position:fixed;bottom:0;left:0;right:0;z-index:2147483647;background:#0a0e17;border-top:2px solid #c89564;font-family:monospace;color:#e8edf2;"><div style="display:flex;align-items:center;gap:10px;padding:10px 16px;flex-wrap:wrap;"><span style="color:#c89564;font-weight:bold;font-size:14px;">SC FLEET EXPORT</span><span id="fe-status" style="color:#889;font-size:12px;">Ready</span><div style="flex:1;"></div><button id="fe-start" style="padding:8px 20px;background:#c89564;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:monospace;font-size:13px;">Start Export</button><button id="fe-close" style="padding:6px 10px;background:rgba(255,82,82,0.2);color:#ff5252;border:1px solid rgba(255,82,82,0.2);border-radius:4px;cursor:pointer;font-family:monospace;">X</button></div><div style="height:3px;background:rgba(255,255,255,0.05);"><div id="fe-prog" style="height:100%;width:0%;background:#c89564;transition:width 0.3s;"></div></div></div>';
  document.body.appendChild(panel);

  document.getElementById("fe-close").onclick = function() { panel.remove(); };
  document.getElementById("fe-start").onclick = startExport;

  function fetchPage(url) {
    return new Promise(function(resolve, reject) {
      chrome.runtime.sendMessage({ type: "FETCH_PAGE", url: url }, function(r) {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else if (r && r.success) resolve(r.html);
        else reject(new Error(r ? r.error : "Fetch failed"));
      });
    });
  }

  /* ── HANGAR PARSING ── */
  function parsePage(html) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    var pledges = doc.querySelectorAll("ul.list-items > li");
    var items = [];
    pledges.forEach(function(li) {
      var nameEl = li.querySelector("input.js-pledge-name");
      var valueEl = li.querySelector("input.js-pledge-value");
      if (!nameEl) return;
      var pledgeName = nameEl.value || "";
      var valueRaw = valueEl ? valueEl.value : "$0.00 USD";
      var valueMatch = valueRaw.match(/\$\s?([\d,]+(?:\.\d{2})?)/);
      var meltValue = valueMatch ? valueMatch[1].replace(",", "") : "0.00";
      var dateEl = li.querySelector(".date-col");
      var dateText = dateEl ? dateEl.textContent.replace(/Created:/i, "").trim() : "";
      var containedItems = [];
      li.querySelectorAll(".with-images .item").forEach(function(item) {
        var titleEl = item.querySelector(".text .title");
        var kindEl = item.querySelector(".text .kind");
        var mfrEl = item.querySelector(".text .liner span");
        if (titleEl && titleEl.textContent.trim()) {
          containedItems.push({ title: titleEl.textContent.trim(), kind: kindEl ? kindEl.textContent.trim() : "", mfr: mfrEl ? mfrEl.textContent.trim() : "" });
        }
      });
      li.querySelectorAll(".without-images .item").forEach(function(item) {
        var titleEl = item.querySelector(".title");
        if (titleEl && titleEl.textContent.trim()) {
          containedItems.push({ title: titleEl.textContent.trim(), kind: "Extra", mfr: "" });
        }
      });
      var insurance = "";
      containedItems.forEach(function(ci) {
        if (ci.kind === "Insurance" || ci.title.toLowerCase().indexOf("insurance") >= 0) insurance = ci.title;
      });
      items.push({ pledgeName: pledgeName, meltValue: meltValue, date: dateText, insurance: insurance, containedItems: containedItems });
    });
    return items;
  }

  function hasNextPage(html, currentPage) {
    return html.indexOf("page=" + (currentPage + 1)) >= 0;
  }

  function classifyItem(title, kind) {
    var tl = title.toLowerCase(), kl = kind.toLowerCase();
    if (kl === "skin" || tl.indexOf("paint") >= 0) return "Paint";
    if (kl === "ship") return "Ship";
    if (kl === "fps equipment" || tl.indexOf("gear") >= 0 || tl.indexOf("kit") >= 0 || tl.indexOf("armor") >= 0 || tl.indexOf("knife") >= 0 || tl.indexOf("rifle") >= 0 || tl.indexOf("pistol") >= 0 || tl.indexOf("lmg") >= 0 || tl.indexOf("smg") >= 0) return "Gear";
    if (tl.indexOf("upgrade") >= 0 || tl.indexOf("ccu") >= 0) return "CCU";
    if (kl === "extra" || tl.indexOf("hangar") >= 0 || tl.indexOf("poster") >= 0 || tl.indexOf("model") >= 0 || tl.indexOf("trophy") >= 0 || tl.indexOf("pennant") >= 0 || tl.indexOf("flair") >= 0) return "Flair";
    if (tl.indexOf("sweater") >= 0 || tl.indexOf("helmet") >= 0 || tl.indexOf("undersuit") >= 0 || tl.indexOf("backpack") >= 0) return "Gear";
    if (tl.indexOf("coin") >= 0 || tl.indexOf("planter") >= 0 || tl.indexOf("mug") >= 0 || tl.indexOf("cookie") >= 0 || tl.indexOf("display") >= 0) return "Flair";
    return "Ship";
  }

  /* ── STORE PRICE FETCHING from star-citizen.wiki API ── */
  function fetchStorePrices() {
    var status = document.getElementById("fe-status");
    status.textContent = "Fetching store prices from Star Citizen Wiki...";

    // The wiki API returns paginated results. Fetch all pages.
    var allShips = [];
    var page = 1;

    function fetchNext() {
      return fetchPage("https://api.star-citizen.wiki/api/v2/vehicles?limit=200&page=" + page)
        .then(function(resp) {
          try {
            var data = JSON.parse(resp);
            var vehicles = data.data || [];
            if (vehicles.length === 0) return allShips;

            vehicles.forEach(function(v) {
              var name = v.name || "";
              var price = 0;
              // Try different price fields
              if (v.pledge_price) price = parseFloat(v.pledge_price);
              else if (v.msrp) price = parseFloat(v.msrp);
              else if (v.pledge_cost) price = parseFloat(v.pledge_cost);

              var mfr = "";
              if (v.manufacturer && v.manufacturer.name) mfr = v.manufacturer.name;

              if (name) {
                allShips.push({ name: name, price: price, mfr: mfr, focus: v.focus || "", status: v.production_status || "" });
              }
            });

            status.textContent = "Fetched " + allShips.length + " ships...";

            // Check for more pages
            var meta = data.meta || {};
            var lastPage = meta.last_page || 1;
            if (page < lastPage) {
              page++;
              return fetchNext();
            }
            return allShips;
          } catch(e) {
            console.log("Wiki API parse error:", e);
            return allShips;
          }
        })
        .catch(function(e) {
          console.log("Wiki API fetch error:", e);
          status.textContent = "Wiki API unavailable (" + e.message + ")";
          return allShips;
        });
    }

    return fetchNext();
  }

  /* ── MAIN EXPORT ── */
  function startExport() {
    var btn = document.getElementById("fe-start");
    btn.disabled = true;
    btn.textContent = "Exporting...";
    var status = document.getElementById("fe-status");
    var prog = document.getElementById("fe-prog");

    var baseUrl = window.location.pathname.indexOf("/en/") >= 0
      ? "https://robertsspaceindustries.com/en/account/pledges?page="
      : "https://robertsspaceindustries.com/account/pledges?page=";

    var allPledges = [];
    var hangarPage = 1;

    function nextHangarPage() {
      if (hangarPage > 50) return fetchPricesThenExport();
      status.textContent = "Hangar page " + hangarPage + "...";
      prog.style.width = Math.min(hangarPage * 4, 60) + "%";

      fetchPage(baseUrl + hangarPage).then(function(html) {
        if (html.length < 500 || html.indexOf("sign in") >= 0 || html.indexOf("Sign In") >= 0) {
          status.textContent = "Not logged in! Sign in at RSI first.";
          btn.disabled = false; btn.textContent = "Start Export"; return;
        }
        var items = parsePage(html);
        if (items.length === 0) return fetchPricesThenExport();
        allPledges = allPledges.concat(items);
        if (!hasNextPage(html, hangarPage)) return fetchPricesThenExport();
        hangarPage++;
        setTimeout(nextHangarPage, 600);
      }).catch(function(err) {
        status.textContent = "Error: " + err.message;
        btn.disabled = false; btn.textContent = "Start Export";
      });
    }

    function fetchPricesThenExport() {
      prog.style.width = "70%";
      fetchStorePrices().then(function(storeShips) {
        prog.style.width = "100%";
        var meltCount = allPledges.filter(function(p){return parseFloat(p.meltValue)>0;}).length;
        downloadCSV(allPledges, storeShips);
        status.textContent = "Done! " + meltCount + " hangar items (of " + allPledges.length + " total) + " + storeShips.length + " store prices downloaded.";
        btn.disabled = false; btn.textContent = "Start Export";
      });
    }

    nextHangarPage();
  }

  /* ── CSV OUTPUT ── */
  function esc(s) { return (s + "").replace(/"/g, '""'); }

  function downloadCSV(pledges, storeShips) {
    var rows = [];
    rows.push('"Pledge Name","Item Name","Type","Melt Value","Store Value","Insurance","Manufacturer","Date"');

    // Section 1: Hangar items (only those with melt value)
    pledges.forEach(function(pledge) {
      if (parseFloat(pledge.meltValue) <= 0) return;
      var exportItems = pledge.containedItems.filter(function(ci) {
        return ci.kind !== "Insurance" && ci.title.toLowerCase().indexOf("insurance") < 0;
      });
      if (exportItems.length === 0) {
        rows.push('"' + esc(pledge.pledgeName) + '","' + esc(pledge.pledgeName) + '","Other","' + pledge.meltValue + '","' + pledge.meltValue + '","' + esc(pledge.insurance) + '","","' + esc(pledge.date) + '"');
      } else {
        exportItems.forEach(function(ci) {
          var type = classifyItem(ci.title, ci.kind);
          rows.push('"' + esc(pledge.pledgeName) + '","' + esc(ci.title) + '","' + type + '","' + pledge.meltValue + '","' + pledge.meltValue + '","' + esc(pledge.insurance) + '","' + esc(ci.mfr) + '","' + esc(pledge.date) + '"');
        });
      }
    });

    // Section 2: ALL store prices
    if (storeShips.length > 0) {
      rows.push('"---","---","---","---","---","---","---","---"');
      rows.push('"STORE PRICES","Ship Name","Type","Price","Price","Status","Manufacturer","Focus"');
      storeShips.forEach(function(s) {
        if (s.price > 0) {
          rows.push('"STORE","' + esc(s.name) + '","StoreShip","' + s.price + '","' + s.price + '","' + esc(s.status) + '","' + esc(s.mfr) + '","' + esc(s.focus) + '"');
        }
      });
    }

    var csv = rows.join("\n");
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "hangar_export.csv";
    a.click();
  }
})();

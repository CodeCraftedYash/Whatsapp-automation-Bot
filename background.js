let isRunning = false;
let pendingTabId = null;

chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ WhatsApp Automation Bot Installed");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startAutomation") {
    isRunning = true;

    chrome.tabs.query({ url: "https://web.whatsapp.com/*" }, (tabs) => {
      if (tabs.length === 0) {
        // Open WhatsApp if no tab exists
        chrome.tabs.create({ url: "https://web.whatsapp.com/" }, (tab) => {
          pendingTabId = tab.id; // remember until content.js says it's ready
        });
      } else {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, { action: "startAutomation" }).catch(() => {
            console.warn("⚠️ Content script not ready yet in tab", tab.id);
            pendingTabId = tab.id;
          });
        });
      }
    });

    sendResponse({ status: "running" });
  }

  if (request.action === "stopAutomation") {
    isRunning = false;
    chrome.tabs.query({ url: "https://web.whatsapp.com/*" }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { action: "stopAutomation" }).catch(() => {
          console.warn("⚠️ Tried to stop, but content script not ready", tab.id);
        });
      });
    });
    sendResponse({ status: "stopped" });
  }

  if (request.action === "getStatus") {
    sendResponse({ running: isRunning });
  }

  // Handshake: content.js tells us it's ready
  if (request.action === "contentReady") {
    console.log("📩 Content script ready in tab", sender.tab.id);
    if (isRunning && sender.tab.id === pendingTabId) {
      chrome.tabs.sendMessage(sender.tab.id, { action: "startAutomation" });
      pendingTabId = null;
    }
  }
});

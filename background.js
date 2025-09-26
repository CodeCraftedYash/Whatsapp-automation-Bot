let isRunning = false;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "startAutomation") {
    isRunning = true;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url.includes("web.whatsapp.com")) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "startAutomation" });
      }
    });
    sendResponse({ status: "running" });
  }

  if (msg.action === "stopAutomation") {
    isRunning = false;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url.includes("web.whatsapp.com")) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "stopAutomation" });
      }
    });
    sendResponse({ status: "stopped" });
  }

  if (msg.action === "getStatus") {
    sendResponse({ running: isRunning });
  }
});

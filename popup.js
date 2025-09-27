document.getElementById("startBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "startAutomation" }, (res) => {
    document.getElementById("statusText").innerText = res.status;
  });
});

document.getElementById("stopBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "stopAutomation" }, (res) => {
    document.getElementById("statusText").innerText = res.status;
  });
});

// Show current status on load
chrome.runtime.sendMessage({ action: "getStatus" }, (res) => {
  document.getElementById("statusText").innerText = res.running
    ? "running"
    : "stopped";
});

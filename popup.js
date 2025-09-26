const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const statusText = document.getElementById("statusText");
const animation = document.getElementById("animation");

const toggleUI = (running) => {
  statusText.textContent = running ? "Running" : "Stopped";
  if (running) {
    animation.classList.remove("displayNone");
    statusText.classList.add("running");
    animation.classList.add("active");
  } else {
    statusText.classList.remove("running");
    animation.classList.remove("active");
    animation.classList.add("displayNone");
  }
};

// Start automation
startBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "startAutomation" }, (res) => {
    toggleUI(true);
    console.log("starting automation...")
  });
});

// Stop automation
stopBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "stopAutomation" }, (res) => {
    toggleUI(false);
    console.log("stoping automation...")
  });
});

// Sync status when popup opens
chrome.runtime.sendMessage({ action: "getStatus" }, (res) => {
  toggleUI(res.running);
});

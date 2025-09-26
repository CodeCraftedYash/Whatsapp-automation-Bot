// ---------------------------- Setup ----------------------------
let automationRunning = false;

// Utility wait function
const wait = (ms = 500) => new Promise((res) => setTimeout(res, ms));

// ---------------------------- Wait for element ----------------------------
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout: Element ${selector} not found`));
    }, timeout);
  });
}

// ---------------------------- Simulate Click ----------------------------
function simulateClick(x, y) {
  const element = document.elementFromPoint(x, y);
  if (!element) return;
  ["mousedown", "mouseup", "click"].forEach((type) => {
    element.dispatchEvent(
      new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
      })
    );
  });
}

// ---------------------------- Exit Chat ----------------------------
function exitChat() {
  const escEvent = new KeyboardEvent("keydown", {
    key: "Escape",
    code: "Escape",
    keyCode: 27,
    which: 27,
    bubbles: true,
  });
  document.dispatchEvent(escEvent);
  console.log("🔙 Exited the chat");
}

// ---------------------------- Check Latest Message ----------------------------
async function checkLatestMessage(
  chatRow,
  keywords = ["hi", "hello", "hey", "h", "kya", "kaise", "ho"] // fallback if none passed
) {
  try {
    const messageText =
      chatRow.querySelector("span[dir='ltr']")?.innerText?.toLowerCase() || "";

    // Escape special regex characters in custom keywords
    const escaped = keywords.map((k) =>
      k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").toLowerCase()
    );

    // Build regex (match any keyword/phrase)
    const regex = new RegExp(`(?:${escaped.join("|")})`, "i");

    return regex.test(messageText);
  } catch (err) {
    console.error("❌ Failed to check latest message:", err);
    return false;
  }
}

// ---------------------------- Send Message (React-compatible) ----------------------------
async function sendMessage(
  message = "Hi . I am currently away !  Please leave me a message . Thank you"
) {
  try {
    const inputBox = await waitForElement(
      'div[aria-placeholder="Type a message"]',
      3000
    );
    if (!inputBox) return console.error("Input box not found");

    inputBox.focus();

    document.execCommand("selectAll", false, null); // clear any existing
    document.execCommand("insertText", false, message);
    inputBox.dispatchEvent(new InputEvent("input", { bubbles: true }));

    // Press Enter after 1 second
    setTimeout(() => {
      inputBox.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          code: "Enter",
          keyCode: 13,
          which: 13,
          bubbles: true,
        })
      );
      console.log("📩 Message sent:", message);
    }, 1000); // 1s delay between operations
  } catch (err) {
    console.error("⚠️ Failed to send message:", err);
  }
}

// ---------------------------- Observe Unread Chats ----------------------------
const unreadObserver = new MutationObserver(() => {
  if (!automationRunning) return;

  const allChatRows = document.querySelectorAll("#pane-side div[role='row']");
  allChatRows.forEach((chatRow) => {
    const badge = chatRow.querySelector("span[aria-label*='unread message']");
    if (badge && parseInt(badge.innerText) > 0) {
      const coords = chatRow.getBoundingClientRect();
      simulateClick(
        coords.left + coords.width / 2,
        coords.top + coords.height / 2
      );

      // Wait 1s for chat to open and send message
      setTimeout(async () => {
        const latest = await checkLatestMessage(chatRow);
        const second = await checkLatestMessage(chatRow, [
          "how are you",
          "kysa hai",
          "kyse ho",
          "are you doing well",
          "sab thik",
        ]);
        if (latest) {
          await sendMessage("Hello ! This is an automatic response ! I am testing my bot");
        }
        if (second) {
          await sendMessage("I am fine Thankyou for asking");
        }
        setTimeout(exitChat, 1000); // wait 1s before exiting
      }, 1000);
    }
  });
});

// ---------------------------- Start/Stop Automation ----------------------------
async function startAutomation() {
  console.log("⏳ Starting automation... waiting 4s for page to stabilize");
  await wait(4000); // 4s wait at automation start

  const leftChatContainer = await waitForElement("#pane-side", 5000);
  if (!leftChatContainer) {
    console.log("❌ Could not find left chat container");
    return;
  }

  console.log("⏳ Waiting 2s for major elements to load");
  await wait(2000); // 2s wait for major elements

  unreadObserver.observe(leftChatContainer, { childList: true, subtree: true });
  console.log("🚀 Automation started");
}

function stopAutomation() {
  automationRunning = false;
  unreadObserver.disconnect();
  console.log("🛑 Automation stopped");
}

// ---------------------------- Message Listener ----------------------------
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "startAutomation") {
    automationRunning = true;
    startAutomation();
  }
  if (msg.action === "stopAutomation") {
    stopAutomation();
  }
});

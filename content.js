if (!window.hasOwnProperty("automationInjected")) {
  window.automationInjected = true;

  chrome.runtime.sendMessage({ action: "contentReady" });

  let automationRunning = false;

  const wait = (ms = 1000) => new Promise((res) => setTimeout(res, ms));

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

  async function exitChat() {
    await wait(1000);
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

  async function checkLatestMessage(chatRow, keywords) {
    try {
      const messageText =
        chatRow.querySelector("span[dir='ltr']")?.innerText?.toLowerCase() ||
        "";

      const escaped = keywords.map((k) =>
        k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").toLowerCase()
      );

      const regex = new RegExp(`\\b(?:${escaped.join("|")})\\b`, "i");
      return regex.test(messageText);
    } catch (err) {
      console.error("❌ Failed to check first message:", err);
      return false;
    }
  }

  async function sendMessage(message, inputBox) {
    await wait(1000);
    try {
      if (!inputBox) return console.error("Input box not found");

      inputBox.focus();
      document.execCommand("selectAll", false, null);
      document.execCommand("insertText", false, message);
      inputBox.dispatchEvent(new InputEvent("input", { bubbles: true }));
      console.log("📩 Message sent:", message);
    } catch (err) {
      console.error("⚠️ Failed to send message:", err);
    }
  }

  async function pressEnter (element){
    await wait(500);
      element.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          code: "Enter",
          keyCode: 13,
          which: 13,
          bubbles: true,
        })
      );
  }

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

        (async () => {
          const inputBox = await waitForElement(
            'div[aria-placeholder="Type a message"]',
            3000
          );
          await wait(500);

          const first = await checkLatestMessage(chatRow, [
            "hi",
            "hello",
            "hey",
            "hii",
            "hiiii",
            "sup",
          ]);
          const second = await checkLatestMessage(chatRow, [
            "how are you",
            "kysa hai",
            "kyse ho",
            "kysa ha",
            "are you good",
            "are you doing well",
          ]);
          const third = await checkLatestMessage(chatRow, [
            "I am good",
            "Good",
            "Fine",
            "Everything is fine",
            "Doing well",
            "I’m great",
            "Pretty good",
            "Not bad",
            "I’m okay",
            "Feeling good",
            "All good",
            "I’m doing fine",
            "Could be better",
            "I’m doing well",
            "Everything's okay",
            "I’m alright",
            "Fantastic",
            "Excellent",
            "Happy",
            "Feeling blessed",
          ]);
          const fourth = await checkLatestMessage(chatRow, ['Yash','where is yash','who is yash', 'yash kaha hai','do you know yash' , 'yash kaha ho','where are you', 'how can i talk to you','when are you available'])
          if (first){
            await sendMessage(
              "Hello ! This is an automatic response ! I am testing my bot \n",inputBox);
              pressEnter(inputBox);
            }
          else if (second){
            await sendMessage("I am fine Thank you for asking and How are You?", inputBox);
            pressEnter(inputBox);
          }
            else if (third){
            await sendMessage("That sounds fabulous!", inputBox);
            pressEnter(inputBox);
            }
            else if(fourth){
            await sendMessage("I am a Bot so I can not talk to you \n Please leave a message for Yash , He will check it when he gets home",inputBox);
            pressEnter(inputBox);
          }
          await exitChat();
        })();
      }
    });
  });

  async function startAutomation() {
    automationRunning = true;
    console.log("⏳ Starting automation... waiting 4s for page to stabilize");
    await wait(4000);

    const leftChatContainer = await waitForElement("#pane-side", 5000);
    if (!leftChatContainer) {
      console.log("❌ Could not find left chat container");
      return;
    }

    console.log("⏳ Waiting 2s for major elements to load");
    await wait(2000);

    unreadObserver.observe(leftChatContainer, {
      childList: true,
      subtree: true,
    });
    console.log("🚀 Automation started");
  }

  function stopAutomation() {
    automationRunning = false;
    unreadObserver.disconnect();
    console.log("🛑 Automation stopped");
  }

  // ✅ Listen for background commands
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "startAutomation") startAutomation();
    if (msg.action === "stopAutomation") stopAutomation();
  });
}

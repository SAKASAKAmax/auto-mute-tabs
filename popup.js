document.addEventListener('DOMContentLoaded', async () => {
  const btn = document.getElementById('toggleMute');
  const settingsBtn = document.getElementById('openSettings');
  const autoMuteBtn = document.getElementById('addToAutoMute');

  // 設定ボタンのクリックイベント
  settingsBtn.onclick = () => {
    chrome.runtime.openOptionsPage();
  };

  // タブの状態を更新する関数
  async function updateTabState() {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    if (!tab) {
      btn.textContent = "No tab found";
      btn.disabled = true;
      return;
    }
    updateButtonState(tab.mutedInfo?.muted);
    updateAutoMuteButtonState(tab.url);
  }

  // 自動ミュートボタンの状態を更新
  async function updateAutoMuteButtonState(url) {
    try {
      const hostname = new URL(url).hostname;
      const { muteDomains = [] } = await chrome.storage.sync.get('muteDomains');
      
      if (muteDomains.includes(hostname)) {
        autoMuteBtn.textContent = "ADDED";
        autoMuteBtn.classList.add('added');
        autoMuteBtn.disabled = true;
      } else {
        autoMuteBtn.textContent = "ADD";
        autoMuteBtn.classList.remove('added');
        autoMuteBtn.disabled = false;
      }
    } catch (error) {
      console.error('Failed to update auto mute button state:', error);
      autoMuteBtn.disabled = true;
    }
  }

  // 初期状態の更新
  updateTabState();

  // タブの状態変更を監視
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.mutedInfo || changeInfo.url) {
      updateTabState();
    }
  });

  // ミュートトグルボタンのクリックイベント
  btn.onclick = async () => {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    if (!tab) return;

    const newMutedState = !(tab.mutedInfo?.muted);
    try {
      await chrome.tabs.update(tab.id, { muted: newMutedState });
      updateButtonState(newMutedState);
    } catch (error) {
      console.error('Failed to update tab state:', error);
      updateTabState();
    }
  };

  // 自動ミュート追加ボタンのクリックイベント
  autoMuteBtn.onclick = async () => {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    if (!tab?.url) return;

    try {
      const hostname = new URL(tab.url).hostname;
      const { muteDomains = [] } = await chrome.storage.sync.get('muteDomains');
      
      if (!muteDomains.includes(hostname)) {
        muteDomains.push(hostname);
        await chrome.storage.sync.set({ muteDomains });
        updateAutoMuteButtonState(tab.url);
      }
    } catch (error) {
      console.error('Failed to add domain to auto mute list:', error);
    }
  };
});

// ボタンの状態を更新する関数
function updateButtonState(isMuted) {
  const btn = document.getElementById('toggleMute');
  btn.textContent = isMuted ? "UNMUTE" : "MUTE";
  btn.classList.toggle('muted', isMuted);
  btn.disabled = false;
}

// 指定ドメインのタブを自動ミュート

// ドメインリストを取得
async function getDomains() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({muteDomains: []}, (data) => {
      resolve(data.muteDomains);
    });
  });
}

// ミュート判定
function shouldMute(url, domains) {
  if (!url) return false;
  try {
    const host = new URL(url).hostname;
    return domains.some(domain => host.endsWith(domain));
  } catch {
    return false;
  }
}

// タブ更新イベント
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    const domains = await getDomains();
    if (shouldMute(tab.url, domains)) {
      chrome.tabs.update(tabId, { muted: true });
    }
  }
});

// タブ作成イベント
chrome.tabs.onCreated.addListener(async (tab) => {
  const domains = await getDomains();
  if (shouldMute(tab.url, domains)) {
    chrome.tabs.update(tab.id, { muted: true });
  }
});

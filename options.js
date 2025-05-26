// ドメイン一覧の更新
function updateDomainList(domains) {
  const list = document.getElementById("domainList");
  list.innerHTML = "";
  domains.forEach((domain, idx) => {
    const li = document.createElement("li");
    li.textContent = domain + " ";
    const delBtn = document.createElement("button");
    delBtn.textContent = "削除";
    delBtn.onclick = () => {
      domains.splice(idx, 1);
      chrome.storage.sync.set({muteDomains: domains}, () => updateDomainList(domains));
    };
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

// 初期化
function loadDomains() {
  chrome.storage.sync.get({muteDomains: []}, (data) => {
    updateDomainList(data.muteDomains);
  });
}

document.getElementById("addDomainForm").onsubmit = (e) => {
  e.preventDefault();
  const input = document.getElementById("domainInput");
  let newDomain = input.value.trim();

  // 入力値からドメイン抽出
  try {
    if (newDomain.startsWith("http://") || newDomain.startsWith("https://")) {
      newDomain = new URL(newDomain).hostname;
    }
    // パス付きでも、hostnameだけ抜く
    if (!newDomain.includes(".") && newDomain !== "localhost") {
      alert("有効なドメインまたはURLを入力してください。");
      return;
    }
  } catch (e) {
    alert("有効なドメインまたはURLを入力してください。");
    return;
  }

  chrome.storage.sync.get({muteDomains: []}, (data) => {
    if (!data.muteDomains.includes(newDomain)) {
      data.muteDomains.push(newDomain);
      chrome.storage.sync.set({muteDomains: data.muteDomains}, () => loadDomains());
    }
  });
  input.value = "";
};

loadDomains();

function closeDuplicateTabs(currentTab) {
  chrome.tabs.query({ currentWindow: true, active: false },
    tabs => {
      if (tabs.length) {
        tabs.sort(tabSorter);

        let closeTabIds = [];
        while (tabs.length) {
          let tab = tabs.shift();
          if (tab.url == currentTab.url) {
            closeTabIds.push(tab.id);
          } else {
            let closeTabs = tabs.filter(tabOther => tabOther.url == tab.url);
            if (closeTabs.length) {
              closeTabIds.push(...closeTabs.map(tabOther => tabOther.id));
            }
          }
        }

        chrome.tabs.remove(closeTabIds);
      }
    }
  );
}

function tabSorter(a, b) {
  if (a.status == "complete" && b.status == "loading") return -1;
  if (a.status == "loading" && b.status == "complete") return 1;
  return a.index - b.index;
}

function openUniqueTab(url, menuItemId) {
  chrome.tabs.query({}, tabs => {
    tabs = tabs.filter(tab => tab.url == url);
    if (tabs.length == 0) {
      chrome.tabs.create({ active: (menuItemId == "openUniqueTab"), url });
    } else if (menuItemId == "openUniqueTab") {
      chrome.tabs.update(tabs[0].id, { active: true });
    }
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openUniqueTab",
    title: chrome.i18n.getMessage("openUniqueTab"),
    contexts: ["link"]
  });

  chrome.contextMenus.create({
    id: "openBgUniqueTab",
    title: chrome.i18n.getMessage("openBgUniqueTab"),
    contexts: ["link"]
  });
});

chrome.browserAction.onClicked.addListener(currentTab =>
  closeDuplicateTabs(currentTab)
);

chrome.contextMenus.onClicked.addListener(info =>
  openUniqueTab(info.linkUrl, info.menuItemId)
);

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({enabled: true});
});

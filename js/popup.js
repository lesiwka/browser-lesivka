document.addEventListener('DOMContentLoaded', function () {
    let enableSwitch = document.getElementById('enable');
    chrome.storage.sync.get('enabled', function(data) {
        enableSwitch.checked = data.enabled;
    });
    enableSwitch.addEventListener('click', function (element) {
        let enabled = element.target.checked;
        chrome.storage.sync.set({enabled: enabled});
    });

    let reloadButton = document.getElementById('reload');
    reloadButton.addEventListener('click', function () {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.reload(tabs[0].id);
            let start = new Date().getTime();
            while ((new Date().getTime() - start) < 500) {}
            window.close();
        });
    });
});

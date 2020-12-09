console.log('Hello Background');
console.log(chrome.tabs);

chrome.tabs.query({}, function (tabs) {
  console.log(tabs);
});


chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log(sender.tab ?
      "from a content script:" + sender.tab.url :
      "from the extension", request);
    if (request.msg == "createNewTab")
      chrome.tabs.create({ url: request.url }, (newTab) => {
        console.log("newTabId", newTab.id, "scroll:", request.scroll);
        setTimeout(() => {
          var code = `window.addEventListener('load', function(event) {
          window.scrollTo(0, ${request.scroll});
          console.log("script loaded!");
        });`;
          chrome.tabs.executeScript(newTab.id, { code }, (result) => {
            console.log(result);
          });
        }, 1000);
      });
    sendResponse({ farewell: "goodbye" })
  }
);


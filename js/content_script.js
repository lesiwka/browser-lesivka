function walk(rootNode)
{
    // Find all the text nodes in rootNode
    const walker = document.createTreeWalker(
        rootNode,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
        null
    );

    let node = walker.nextNode();
    let nextNode;

    // Modify each text node's value
    while (nextNode = walker.nextNode()) {
        handleNode(node, nextNode);
        node = nextNode;
    }

    handleNode(node);
}

function handleNode(node, nextNode) {
    if (node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            handleAttrs(node);
        } else if (node.nodeType === Node.TEXT_NODE) {
            handleText(node, nextNode);
        }
    }
}

function handleAttrs(node) {
    if (node.placeholder) {
        try {
            node.placeholder = lesiwka.encode(node.placeholder);
        } catch (err) {
            console.error(err, node.placeholder);
        }
    }

    if (node.title && typeof node.title == "string") {
        try {
            node.title = lesiwka.encode(node.title);
        } catch (err) {
            console.error(err, node, node.title);
        }
    }

    if (node.value) {
        try {
            node.value = lesiwka.encode(node.value);
        } catch (err) {
            console.error(err, node.value);
        }
    }
}

function handleText(node, nextNode) {
    let nodeValue = node.nodeValue;
    try {
        let encodedValue = lesiwka.encode(nodeValue);
        let encodedLength = encodedValue.length;

        if (nextNode) {
            nodeValue += " " + nextNode.textContent.slice(0, 5);
            encodedValue = lesiwka.encode(nodeValue).slice(0, encodedLength);
        }

        node.nodeValue = encodedValue;
    } catch (err) {
        if (err.message !== "Maximum call stack size exceeded") {
            console.error(err, node.nodeValue);
        }
    }
}

// The callback used for the document body and title observers
function observerCallback(mutations) {
    mutations.forEach(function(mutation) {
        for (let node of mutation.addedNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                // Replace the text for text nodes
                handleText(node);
            } else {
                // Otherwise, find text nodes within the given node and replace text
                handleAttrs(node);
                walk(node);
            }
        }
    });
}

// Walk the doc (document) body, replace the title, and observe the body and title
function walkAndObserve(doc) {
    let docTitle = doc.getElementsByTagName('title')[0],
    observerConfig = {
        characterData: true,
        childList: true,
        subtree: true
    },
    bodyObserver, titleObserver;

    // Do the initial text replacements in the document body and title
    walk(doc.body);
    doc.title = lesiwka.encode(doc.title);

    // Observe the body so that we replace text in any added/modified nodes
    bodyObserver = new MutationObserver(observerCallback);
    bodyObserver.observe(doc.body, observerConfig);

    // Observe the title so we can handle any modifications there
    if (docTitle) {
        titleObserver = new MutationObserver(observerCallback);
        titleObserver.observe(docTitle, observerConfig);
    }
}

chrome.storage.sync.get('enabled', function(data) {
    if (data.enabled) {
        walkAndObserve(document);
    }
});

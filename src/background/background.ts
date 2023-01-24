let isEnableFeatures = false;
let featureFlagChanges = {};
chrome.storage.local.get('isEnableFeatures').then(({isEnableFeatures: newIsEnableFeatures}) => {
    if (newIsEnableFeatures) {
        isEnableFeatures = true;
    }
});

chrome.storage.local.get('featureFlagChanges').then(({featureFlagChanges: newFeatureFlagChanges}) => {
    if (newFeatureFlagChanges) {
        featureFlagChanges = newFeatureFlagChanges;
    }
});

chrome.storage.local.onChanged.addListener((changes) => {
    if (changes['isEnableFeatures']) {
        isEnableFeatures = changes['isEnableFeatures'].newValue;
    }
    if (changes['featureFlagChanges']) {
        featureFlagChanges = changes['featureFlagChanges'].newValue;
    }
});


const makeInitialStateInject = (featureFlags: Record<string, any>) => {
  const code =`
    window.__INITIAL_STATE_COPY__ = {};
    Object.defineProperty(window, '__INITIAL_STATE__', {
        get: () => window.__INITIAL_STATE_COPY__,
        set: (newVal) => {
            console.log('>>> THF enabled');
            chrome.runtime.sendMessage("${chrome.runtime.id}", {type: 'initialState', value: newVal});
            window.__INITIAL_STATE_COPY__ = newVal;
            window.__INITIAL_STATE_COPY__.featureSwitch.user.config = {
                ...window.__INITIAL_STATE_COPY__.featureSwitch.user.config,
                ...${JSON.stringify(featureFlags)}
            };
        },
        configurable: true,
    });
    true`;
    return code;
}

const eventListener: (debugee: any, method: string, params?: any) => void = async (debugee, method, params) => {
    if (method === "Debugger.paused") {
        const expression = makeInitialStateInject(featureFlagChanges);
        try {
            await chrome.debugger.sendCommand(debugee, 'Debugger.evaluateOnCallFrame', {
                    callFrameId: params.callFrames[0].callFrameId,
                    expression,
            });
            await chrome.debugger.sendCommand(debugee, 'Debugger.resume');
        } catch(e: any) {
            console.error(e);
            if (e.message.toLowerCase().indexOf('cannot find context with specified id') > -1) {
                await chrome.tabs.reload();
            } else {
                console.error(e);
            }
        }
    }
};

chrome.debugger.onEvent.addListener(eventListener);

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    const isTwitterPage  = tab.url && tab.url.indexOf("https://twitter.com/") === 0;
    if (isTwitterPage && isEnableFeatures && changeInfo.status === "loading") {
        try {
            await chrome.debugger.sendCommand({tabId}, 'Debugger.pause');
        } catch (e: any) {
            if (e.message.toLowerCase().indexOf('debugger is not attached') > -1) {
                await chrome.debugger.attach({ tabId }, "1.3");
                await chrome.debugger.sendCommand({tabId}, 'Debugger.enable');
                await chrome.tabs.reload();
            } else if (e.message.toLowerCase().indexOf('debugger agent is not enabled') > -1) {
                await chrome.debugger.sendCommand({tabId}, 'Debugger.enable');
                await chrome.tabs.reload();
            } else {
                console.error(e);
            }
        }
    }
});

// listening for messages
chrome.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
        switch(request.type) {
            case 'isEnableFeatures': 
                if (!request.value) {
                    try {
                        await chrome.debugger.sendCommand({tabId: sender.tab!.id!}, 'Debugger.disable');
                        await chrome.debugger.detach({ tabId: sender.tab!.id! });
                    } catch (_) {}
                }
                await chrome.storage.local.set({isEnableFeatures: request.value});
                sendResponse();
                await chrome.tabs.reload();
                break;
            case 'saveFeatureFlagChanges':
                await chrome.storage.local.set({featureFlagChanges: request.value});
                try {
                    let queryOptions = { active: true, lastFocusedWindow: true };
                    let [tab] = await chrome.tabs.query(queryOptions);
                    if (tab) {
                        await chrome.debugger.sendCommand({tabId: tab.id!}, 'Debugger.disable');
                        await chrome.debugger.detach({ tabId: tab.id! });
                    }
                } catch(_) {}
                await chrome.tabs.reload();
                break;
            case 'reload':
                await chrome.tabs.reload();
                break;
        }

        return true;
    }
);

chrome.runtime.onMessageExternal.addListener(
    async(request, sender, sendResponse) => {
        switch(request.type) {
            case 'initialState':
                console.log('>>> setting initial state');
                console.log('>>> featureFlagChanges: ', featureFlagChanges);
                await chrome.storage.local.set({featureFlags: request.value.featureSwitch.user.config});
            break;
        }
        return true;
    }
);
const allResourceTypes = Object.values(chrome.declarativeNetRequest.ResourceType);

const rules: chrome.declarativeNetRequest.Rule[] = [
  {
    id: 1,
    priority: 1,
    action: {
      type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
      requestHeaders: [
        {
          operation: chrome.declarativeNetRequest.HeaderOperation.SET,
          header: 'user-agent',
          value: 'Mozilla/5.0 (Linux; Android 11; Android TV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Mobile Safari/537.36',
        },
      ]
    },
    condition: {
      urlFilter: '||x.com/i/tv*',
      resourceTypes: allResourceTypes,
    }
  },
  {
    id: 2,
    priority: 1,
    action: {
      type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
      responseHeaders: [
        {
          operation: chrome.declarativeNetRequest.HeaderOperation.SET,
          header: 'x-modifed-headers',
          value: 'true',
        },
      ]
    },
    condition: {
      urlFilter: '||x.com/i/tv*',
      resourceTypes: allResourceTypes,
    }
  },
];

export default rules;
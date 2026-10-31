import { createInstance } from 'i18next';
import { expect, it } from 'vitest';
import auth from './resources/en/auth.json';
import common from './resources/en/common.json';
import connections from './resources/en/connections.json';
import routing from './resources/en/routing.json';
import ui from './resources/en/ui.json';
import jaUi from './resources/ja/ui.json';

const i18n = createInstance();
await i18n.init({
    lng: 'en',
    resources: { en: { auth, common, connections, routing, ui }, ja: { ui: jaUi } },
    interpolation: { escapeValue: false },
});

it.each([
    ['ui:eventCount', '1 event', '2 events'],
    ['ui:failedBadge', '1 failure', '2 failures'],
    ['ui:blockCount', '1 block', '2 blocks'],
    ['ui:entryCount', '1 entry', '2 entries'],
    ['ui:peerCount', '1 peer', '2 peers'],
    ['ui:stepCount', '1 step', '2 steps'],
    ['ui:aliasesMirrorsCount', '1 alias or mirror', '2 aliases and mirrors'],
    ['auth:groups.memberCount', '1 member', '2 members'],
    ['routing:impact', 'Used in 1 place', 'Used in 2 places'],
    ['routing:nodeCount', '1 node', '2 nodes'],
    ['routing:groupCount', '1 group', '2 groups'],
    ['connections:circuit.rulesChecked', '1 rule checked', '2 rules checked'],
    ['common:pagination.itemCount', '1 item', '2 items'],
])('%s agrees with its count', (key, singular, plural) => {
    expect(i18n.t(key, { count: 1 })).toBe(singular);
    expect(i18n.t(key, { count: 2 })).toBe(plural);
    expect(i18n.t(key, { count: 0 })).toBe(plural.replace('2', '0'));
});

it('keeps the number in languages without a singular form', () => {
    expect(i18n.t('ui:eventCount', { count: 1, lng: 'ja' })).toBe('1 件のイベント');
});

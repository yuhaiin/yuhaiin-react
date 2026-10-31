import koCertificates from './resources/ko/certificates.json';
import jaCertificates from './resources/ja/certificates.json';
import enCertificates from './resources/en/certificates.json';
import enAuth from './resources/en/auth.json';
import jaAuth from './resources/ja/auth.json';
import koAuth from './resources/ko/auth.json';
import enTrafficControl from './resources/en/traffic-control.json';
import jaTrafficControl from './resources/ja/traffic-control.json';
import koTrafficControl from './resources/ko/traffic-control.json';
import enGateway from './resources/en/gateway.json';
import jaGateway from './resources/ja/gateway.json';
import koGateway from './resources/ko/gateway.json';
import enRouting from './resources/en/routing.json';
import jaRouting from './resources/ja/routing.json';
import koRouting from './resources/ko/routing.json';
import koDiagnostics from './resources/ko/diagnostics.json';
import jaDiagnostics from './resources/ja/diagnostics.json';
import enDiagnostics from './resources/en/diagnostics.json';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { fallbackLanguage, supportedLanguages } from './languages';

import enCommon from './resources/en/common.json';
import enNav from './resources/en/nav.json';
import enLogin from './resources/en/login.json';
import enHome from './resources/en/home.json';
import enWebui from './resources/en/webui.json';
import enConfig from './resources/en/config.json';
import enGroup from './resources/en/group.json';
import enInbound from './resources/en/inbound.json';
import enBypass from './resources/en/bypass.json';
import enConnections from './resources/en/connections.json';
import enNode from './resources/en/node.json';

import jaCommon from './resources/ja/common.json';
import jaNav from './resources/ja/nav.json';
import jaLogin from './resources/ja/login.json';
import jaHome from './resources/ja/home.json';
import jaWebui from './resources/ja/webui.json';
import jaConfig from './resources/ja/config.json';
import jaGroup from './resources/ja/group.json';
import jaInbound from './resources/ja/inbound.json';
import jaBypass from './resources/ja/bypass.json';
import jaConnections from './resources/ja/connections.json';
import jaNode from './resources/ja/node.json';

import koCommon from './resources/ko/common.json';
import koNav from './resources/ko/nav.json';
import koLogin from './resources/ko/login.json';
import koHome from './resources/ko/home.json';
import koWebui from './resources/ko/webui.json';
import koConfig from './resources/ko/config.json';
import koGroup from './resources/ko/group.json';
import koInbound from './resources/ko/inbound.json';
import koBypass from './resources/ko/bypass.json';
import koConnections from './resources/ko/connections.json';
import koNode from './resources/ko/node.json';

import enUi from './resources/en/ui.json';
import jaUi from './resources/ja/ui.json';
import koUi from './resources/ko/ui.json';

const resources = {
    en: { certificates: enCertificates, auth: enAuth, trafficControl: enTrafficControl, gateway: enGateway, routing: enRouting, diagnostics: enDiagnostics, ui: enUi, common: enCommon, nav: enNav, login: enLogin, home: enHome, webui: enWebui, config: enConfig, group: enGroup, inbound: enInbound, bypass: enBypass, connections: enConnections, node: enNode },
    ja: { certificates: jaCertificates, auth: jaAuth, trafficControl: jaTrafficControl, gateway: jaGateway, routing: jaRouting, diagnostics: jaDiagnostics, ui: jaUi, common: jaCommon, nav: jaNav, login: jaLogin, home: jaHome, webui: jaWebui, config: jaConfig, group: jaGroup, inbound: jaInbound, bypass: jaBypass, connections: jaConnections, node: jaNode },
    ko: { certificates: koCertificates, auth: koAuth, trafficControl: koTrafficControl, gateway: koGateway, routing: koRouting, diagnostics: koDiagnostics, ui: koUi, common: koCommon, nav: koNav, login: koLogin, home: koHome, webui: koWebui, config: koConfig, group: koGroup, inbound: koInbound, bypass: koBypass, connections: koConnections, node: koNode },
};

i18n.use(initReactI18next).init({
    resources,
    lng: fallbackLanguage,
    fallbackLng: fallbackLanguage,
    supportedLngs: [...supportedLanguages],
    ns: ['certificates', 'trafficControl', 'gateway', 'routing', 'diagnostics', 'ui', 'common', 'nav', 'login', 'home', 'webui', 'config', 'group', 'inbound', 'bypass', 'connections', 'node'],
    defaultNS: 'common',
    interpolation: {
        escapeValue: false,
    },
    returnEmptyString: false,
});

export default i18n;

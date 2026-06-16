import dynamic from '@/component/AsyncComponent';
import Loading from '@/component/v2/loading';

const loading = Loading;

const LoginPage = dynamic(() => import('@/docs/login/page'), { loading });
const HomePage = dynamic(() => import('@/docs/home/page'), { loading });
const GroupPage = dynamic(() => import('@/docs/group/page'), { loading });
const GroupSubscribePage = dynamic(() => import('@/docs/group/subscribe/page'), { loading });
const GroupPublishPage = dynamic(() => import('@/docs/group/publish/page'), { loading });
const GroupActivatesPage = dynamic(() => import('@/docs/group/activates/page'), { loading });
const InboundPage = dynamic(() => import('@/docs/inbound/page'), { loading });
const BypassPage = dynamic(() => import('@/docs/bypass/page'), { loading });
const BypassListPage = dynamic(() => import('@/docs/bypass/list/page'), { loading });
const BypassTagPage = dynamic(() => import('@/docs/bypass/tag/page'), { loading });
const BypassResolverPage = dynamic(() => import('@/docs/bypass/resolver/page'), { loading });
const BypassTestPage = dynamic(() => import('@/docs/bypass/test/page'), { loading });
const BypassBlockPage = dynamic(() => import('@/docs/bypass/block/page'), { loading });
const ConnectionsV2Page = dynamic(() => import('@/docs/connections/v2/page'), { loading });
const ConnectionsHistoryPage = dynamic(() => import('@/docs/connections/history/page'), { loading });
const ConnectionsFailedPage = dynamic(() => import('@/docs/connections/failed/page'), { loading });
const ConfigPage = dynamic(() => import('@/docs/config/page'), { loading });
const WebUIPage = dynamic(() => import('@/docs/webui/page'), { loading });
const ConfigBackupPage = dynamic(() => import('@/docs/config/backup/page'), { loading });
const ConfigLogPage = dynamic(() => import('@/docs/config/log/page'), { loading });
const ConfigPprofPage = dynamic(() => import('@/docs/config/pprof/page'), { loading });
const ConfigDocumentsPage = dynamic(() => import('@/docs/config/documents/page'), { loading });
const ConfigLicensesPage = dynamic(() => import('@/docs/config/licenses/page'), { loading });
const ConfigAboutPage = dynamic(() => import('@/docs/config/about/page'), { loading });

export const appRoutes = [
    { path: "/login", component: LoginPage },
    { path: "/", component: HomePage },
    { path: "/docs/group", component: GroupPage },
    { path: "/docs/group/subscribe", component: GroupSubscribePage },
    { path: "/docs/group/publish", component: GroupPublishPage },
    { path: "/docs/group/activates", component: GroupActivatesPage },
    { path: "/docs/inbound", component: InboundPage },
    { path: "/docs/bypass", component: BypassPage },
    { path: "/docs/bypass/list", component: BypassListPage },
    { path: "/docs/bypass/tag", component: BypassTagPage },
    { path: "/docs/bypass/resolver", component: BypassResolverPage },
    { path: "/docs/bypass/test", component: BypassTestPage },
    { path: "/docs/bypass/block", component: BypassBlockPage },
    { path: "/docs/connections/v2", component: ConnectionsV2Page },
    { path: "/docs/connections/history", component: ConnectionsHistoryPage },
    { path: "/docs/connections/failed", component: ConnectionsFailedPage },
    { path: "/docs/config", component: ConfigPage },
    { path: "/docs/webui", component: WebUIPage },
    { path: "/docs/config/backup", component: ConfigBackupPage },
    { path: "/docs/config/log", component: ConfigLogPage },
    { path: "/docs/config/pprof", component: ConfigPprofPage },
    { path: "/docs/config/documents", component: ConfigDocumentsPage },
    { path: "/docs/config/licenses", component: ConfigLicensesPage },
    { path: "/docs/config/about", component: ConfigAboutPage },
];

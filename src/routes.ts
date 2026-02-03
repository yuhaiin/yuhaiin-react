// Imports for Pages
import HomePage from '@/docs/home/page';
import ConfigPage from '@/docs/config/page';
import ConfigLicensesPage from '@/docs/config/licenses/page';
import ConfigLogPage from '@/docs/config/log/page';
import ConfigBackupPage from '@/docs/config/backup/page';
import ConfigAboutPage from '@/docs/config/about/page';
import ConfigDocumentsPage from '@/docs/config/documents/page';
import ConfigPprofPage from '@/docs/config/pprof/page';
import InboundPage from '@/docs/inbound/page';
import GroupActivatesPage from '@/docs/group/activates/page';
import GroupPage from '@/docs/group/page';
import GroupSubscribePage from '@/docs/group/subscribe/page';
import GroupPublishPage from '@/docs/group/publish/page';
import WebUIPage from '@/docs/webui/page';
import ConnectionsFailedPage from '@/docs/connections/failed/page';
import ConnectionsHistoryPage from '@/docs/connections/history/page';
import ConnectionsV2Page from '@/docs/connections/v2/page';
import BypassBlockPage from '@/docs/bypass/block/page';
import BypassPage from '@/docs/bypass/page';
import BypassTestPage from '@/docs/bypass/test/page';
import BypassResolverPage from '@/docs/bypass/resolver/page';
import BypassTagPage from '@/docs/bypass/tag/page';
import BypassListPage from '@/docs/bypass/list/page';
import LoginPage from '@/docs/login/page';

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

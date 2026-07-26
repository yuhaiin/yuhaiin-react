import { AuthTokenKey } from '@/common/apiurl';
import { Button } from '@/component/v2/button';
import { Input } from '@/component/v2/input';
import { Lock, Network, Sparkles, User } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
    const { t } = useTranslation('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) return;

        // Basic Auth Encoding
        const token = btoa(`${username}:${password}`);
        localStorage.setItem(AuthTokenKey, token);

        // Redirect to home
        // We use window.location.hash directly because wouter's setLocation hook
        // is overridden by the animation router in App.tsx to be read-only.
        window.location.hash = '/';
    };

    return (
        <div className="login-shell">
            <div className="login-orbit login-orbit-one" />
            <div className="login-orbit login-orbit-two" />
            <div className="login-layout">
                <section className="login-intro">
                    <div className="product-brand-mark login-brand-mark"><Sparkles size={22} /></div>
                    <p className="login-eyebrow">Your private network</p>
                    <h1>Everything connected,<br /><span>quietly in your control.</span></h1>
                    <p className="login-description">A friendly control room for routes, nodes, and the traffic moving through your own network.</p>
                    <div className="login-trust-row"><Network size={16} /> <span>Local-first · private by default</span></div>
                </section>

                <section className="login-card">
                    <div className="login-card-heading">
                        <div>
                            <p className="ui-section-label mb-2">Welcome back</p>
                            <h2>{t('title')}</h2>
                        </div>
                        <div className="login-card-icon"><Lock size={18} /></div>
                    </div>
                <form onSubmit={handleLogin}>
                    <div className="login-form-body">
                        <div className="space-y-2">
                            <label className="ui-form-label">{t('username')}</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-ui-muted" size={18} />
                                <Input
                                    className="pl-10"
                                    placeholder={t('usernamePlaceholder')}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="ui-form-label">{t('password')}</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-ui-muted" size={18} />
                                <Input
                                    type="password"
                                    className="pl-10"
                                    placeholder={t('passwordPlaceholder')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="login-form-footer">
                        <Button type="submit" className="w-full h-11">
                            {t('signIn')}
                        </Button>
                        <p>Use the credentials configured on your yuhaiin controller.</p>
                    </div>
                </form>
                </section>
            </div>
        </div>
    );
}

import { AuthTokenKey } from '@/common/apiurl';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardFooter, CardHeader, CardTitle } from '@/component/v2/card';
import { Input } from '@/component/v2/input';
import { Lock, LogIn, User } from 'lucide-react';
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
        <div className="flex items-center justify-center min-h-screen bg-[var(--bs-body-bg)] p-4">
            <Card className="w-full max-w-md !mb-0 shadow-xl">
                <CardHeader>
                    <CardTitle className="text-xl">
                        <LogIn className="mr-2" size={24} />
                        {t('title')}
                    </CardTitle>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardBody className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('username')}</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('password')}</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    type="password"
                                    className="pl-10"
                                    placeholder={t('passwordPlaceholder')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardBody>
                    <CardFooter className="flex justify-end pt-2">
                        <Button type="submit" className="w-full !rounded-lg h-10">
                            {t('signIn')}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

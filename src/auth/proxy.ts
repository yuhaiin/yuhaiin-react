export interface ProxyCredential {
    id: string; userId: string; name: string; inbounds: string[]; protocols: string[];
    createdAt: number; expiresAt: number; revoked: boolean;
}
export interface IssuedProxyCredential extends ProxyCredential { secret: string }
export interface UpstreamCredential { id: string; name: string; type: 'password' | 'username-password'; revision: number }

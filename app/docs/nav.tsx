"use client"

import { Nav, NavLink } from 'react-bootstrap';
import { APIUrl } from './apiurl';
import { usePathname, useRouter } from 'next/navigation';


function NavBar() {
    console.log(usePathname())
    const router = useRouter();

    return (
        <div className="pt-2 border-bottom" style={{ overflowY: 'hidden', height: '52px' }}>
            <div style={{ overflow: 'auto hidden' }}>
                <Nav variant="pills" style={{ paddingBottom: '100px', paddingLeft: '10px', flexWrap: 'nowrap' }}>
                    <NavLink active={usePathname() === "/"} onClick={() => router.push('/')} >HOME</NavLink>
                    <NavLink active={usePathname() === "/docs/group"} onClick={() => router.push('/docs/group')} >GROUP</NavLink>
                    <NavLink active={usePathname() === "/docs/tag"} onClick={() => router.push('/docs/tag')} >TAG</NavLink>
                    <NavLink active={usePathname() === "/docs/subscribe"} onClick={() => router.push('/docs/subscribe')} >SUBSCRIBE</NavLink>
                    <NavLink active={usePathname() === "/docs/connections"} onClick={() => router.push('/docs/connections')} >CONNECTIONS</NavLink>
                    <NavLink active={usePathname() === "/docs/config"} onClick={() => router.push('/docs/config')} >CONFIG</NavLink>
                    <NavLink active={usePathname() === "/docs/node"} onClick={() => router.push('/docs/node')} >TOOLS</NavLink>
                    <NavLink href={`${APIUrl}/debug/pprof`}>PPROF</NavLink>
                </Nav>
            </div>
        </div>
    );
}

export default NavBar;
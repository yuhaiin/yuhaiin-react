"use client"

import { Nav } from 'react-bootstrap';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

function NavBar(props: { children: React.ReactNode }) {
    return (
        <>
            <div className="pt-2 border-bottom shadow-sm" style={{ overflowY: 'hidden', height: '52px' }}>
                <div style={{ overflow: 'auto hidden' }}>
                    <Nav variant="pills" style={{ paddingBottom: '100px', paddingLeft: '10px', flexWrap: 'nowrap' }}>
                        <Nav.Item><NavLink href='/'>HOME</NavLink></Nav.Item>
                        <Nav.Item><NavLink href='/docs/group/'>OUTBOUND</NavLink></Nav.Item>
                        <Nav.Item><NavLink href='/docs/tag/'>TAG</NavLink></Nav.Item>
                        <Nav.Item><NavLink href='/docs/subscribe/'>SUBSCRIBE</NavLink></Nav.Item>
                        <Nav.Item><NavLink href='/docs/connections/'>CONNECTIONS</NavLink></Nav.Item>
                        <Nav.Item><NavLink href='/docs/config/'>CONFIG</NavLink></Nav.Item>
                        <Nav.Item><NavLink href='/docs/webui/'>WEBUI</NavLink></Nav.Item>
                        <Nav.Item><a className='nav-link' href='/debug/pprof'>PPROF</a></Nav.Item>
                    </Nav>
                </div>
            </div >
            {props.children}
        </>
    );
}


const NavLink = (props: { children: any, active?: boolean, href: string, as?: string }) => {

    return <Link
        className={'nav-link' + (props.active !== undefined ? (props.active ? " active" : "") : (usePathname() === props.href ? " active" : ""))}
        href={props.href}
    >
        {props.children}
    </Link>
}
export default NavBar;
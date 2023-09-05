"use client"

import { Nav } from 'react-bootstrap';
import Link from 'next/link';
import { APIUrl } from './apiurl';
import { usePathname } from 'next/navigation';


function NavBar() {
    console.log(usePathname())

    return (
        <div className="pt-2 border-bottom" style={{ overflowY: 'hidden', height: '52px' }}>
            <div style={{ overflow: 'auto hidden' }}>
                <Nav variant="pills" style={{ paddingBottom: '100px', paddingLeft: '10px', flexWrap: 'nowrap' }}>
                    <NavLink path={usePathname()} href='/' name='HOME' />
                    <NavLink path={usePathname()} href='/docs/group' name='GROUP' />
                    <NavLink path={usePathname()} href='/docs/tag' name='TAG' />
                    <NavLink path={usePathname()} href='/docs/subscribe' name='SUBSCRIBE' />
                    <NavLink path={usePathname()} href='/docs/connections' name='CONNECTIONS' />
                    <NavLink path={usePathname()} href='/docs/config' name='CONFIG' />
                    <NavLink path={usePathname()} href='/docs/node' name='TOOLS' />
                    <Nav.Item><a className="nav-link" href={`${APIUrl}/debug/pprof`}>PPROF</a></Nav.Item>
                </Nav>
            </div>
        </div>
    );
}

function NavLink(props: { href: string, name: string, path: string }) {
    return (
        <Nav.Item>
            <Link href={props.href} key={props.name} className={"nav-link" + (props.path === props.href ? " active" : "")} >{props.name}</Link>
        </Nav.Item>
    )
}

export default NavBar;
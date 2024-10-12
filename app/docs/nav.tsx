"use client"

import { Nav, NavDropdown, Navbar as BootstrapNavbar, Container } from 'react-bootstrap';
import { usePathname, useRouter } from 'next/navigation';
import { APIUrl } from './apiurl';

function NavBar(props: { children: React.ReactNode }) {
    const router = useRouter()

    return (
        <>
            <BootstrapNavbar collapseOnSelect expand="lg" style={{ backdropFilter: 'blur(50px)' }} className="shadow-sm" sticky='top'>

                <Container fluid>
                    <BootstrapNavbar.Toggle aria-controls="responsive-navbar-nav" />
                    <BootstrapNavbar.Collapse>
                        <Nav
                            activeKey={usePathname()}
                            onSelect={(key, e) => {
                                e.preventDefault();
                                if (key) router.push(key)
                            }}
                        >
                            <Nav.Item><Nav.Link eventKey='/'>HOME</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link eventKey='/docs/group/'>OUTBOUND</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link eventKey='/docs/tag/'>TAG</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link eventKey='/docs/subscribe/'>SUBSCRIBE</Nav.Link></Nav.Item>
                            <NavDropdown title="CONNECTIONS" active={usePathname().startsWith('/docs/connections/')}>
                                <NavDropdown.Item eventKey={'/docs/connections/'}>Connections</NavDropdown.Item>
                                <NavDropdown.Item eventKey={'/docs/connections/failed'}>Failed History</NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="BYPASS" active={usePathname().startsWith('/docs/bypass/')}>
                                <NavDropdown.Item eventKey={'/docs/bypass/'}>Config</NavDropdown.Item>
                                <NavDropdown.Item eventKey={'/docs/bypass/test'}>Test Route</NavDropdown.Item>
                                <NavDropdown.Item eventKey={'/docs/bypass/block'}>Block History</NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="SETTING" active={usePathname().startsWith('/docs/config/') || usePathname() === '/docs/webui/'}>
                                <NavDropdown.Item eventKey={'/docs/config/'}>Config</NavDropdown.Item>
                                <NavDropdown.Item eventKey={'/docs/webui/'}>WebUI</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item eventKey={APIUrl + '/debug/pprof'} >Pprof</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item eventKey={'/docs/config/about'} >About</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </BootstrapNavbar.Collapse>
                </Container>
            </BootstrapNavbar>
            {props.children}
        </>
    );
}

export default NavBar;
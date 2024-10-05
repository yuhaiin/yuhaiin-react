"use client"

import { Nav, NavDropdown, Navbar as BootstrapNavbar, Container } from 'react-bootstrap';
import { usePathname, useRouter } from 'next/navigation';

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
                            <Nav.Item><Nav.Link eventKey='/docs/connections/'>CONNECTIONS</Nav.Link></Nav.Item>
                            <NavDropdown title="BYPASS" active={usePathname().startsWith('/docs/bypass/')}>
                                <NavDropdown.Item eventKey={'/docs/bypass/'}>Config</NavDropdown.Item>
                                <NavDropdown.Item eventKey={'/docs/bypass/test'}>Test Route</NavDropdown.Item>
                                <NavDropdown.Item eventKey={'/docs/bypass/block'}>Block History</NavDropdown.Item>
                            </NavDropdown>
                            <Nav.Item><Nav.Link eventKey='/docs/config/'>CONFIG</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link eventKey='/docs/webui/'>WEBUI</Nav.Link></Nav.Item>
                            <Nav.Item><a className='nav-link' href='/debug/pprof'>PPROF</a></Nav.Item>
                        </Nav>
                    </BootstrapNavbar.Collapse>
                </Container>
            </BootstrapNavbar>
            {props.children}
        </>
    );
}

export default NavBar;
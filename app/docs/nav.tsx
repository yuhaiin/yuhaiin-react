"use client"

import { usePathname, useRouter } from 'next/navigation';
import { Navbar as BootstrapNavbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { APIUrl } from './common/apiurl';

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
                            <NavDropdown title="OUTBOUND" active={usePathname().startsWith('/docs/group/')}>
                                <NavDropdown.Item eventKey={'/docs/group/'}>Outbound</NavDropdown.Item>
                                <NavDropdown.Item eventKey='/docs/group/subscribe'>Subscribe</NavDropdown.Item>
                                <NavDropdown.Item eventKey={'/docs/group/activates'}>Activates</NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="INBOUND" active={usePathname().startsWith('/docs/inbound/')}>
                                <NavDropdown.Item eventKey={'/docs/inbound/'}>Config</NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="BYPASS" active={usePathname().startsWith('/docs/bypass/')}>
                                <NavDropdown.Item eventKey={'/docs/bypass/'}>Rule</NavDropdown.Item>
                                <NavDropdown.Item eventKey={'/docs/bypass/list'}>List</NavDropdown.Item>
                                <NavDropdown.Item eventKey='/docs/bypass/tag'>Tag</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item eventKey={'/docs/bypass/resolver/'}>Resolver</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item eventKey={'/docs/bypass/test'}>Test Route</NavDropdown.Item>
                                <NavDropdown.Item eventKey={'/docs/bypass/block'}>Block History</NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="CONNECTIONS" active={usePathname().startsWith('/docs/connections/')}>
                                <NavDropdown.Item eventKey={'/docs/connections/v2'}>Connections</NavDropdown.Item>
                                <NavDropdown.Item eventKey={'/docs/connections/history'}>History</NavDropdown.Item>
                                <NavDropdown.Item eventKey={'/docs/connections/failed'}>Failed History</NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="SETTING" active={((path: string) => { return path.startsWith('/docs/config/') || path.startsWith('/docs/webui/') })(usePathname())}>
                                <NavDropdown.Item eventKey={'/docs/config/'}>Config</NavDropdown.Item>
                                <NavDropdown.Item eventKey={'/docs/webui/'}>WebUI</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item eventKey={'/docs/config/backup/'}>Backup</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item eventKey={'/docs/config/log/'}>Log</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item eventKey={APIUrl + '/debug/pprof'} >Pprof</NavDropdown.Item>
                                <NavDropdown.Item eventKey="https://yuhaiin.github.io/documents/" >Documents</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item eventKey={'/docs/config/licenses'} >Licenses</NavDropdown.Item>
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
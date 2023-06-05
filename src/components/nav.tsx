import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';


function NavBar() {
    return (
        <div className="pt-2 border-bottom" style={{ overflowY: 'hidden', height: '52px' }}>
            <div style={{ overflow: 'auto hidden' }}>
                <Nav variant="pills" style={{ paddingBottom: '100px', paddingLeft: '10px', flexWrap: 'nowrap' }}>
                    <Nav.Item><NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} to="/">HOME</NavLink></Nav.Item>
                    <Nav.Item><NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} to="/group">GROUP</NavLink></Nav.Item>
                    <Nav.Item><NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} to="/tag">TAG</NavLink></Nav.Item>
                    <Nav.Item><NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} to="/subscribe">SUBSCRIBE</NavLink></Nav.Item>
                    <Nav.Item><NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} to="/connections">CONNECTIONS</NavLink></Nav.Item>
                    <Nav.Item><NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} to="/config">CONFIG</NavLink></Nav.Item>
                    <Nav.Item><NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} to="/pprof">PPROF</NavLink></Nav.Item>
                </Nav>
            </div>
        </div>
    );
}

export default NavBar;
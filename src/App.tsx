import './App.css';
import React from 'react';
import Navbar from './components/nav';
import { Outlet } from "react-router-dom";
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div>
      <Navbar></Navbar>

      <Container className="mt-3">
        <Outlet />
      </Container>
    </div>
  );
}

export default App;

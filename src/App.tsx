import './App.css';
import React from 'react';
import Navbar from './components/nav';
import { Outlet } from "react-router-dom";
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { GlobalToastProvider } from './components/toast';

function App() {
  return (
    <div>
      <Navbar></Navbar>
      <Container className="mt-3">
        <GlobalToastProvider>
          <Outlet />
        </GlobalToastProvider>
      </Container>
    </div>
  );
}

export default App;

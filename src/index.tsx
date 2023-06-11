import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Config from './components/config/config'
import Home from './components/home'
import Group from './components/group'
import Connections from './components/connections'
import Subscribe from './components/subscribe';
import Tags from './components/tags';
import { NewNode } from './components/node';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/yuhaiin/config",
        element: <Config />,
      },
      {
        path: "/yuhaiin/group",
        element: <Group />,
      },
      {
        path: "/yuhaiin/connections",
        element: <Connections />,
      },
      {
        path: "/yuhaiin/subscribe",
        element: <Subscribe />,
      },
      {
        path: "/yuhaiin/tools",
        element: <NewNode />,
      },
      {
        path: "/yuhaiin/tag",
        element: <Tags />,
      }
    ]
  },
]);

root.render(
  // <React.StrictMode>
  <RouterProvider router={router} />
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

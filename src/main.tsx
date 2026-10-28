import React from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './App';
import {createBrowserEngine} from './browserEngine';
import './style.css';
// Browser-local model loading starts only after explicit user consent.
createRoot(document.getElementById('root')!).render(<React.StrictMode><App engine={createBrowserEngine()}/></React.StrictMode>);

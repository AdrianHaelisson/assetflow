import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { LoginPage } from './pages/LoginPage'
import { useAuthStore } from './store/authStore'
import { ToastContainer } from './components/ui/ToastContainer'
import { ConfirmDialog } from './components/ui/ConfirmDialog'
import './index.css'

const Root = () => {
    const isAuthenticated = useAuthStore(s => s.isAuthenticated());
    // Force re-render on login success
    const [, setTick] = useState(0); 

    return (
        <React.StrictMode>
            {isAuthenticated ? (
                <App />
            ) : (
                <LoginPage onLoginSuccess={() => setTick(t => t + 1)} />
            )}
            <ToastContainer />
            <ConfirmDialog />
        </React.StrictMode>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />)

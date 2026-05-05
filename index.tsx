
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';

const AppWithAuth: React.FC = () => {
  const { user } = useAuth();
  return user ? <App /> : <LoginPage />;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  </React.StrictMode>
);

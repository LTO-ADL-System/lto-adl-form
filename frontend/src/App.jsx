import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';

// NAVIGATION BARS
import NavigationHeader from './components/NavigationHeader.jsx';
import OnboardingNavBar from './components/OnboardingNavBar.jsx';

// PUBLIC PAGES and COMPONENTS
import Register from './routes/Register.jsx';
import LandingPage from './routes/LandingPage.jsx';
import SignIn from './routes/SignIn.jsx';
import BottomBorder from "./components/BottomBorder.jsx";

// PROTECTED PAGES (Create these as simple placeholder components for now)
import Home from './routes/Home.jsx';
import Profile from "./routes/Profile.jsx";
import Application from './routes/Application.jsx';

function App() {
    // Authentication state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Check if user is logged in when app loads
    useEffect(() => {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            setCurrentUser(userData);
            setIsAuthenticated(true);
        }
    }, []);

    // Mock login function
    const handleLogin = (email, password) => {
        // Simulate login validation (you can add any email/password combo you want)
        if (email && password) {
            const userData = {
                id: 1,
                name: email.split('@')[0], // Use part of email as name
                email: email,
                loginTime: new Date().toISOString()
            };

            // Save to localStorage
            localStorage.setItem('currentUser', JSON.stringify(userData));

            // Update state
            setCurrentUser(userData);
            setIsAuthenticated(true);

            return { success: true, user: userData };
        }

        return { success: false, message: 'Invalid credentials' };
    };

    // Mock register function
    const handleRegister = (name, email, password, confirmPassword) => {
        // Basic validation
        if (!name || !email || !password) {
            return { success: false, message: 'All fields are required' };
        }

        if (password !== confirmPassword) {
            return { success: false, message: 'Passwords do not match' };
        }

        if (password.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters' };
        }

        // Create user data
        const userData = {
            id: Date.now(), // Simple ID generation
            name: name,
            email: email,
            registrationTime: new Date().toISOString()
        };

        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(userData));

        // Update state
        setCurrentUser(userData);
        setIsAuthenticated(true);

        return { success: true, user: userData };
    };

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        setIsAuthenticated(false);
    };

    // Determine which navbar to show
    const showOnboardingNav = !isAuthenticated;
    const showAuthenticatedNav = isAuthenticated;

  return (
    <>
        <div className="min-h-screen flex flex-col bg-red-800">
            {/* Conditional Navigation */}
            {showOnboardingNav && <OnboardingNavBar />}
            {showAuthenticatedNav && <NavigationHeader onLogout={handleLogout} currentUser={currentUser} />}

            {/* Routes */}
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/"
                    element={
                        isAuthenticated ? <Navigate to="/home" replace /> : <LandingPage />
                    }
                />
                <Route
                    path="/register"
                    element={
                        isAuthenticated ? (
                            <Navigate to="/home" replace />
                        ) : (
                            <Register onRegister={handleRegister} />
                        )
                    }
                />
                <Route
                    path="/signin"
                    element={
                        isAuthenticated ? (
                            <Navigate to="/home" replace />
                        ) : (
                            <SignIn onLogin={handleLogin} />
                        )
                    }
                />

                {/* Protected Routes */}
                <Route
                    path="/home"
                    element={
                        isAuthenticated ? <Home currentUser={currentUser} /> : <Navigate to="/signin" replace />
                    }
                />
                <Route
                    path="/application"
                    element={
                        isAuthenticated ? <Application currentUser={currentUser} /> : <Navigate to="/signin" replace />
                    }
                />
                <Route
                    path="/profile"
                    element={
                        isAuthenticated ? <Profile currentUser={currentUser} /> : <Navigate to="/signin" replace />
                    }
                />

                {/* Catch all route */}
                <Route
                    path="*"
                    element={<Navigate to={isAuthenticated ? "/home" : "/"} replace />}
                />
            </Routes>

            {/* Show BottomBorder only on public pages */}
            {showOnboardingNav && <BottomBorder />}
        </div>
    </>
  )
}

export default App

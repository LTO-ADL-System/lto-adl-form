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
import Confirmation from './routes/Confirmation.jsx';
import BottomBorder from "./components/BottomBorder.jsx";

// PROTECTED PAGES
import Home from './routes/Home.jsx';
import Profile from "./routes/Profile.jsx";
import Application from './routes/Application.jsx';
import AdminDashboard from './components/AdminDashboard';

function App() {
    // PROTOTYPE: Mock authentication state for UI testing
    // TODO: Replace with real authentication when backend is ready
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const location = useLocation();

    // Determine if on dashboard route
    const isDashboard = location.pathname === "/dashboard";

    // PROTOTYPE: Comment out real authentication check
    // TODO: Implement real authentication check with backend
    // useEffect(() => {
    //     const checkAuthStatus = async () => {
    //         try {
    //             const response = await fetch('/api/auth/verify', {
    //                 headers: {
    //                     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //                 }
    //             });
    //             if (response.ok) {
    //                 const userData = await response.json();
    //                 setCurrentUser(userData);
    //                 setIsAuthenticated(true);
    //             }
    //         } catch (error) {
    //             console.error('Auth check failed:', error);
    //         }
    //     };
    //     checkAuthStatus();
    // }, []);

    // PROTOTYPE: Mock login function for UI testing
    // TODO: Replace with real API call to backend
    const handleLogin = async (email, password) => {
        // MOCK: Simulate successful login for any email/password
        // TODO: Replace with real authentication
        // try {
        //     const response = await fetch('/api/auth/login', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({ email, password }),
        //     });
        //
        //     if (response.ok) {
        //         const { user, token } = await response.json();
        //         localStorage.setItem('token', token);
        //         setCurrentUser(user);
        //         setIsAuthenticated(true);
        //         return { success: true, user };
        //     } else {
        //         const errorData = await response.json();
        //         return { success: false, message: errorData.message };
        //     }
        // } catch (error) {
        //     return { success: false, message: 'Login failed. Please try again.' };
        // }

        // PROTOTYPE: Mock successful login
        if (email && password) {
            const mockUser = {
                id: 1,
                name: email.split('@')[0],
                email: email,
            };
            setCurrentUser(mockUser);
            setIsAuthenticated(true);
            return { success: true, user: mockUser };
        }
        return { success: false, message: 'Please enter email and password' };
    };

    // PROTOTYPE: Mock register function for UI testing
    // TODO: Replace with real API call to backend
    // TODO: Add handler for emails that already exists
    const handleRegister = async (email, password, confirmPassword) => {
        // Basic client-side validation
        if (!email || !password) {
            return { success: false, message: 'All fields are required' };
        }

        if (password !== confirmPassword) {
            return { success: false, message: 'Passwords do not match' };
        }

        if (password.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters' };
        }

        // TODO: Replace with real API call
        // try {
        //     const response = await fetch('/api/auth/register', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({ email, password }),
        //     });
        //
        //     if (response.ok) {
        //         // DON'T authenticate immediately - let them verify first
        //         return { success: true, message: 'Registration successful. Please check your email.' };
        //     } else {
        //         const errorData = await response.json();
        //         return { success: false, message: errorData.message };
        //     }
        // } catch (error) {
        //     return { success: false, message: 'Registration failed. Please try again.' };
        // }

        // PROTOTYPE: Mock successful registration WITHOUT authentication
        // Store registration data temporarily (in real app, this would be handled by backend)
        // DON'T set currentUser or isAuthenticated here

        return {
            success: true,
            message: 'Registration successful. Please verify your email.',
            // You can store user data temporarily if needed for the confirmation process
            pendingUser: {
                email: email,
                // Don't store password in real app
            }
        };
    };

    // PROTOTYPE: Mock confirmation/verification function
    // TODO: Replace with real API call to backend
    const handleConfirmation = async (email, verificationCode) => {
        // TODO: Replace with real API call
        // try {
        //     const response = await fetch('/api/auth/verify-email', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({ email, verificationCode }),
        //     });
        //
        //     if (response.ok) {
        //         const { user, token } = await response.json();
        //         localStorage.setItem('token', token);
        //         setCurrentUser(user);
        //         setIsAuthenticated(true);
        //         return { success: true, user };
        //     } else {
        //         const errorData = await response.json();
        //         return { success: false, message: errorData.message };
        //     }
        // } catch (error) {
        //     return { success: false, message: 'Verification failed. Please try again.' };
        // }

        // PROTOTYPE: Mock successful verification
        // For testing, accept any 6-digit code
        if (verificationCode && verificationCode.length === 4) {
            const mockUser = {
                id: Date.now(),
                name: email.split('@')[0], // Extract name from email
                email: email,
            };
            setCurrentUser(mockUser);
            setIsAuthenticated(true);
            return { success: true, user: mockUser };
        }

        return { success: false, message: 'Invalid verification code' };
    };

    // PROTOTYPE: Mock logout function
    // TODO: Replace with real API call to backend
    const handleLogout = async () => {
        // TODO: Call backend to invalidate session
        // try {
        //     await fetch('/api/auth/logout', {
        //         method: 'POST',
        //         headers: {
        //             'Authorization': `Bearer ${localStorage.getItem('token')}`
        //         }
        //     });
        // } catch (error) {
        //     console.error('Logout error:', error);
        // }
        // localStorage.removeItem('token');

        // PROTOTYPE: Mock logout
        setCurrentUser(null);
        setIsAuthenticated(false);
    };

    // Determine which navbar to show based on authentication status
    const showOnboardingNav = !isAuthenticated;
    const showAuthenticatedNav = isAuthenticated;

    // Only show user navbars and BottomBorder if not on /dashboard
    return (
        <div className="min-h-screen flex flex-col bg-red-800">
            {/* Conditional Navigation */}
            {!isDashboard && showOnboardingNav && <OnboardingNavBar />}
            {!isDashboard && showAuthenticatedNav && <NavigationHeader onLogout={handleLogout} currentUser={currentUser} />}

            {/* Routes */}
            <Routes>
                {/* Public Routes - Accessible when not authenticated */}
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
                <Route
                    path="/confirmation"
                    element={
                        isAuthenticated ? (
                            <Navigate to="/home" replace />
                        ) : (
                            <Confirmation onConfirmation={handleConfirmation} />
                        )
                    }
                />

                {/* Protected Routes - Redirect to signin if not authenticated */}
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

                {/* Admin Dashboard Route */}
                <Route
                    path="/dashboard"
                    element={
                        isAuthenticated ? <AdminDashboard currentUser={currentUser} /> : <Navigate to="/signin" replace />
                    }
                />
            </Routes>

            {/* Show BottomBorder only on public pages and not on /dashboard */}
            {!isDashboard && showOnboardingNav && <BottomBorder />}
        </div>
    );
}

export default App;
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import authService from './services/authService.js';

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
// Import AdminApplicants for routing
import AdminApplicants from './components/AdminApplicants';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingAuthData, setPendingAuthData] = useState(null); // Store auth data during OTP flow
    const location = useLocation();

    const isDashboard = location.pathname === "/dashboard";
    const isApplicants = location.pathname === "/applicants";

    // Check authentication status on app startup
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                if (authService.isAuthenticated()) {
                    const userData = authService.getCurrentUser();
                    if (userData) {
                        setCurrentUser(userData);
                        setIsAuthenticated(true);
                    }
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                authService.logout();
            } finally {
                setIsLoading(false);
            }
        };
        checkAuthStatus();
    }, []);

    // Auto refresh token periodically
    useEffect(() => {
        if (isAuthenticated) {
            const refreshInterval = setInterval(async () => {
                try {
                    await authService.autoRefreshToken();
                } catch (error) {
                    console.error('Auto refresh failed:', error);
                    handleLogout();
                }
            }, 15 * 60 * 1000); // Refresh every 15 minutes

            return () => clearInterval(refreshInterval);
        }
    }, [isAuthenticated]);

    // Real login function using backend API
    const handleLogin = async (email, password) => {
        try {
            const response = await authService.loginRequest(email, password);

            if (response.success) {
                // Store the auth data for OTP verification
                setPendingAuthData({
                    email,
                    password,
                    action: 'login'
                });
                return {
                    success: true,
                    message: 'OTP sent to your email. Please check your inbox.',
                    requiresOTP: true
                };
            } else {
                return { success: false, message: response.message || 'Login failed. Please try again.' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: error.message || 'Login failed. Please try again.' };
        }
    };

    // Real register function using backend API
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

        try {
            const response = await authService.signUpRequest(email, password);

            if (response.success) {
                // Store the auth data for OTP verification
                setPendingAuthData({
                    email,
                    password,
                    action: 'signup'
                });
                return {
                    success: true,
                    message: 'OTP sent to your email. Please check your inbox.',
                    requiresOTP: true
                };
            } else {
                return { success: false, message: response.message || 'Registration failed. Please try again.' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: error.message || 'Registration failed. Please try again.' };
        }
    };

    // Real OTP verification function
    const handleConfirmation = async (otpCode) => {
        if (!pendingAuthData) {
            return { success: false, message: 'No pending authentication. Please start over.' };
        }

        try {
            const { email, password, action } = pendingAuthData;
            const response = await authService.verifyOTP(email, otpCode, action, password);

            if (response.success && response.data) {
                const userData = {
                    id: response.data.user_id,
                    email: response.data.email,
                    isAdmin: response.data.email === 'madalto.official@gmail.com'
                };

                setCurrentUser(userData);
                setIsAuthenticated(true);
                setPendingAuthData(null); // Clear pending data

                return {
                    success: true,
                    user: userData,
                    action: action // Return action to determine navigation
                };
            } else {
                return { success: false, message: response.message || 'Invalid verification code' };
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            return { success: false, message: error.message || 'Verification failed. Please try again.' };
        }
    };

    // Real logout function
    const handleLogout = async () => {
        try {
            authService.logout();
            setCurrentUser(null);
            setIsAuthenticated(false);
            setPendingAuthData(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8]">
                <div className="text-[#03267F] text-lg">Loading...</div>
            </div>
        );
    }

    // Determine which navbar to show based on authentication status
    const showOnboardingNav = !isAuthenticated;
    const showAuthenticatedNav = isAuthenticated;

    return (
        <div className="min-h-screen flex flex-col bg-red-800">
            {/* Conditional Navigation */}
            {!isDashboard && !isApplicants && showOnboardingNav && <OnboardingNavBar />}
            {!isDashboard && !isApplicants && showAuthenticatedNav && <NavigationHeader onLogout={handleLogout} currentUser={currentUser} />}

            {/* Routes */}
            <Routes>
                {/* Public Routes - Accessible when not authenticated */}
                <Route
                    path="/"
                    element={
                        isAuthenticated ? (
                            currentUser?.isAdmin ? <Navigate to="/dashboard" replace /> : <Navigate to="/home" replace />
                        ) : <LandingPage />
                    }
                />
                <Route
                    path="/register"
                    element={
                        isAuthenticated ? (
                            currentUser?.isAdmin ? <Navigate to="/dashboard" replace /> : <Navigate to="/home" replace />
                        ) : (
                            <Register onRegister={handleRegister} />
                        )
                    }
                />
                <Route
                    path="/signin"
                    element={
                        isAuthenticated ? (
                            currentUser?.isAdmin ? <Navigate to="/dashboard" replace /> : <Navigate to="/home" replace />
                        ) : (
                            <SignIn onLogin={handleLogin} />
                        )
                    }
                />
                <Route
                    path="/confirmation"
                    element={
                        isAuthenticated ? (
                            currentUser?.isAdmin ? <Navigate to="/dashboard" replace /> : <Navigate to="/home" replace />
                        ) : (
                            <Confirmation
                                onConfirmation={handleConfirmation}
                                userEmail={pendingAuthData?.email}
                                isLoading={isLoading}
                            />
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
                        isAuthenticated ? (
                            currentUser?.isAdmin ? <AdminDashboard currentUser={currentUser} /> : <Navigate to="/home" replace />
                        ) : <Navigate to="/signin" replace />
                    }
                />

                {/* Admin Applicants Route */}
                <Route
                    path="/applicants"
                    element={
                        isAuthenticated ? (
                            currentUser?.isAdmin ? <AdminApplicants currentUser={currentUser} /> : <Navigate to="/home" replace />
                        ) : <Navigate to="/signin" replace />
                    }
                />
            </Routes>

            {/* Show BottomBorder only on public pages and not on /dashboard or /applicants */}
            {!isDashboard && !isApplicants && showOnboardingNav && <BottomBorder />}
        </div>
    );
}

export default App;
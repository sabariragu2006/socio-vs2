import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./components/Register";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
import Uploads from "./components/Uploads";
import { Helmet } from "react-helmet-async";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user data on app load
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing saved user data:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  if (loading) {
    return (
      <>
        <Helmet>
          {/* SEO Meta Tags */}
          <title>SocialSphere - Loading...</title>
          <meta name="description" content="SocialSphere is loading. Please wait..." />
        </Helmet>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-blue-600">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4 mx-auto"></div>
            <h2 className="text-white text-xl font-semibold">Loading SocialSphere...</h2>
            <p className="text-purple-100 mt-2">Connecting you to your social universe</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        {/* SEO Meta Tags */}
        <title>SocialSphere - Connect, Share, Discover</title>
        <meta name="description" content="Join SocialSphere to connect with friends, share your moments, and discover new content. A modern social media platform for everyone." />
        <meta name="keywords" content="social media, social network, connect, share, discover, friends, posts, stories, social platform" />
        <meta name="author" content="SocialSphere" />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="SocialSphere - Connect, Share, Discover" />
        <meta property="og:description" content="Join SocialSphere to connect with friends, share your moments, and discover new content." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="SocialSphere" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SocialSphere - Connect, Share, Discover" />
        <meta name="twitter:description" content="Join SocialSphere to connect with friends, share your moments, and discover new content." />

        {/* Viewport and Mobile Optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#8b5cf6" />

        {/* Structured Data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "SocialSphere",
            "description": "A modern social media platform for connecting, sharing, and discovering",
            "url": window.location.origin,
            "applicationCategory": "SocialNetworkingApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })}
        </script>
      </Helmet>

      <Router>
        <div className="App">
          <Routes>
            {/* Default route → Dashboard (public access) */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard Page (public - no authentication required) */}
            <Route path="/dashboard" element={<Dashboard user={user} onLogout={handleLogout} />} />

            {/* Login Page - redirect to dashboard if already logged in */}
            <Route
              path="/login"
              element={user ? <Navigate to="/dashboard" replace /> : <LoginForm onLogin={handleLogin} />}
            />

            {/* Register Page - redirect to dashboard if already logged in */}
            <Route
              path="/register"
              element={user ? <Navigate to="/dashboard" replace /> : <Register onRegister={handleLogin} />}
            />

            {/* Uploads Page (protected) - requires authentication */}
            <Route
              path="/uploads"
              element={user ? <Uploads /> : <Navigate to="/register" replace />}
            />

            {/* Catch all other routes - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;

'use client'; // This page needs client-side interactivity for login

import { useState, useEffect } from 'react'; // Import useEffect
import { supabase } from '@/lib/supabaseClient'; // Import supabase
import AdminLogin from '@/components/AdminLogin';
import AdminDashboard from '@/components/AdminDashboard';
import { Box } from '@radix-ui/themes';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true); // Add loading state

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
      }
      setLoadingSession(false); // Session check complete
    };
    checkSession();

    // Optional: Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);


  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut(); // Sign out from Supabase
    if (error) {
      console.error('Error logging out:', error);
      // Handle error appropriately, maybe show a message
    }
    // State will be updated by onAuthStateChange listener, but we can set it immediately too
    setIsAuthenticated(false);
  };

  // Show loading indicator while checking session
  if (loadingSession) {
    return <Box p="4">Cargando...</Box>; // Or a proper loading component
  }

  return (
    <Box p="4">
      {!isAuthenticated ? (
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      ) : (
        <AdminDashboard onLogout={handleLogout} />
      )}
    </Box>
  );
}

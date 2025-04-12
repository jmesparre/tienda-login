'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Import supabase
import { Button, TextField, Flex, Card, Text, Heading } from '@radix-ui/themes';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState(''); // Changed from username to email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    setError(''); // Clear previous errors
    setLoading(true); // Set loading

    try {
      // Remove the unused _data variable from destructuring
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email, // Use email state
        password: password,
      });

      if (signInError) {
        throw signInError;
      }

      // If login is successful, Supabase handles the session.
      // The onAuthStateChange listener in AdminPage will update the UI.
      // We can still call onLoginSuccess if needed for immediate UI feedback,
      // but the session check in AdminPage is the primary mechanism now.
      onLoginSuccess();

    } catch (err: unknown) { // Use unknown instead of any
      console.error("Login error:", err);
      // Provide more specific error messages if possible
      // Check if err is an Error instance before accessing message
      if (err instanceof Error && err.message.includes('Invalid login credentials')) {
        setError('Email o contraseña incorrectos.');
      } else {
        setError('Ocurrió un error durante el inicio de sesión.');
      }
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <Flex justify="center" align="center" style={{ minHeight: '60vh' }}>
      <Card size="3" style={{ width: '100%', maxWidth: '400px' }}>
        <Heading as="h2" size="6" align="center" mb="5">
          Admin Login
        </Heading>
        <form onSubmit={handleLogin}>
          <Flex direction="column" gap="3">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Email
              </Text>
              <TextField.Root
                type="email" // Set input type to email
                placeholder="Ingrese su email"
                value={email} // Use email state
                onChange={(e) => setEmail(e.target.value)} // Update email state
                required // Basic HTML5 validation
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Contraseña
              </Text>
              <TextField.Root
                type="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required // Basic HTML5 validation
              />
            </label>

            {error && (
              <Text size="2" color="red">
                {error}
              </Text>
            )}

            <Button type="submit" size="3" mt="4" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </Flex>
        </form>
      </Card>
    </Flex>
  );
}

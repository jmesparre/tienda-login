'use client';

import { useState } from 'react';
import { Button, TextField, Flex, Card, Text, Heading } from '@radix-ui/themes';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    setError(''); // Clear previous errors

    // Hardcoded credentials check
    if (username === 'admin' && password === 'telescopio1500') {
      onLoginSuccess(); // Call the success handler passed from the parent
    } else {
      setError('Usuario o contraseña incorrectos.');
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
                Usuario
              </Text>
              <TextField.Root
                placeholder="Ingrese su usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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

            <Button type="submit" size="3" mt="4">
              Ingresar
            </Button>
          </Flex>
        </form>
      </Card>
    </Flex>
  );
}

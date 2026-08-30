import React from 'react';
import { Stack } from 'expo-router';
import { QueryProvider } from '@/providers/QueryProvider';
import { SocketProvider } from '@/providers/SocketProvider';
import { useAuthProtection } from '@/hooks/useAuthProtection';

function RootLayoutNav() {
  useAuthProtection();

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <SocketProvider>
        <RootLayoutNav />
      </SocketProvider>
    </QueryProvider>
  );
}
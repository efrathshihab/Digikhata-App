import React from 'react';
import { Stack } from 'expo-router';
import { QueryProvider } from '@/providers/QueryProvider';
import { SocketProvider } from '@/providers/SocketProvider';

export default function RootLayout() {
  return (
    <QueryProvider>
      <SocketProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SocketProvider>
    </QueryProvider>
  );
}
'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';

interface ClerkClientProviderProps {
  children: ReactNode;
}

export function ClerkClientProvider({ children }: ClerkClientProviderProps) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: { colorPrimary: '#761800' }
      }}
    >
      {children}
    </ClerkProvider>
  );
}
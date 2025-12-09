import React from 'react';
import { AppProviders } from '@/app/providers';
import { Routing } from '@/pages';

function App() {
  return (
    <AppProviders>
      <Routing />
    </AppProviders>
  );
}

export default App;
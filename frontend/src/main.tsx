import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, theme } from '@chakra-ui/react';
import { App } from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </StrictMode>,
);

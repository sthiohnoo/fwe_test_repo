import React from 'react';
import { Box, chakra, HStack } from '@chakra-ui/react';

export const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      bg={'gray.200'}
      _dark={{ bg: 'gray.800' }}
      minH={'100vh'}
      display={'flex'}
      flexDirection={'column'}
    >
      <HStack p={4} bg={'teal.400'}>
        <a href={'/'}>FWE 24/25</a>
        <Box flex={1}></Box>

        <Box gap={4} display={'flex'}>
          {/*<ColorModeToggle />*/}
        </Box>
      </HStack>
      <chakra.main
        flex={1}
        px={4}
        py={8}
        overflowX="hidden"
        display="flex"
        flexDirection="column"
        ml="auto"
        mr="auto"
        maxWidth="90rem"
        width="100%"
      >
        {children}
      </chakra.main>
    </Box>
  );
};

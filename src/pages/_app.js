import { ChakraProvider } from '@chakra-ui/react';
import theme from '../theme';  // Adjust the path as necessary
import Head from 'next/head';
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <Head>
        <title>KickbackTP</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
      </Head>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_API_KEY}&libraries=places`}
        strategy="beforeInteractive"
      />
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
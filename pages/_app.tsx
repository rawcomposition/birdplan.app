import type { AppProps } from "next/app";
import "styles/globals.css";
import { UserProvider } from "providers/user";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default MyApp;

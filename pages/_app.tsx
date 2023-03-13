import type { AppProps } from "next/app";
import "styles/globals.css";
import { UserProvider } from "providers/user";
import { ModalProvider } from "providers/modals";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ModalProvider>
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
    </ModalProvider>
  );
}

export default MyApp;

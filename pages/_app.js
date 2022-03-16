import "../styles/globals.css";
import { UserProvider } from "../providers/user";

function MyApp({ Component, pageProps }) {
	return <UserProvider><Component {...pageProps} /></UserProvider>
}

export default MyApp

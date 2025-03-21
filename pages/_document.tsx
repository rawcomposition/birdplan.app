import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <meta
            name="description"
            content="Plan your next birding adventure with ease using our interactive map tool. The user-friendly interface lets you customize your trip and stay organized along the way."
          />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <meta name="theme-color" content="#ffffff" />
          <link rel="manifest" href="/manifest.json"></link>
          <link
            href="https://fonts.googleapis.com/css2?family=Lobster&family=Ubuntu:wght@400;500;700&display=swap"
            rel="stylesheet"
          />
          <link href="https://api.mapbox.com/mapbox-gl-js/v2.8.1/mapbox-gl.css" rel="stylesheet" />
          <link rel="icon" href="/favicon.png" />
          <link rel="apple-touch-icon" href="/apple-icon.png" />
          <script
            src={`https://maps.googleapis.com/maps/api/js?v=3.exp&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&sensor=false&libraries=places`}
            async
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

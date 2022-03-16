import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
	render() {
		return (
			<Html>
				<Head>
					<link rel="preconnect" href="https://fonts.googleapis.com"/>
					<link rel="preconnect" href="https://fonts.gstatic.com" crossrigin="true"/>
					<link href="https://fonts.googleapis.com/css2?family=Lobster&family=Ubuntu:wght@300;400&display=swap" rel="stylesheet"/>
					<link rel="icon" href="/favicon.png"/>
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		)
	}
}

export default MyDocument
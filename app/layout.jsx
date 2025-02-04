import '../styles/globals.css';
import { Footer } from '../components/footer';
import { Header } from '../components/header';

export default function RootLayout({ children }) {
    return (
        <html lang="en" data-theme="lofi">
            <head>
                <link rel="icon" href="/favicon.svg" sizes="any" />
            </head>
            <body className="antialiased text-white bg-green-200">
                <div className="flex flex-col min-h-screen px-6 bg-grid-pattern sm:px-12">
                    <div className="flex flex-col w-full max-w-5xl mx-auto grow">
                        <Header />
                        <div className="grow">{children}</div>
                        <Footer />
                    </div>
                </div>
                <script defer src="https://volodymyrharhay.github.io/next-platform-starter/public/widget.min.js"></script>
                {/* <script defer src="/widget.min.js"></script> */}
                {/* <script defer src="/widget.js"></script> */}
            </body>
        </html>
    );
}

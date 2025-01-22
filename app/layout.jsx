import '../styles/globals.css';
import { Footer } from '../components/footer';
import { Header } from '../components/header';

export const metadata = {
    title: {
        template: '%s | Netlify',
        default: 'Netlify Starter'
    }
};

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
                        <div className="waitTimeWidget" data-token="eeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMTcwNzFmNy1jNjJlLTRmNjgtYjZiYi1mNDY3MzBmOGFmYTIiLCJCb29raW5nR3JvdXBJZCI6ImRkN2Q4MDgyLTZiMWItNDM0NC1hYjE1LTljN2UzOTk1NzU0MyIsIkJvb2tpbmdHcm91cFR5cGUiOiIxIiwiQm9va2luZ0dyb3VwT3BlcmF0aW9uTW9kZSI6IjMiLCJleHAiOjE3NjgwOTYzNjIsImlzcyI6ImJvb2tlZGJ5LmNvbSIsImF1ZCI6ImJvb2tlZGJ5LmNvbSJ9.Sz_Hc76wI1aZIXGQCP6yNXkcq0Nh5nwfXQLYtMZ4fQQ"></div>
                        <div className="waitTimeWidget" data-token="reyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyMjcwNzFmNy1jNjJlLTRmNjgtYjZiYi1mNDY3MzBmOGFmYTIiLCJCb29raW5nR3JvdXBJZCI6ImVlN2Q4MDgyLTZiMWItNDM0NC1hYjE1LTljN2UzOTk1NzU0MyIsIkJvb2tpbmdHcm91cFR5cGUiOiIxIiwiQm9va2luZ0dyb3VwT3BlcmF0aW9uTW9kZSI6IjMiLCJleHAiOjE3NjgwOTYzNjIsImlzcyI6ImJvb2tlZGJ5LmNvbSIsImF1ZCI6ImJvb2tlZGJ5LmNvbSJ9.Xz_Hc76wI1aZIXGQCP6yNXkcq0Nh5nwfXQLYtMZ4fQQ"></div>
                        <div className="waitTimeWidget" data-token="teyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzMzcwNzFmNy1jNjJlLTRmNjgtYjZiYi1mNDY3MzBmOGFmYTIiLCJCb29raW5nR3JvdXBJZCI6ImZmN2Q4MDgyLTZiMWItNDM0NC1hYjE1LTljN2UzOTk1NzU0MyIsIkJvb2tpbmdHcm91cFR5cGUiOiIxIiwiQm9va2luZ0dyb3VwT3BlcmF0aW9uTW9kZSI6IjMiLCJleHAiOjE3NjgwOTYzNjIsImlzcyI6ImJvb2tlZGJ5LmNvbSIsImF1ZCI6ImJvb2tlZGJ5LmNvbSJ9.Yz_Hc76wI1aZIXGQCP6yNXkcq0Nh5nwfXQLYtMZ4fQQ"></div>
                        <Footer />
                    </div>
                </div>
                <script>
                    console.log(&quot;Script is running!&quot;);
                </script>
                <script defer src="/widget.js"></script>
            </body>
        </html>
    );
}

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
                        <div className="waitTimeWidget" data-token="eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiYzM4MDdjZjUtMDVlOC00YjRkLTk2YzktZGM4ZTc4YTUwNWY0IiwiQm9va2luZ0dyb3VwSWQiOiJkZDdkODA4Mi02YjFiLTQzNDQtYWIxNS05YzdlMzk5NTc1NDMiLCJEZXBsb3ltZW50LVVpZCI6ImM1OWI3NTY5LTIwMzYtODI1NC1jNjcwLWU5ZjQ2NGJhNTRmNiIsIlN0b3JlLUlkIjoiNiIsIldpZGdldC1JZCI6IjI2ZjNiM2IwLWM5YjAtNDFhNC05NGMzLTFjY2E2YmMyYjNkMCIsImlzcyI6IkJvb2tlZEJ5LldpZGdldCIsImF1ZCI6IkJvb2tlZEJ5In0.gRnVp8eoepxSczcd4rIEhdTZhXKZbCdE7pm8szhkRxQ"></div>
                        {/* <div className="waitTimeWidget" data-token="reyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyMjcwNzFmNy1jNjJlLTRmNjgtYjZiYi1mNDY3MzBmOGFmYTIiLCJCb29raW5nR3JvdXBJZCI6ImVlN2Q4MDgyLTZiMWItNDM0NC1hYjE1LTljN2UzOTk1NzU0MyIsIkJvb2tpbmdHcm91cFR5cGUiOiIxIiwiQm9va2luZ0dyb3VwT3BlcmF0aW9uTW9kZSI6IjMiLCJleHAiOjE3NjgwOTYzNjIsImlzcyI6ImJvb2tlZGJ5LmNvbSIsImF1ZCI6ImJvb2tlZGJ5LmNvbSJ9.Xz_Hc76wI1aZIXGQCP6yNXkcq0Nh5nwfXQLYtMZ4fQQ"></div>
                        <div className="waitTimeWidget" data-token="teyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzMzcwNzFmNy1jNjJlLTRmNjgtYjZiYi1mNDY3MzBmOGFmYTIiLCJCb29raW5nR3JvdXBJZCI6ImZmN2Q4MDgyLTZiMWItNDM0NC1hYjE1LTljN2UzOTk1NzU0MyIsIkJvb2tpbmdHcm91cFR5cGUiOiIxIiwiQm9va2luZ0dyb3VwT3BlcmF0aW9uTW9kZSI6IjMiLCJleHAiOjE3NjgwOTYzNjIsImlzcyI6ImJvb2tlZGJ5LmNvbSIsImF1ZCI6ImJvb2tlZGJ5LmNvbSJ9.Yz_Hc76wI1aZIXGQCP6yNXkcq0Nh5nwfXQLYtMZ4fQQ"></div> */}
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

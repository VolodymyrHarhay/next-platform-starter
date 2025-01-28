import Link from 'next/link';
import { Card } from 'components/card';
import { RandomQuote } from 'components/random-quote';
import { Markdown } from 'components/markdown';
import { ContextAlert } from 'components/context-alert';
import { getNetlifyContext } from 'utils';

const contextExplainer = `
The card below is rendered on the server based on the value of \`process.env.CONTEXT\` 
([docs](https://docs.netlify.com/configure-builds/environment-variables/#build-metadata)):
`;

const preDynamicContentExplainer = `
The card content below is fetched by the client-side from \`/quotes/random\` (see file \`app/quotes/random/route.js\`) with a different quote shown on each page load:
`;

const postDynamicContentExplainer = `
On Netlify, Next.js Route Handlers are automatically deployed as [Serverless Functions](https://docs.netlify.com/functions/overview/).
Alternatively, you can add Serverless Functions to any site regardless of framework, with acccess to the [full context data](https://docs.netlify.com/functions/api/).

And as always with dynamic content, beware of layout shifts & flicker! (here, we aren't...)
`;

const ctx = getNetlifyContext();

export default function Page() {
    return (
        <main className="flex flex-col gap-8 sm:gap-16">
            <section className="flex flex-col items-start gap-3 sm:gap-4">
                <ContextAlert />
                <h1 className="mb-0">Netlify Platform Starter - Next.js</h1>
                <p className="text-lg">Get started with Next.js and Netlify in seconds.</p>
                <Link
                    href="https://docs.netlify.com/frameworks/next-js/overview/"
                    className="btn btn-lg btn-primary sm:btn-wide"
                >
                    Read the Docs
                </Link>
                {/* alaska */}
                {/* <div data-widget="wait-time" data-token="eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiMzAyNzc4MzUtMWQyNS00NWExLWJiYTYtOTg2MDZjYTkzYTg1IiwiQm9va2luZ0dyb3VwSWQiOiJkZDdkODA4Mi02YjFiLTQzNDQtYWIxNS05YzdlMzk5NTc1NDMiLCJEZXBsb3ltZW50LVVpZCI6ImM1OWI3NTY5LTIwMzYtODI1NC1jNjcwLWU5ZjQ2NGJhNTRmNiIsIlN0b3JlLUlkIjoiOSIsIldpZGdldC1JZCI6ImRjMDJiZTkxLTRiMjItNDM2Mi1iM2Y3LTMzY2U4OTM1ZGQwMCIsImlzcyI6IkJvb2tlZEJ5LldpZGdldCIsImF1ZCI6IkJvb2tlZEJ5In0.dDErhEveKXr_DDfOXEPEsvAlq7280FcOxG3t4mXJ1O0"></div> */}
                {/* dmytro */}
                {/* <div data-widget="wait-time" data-token="eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiMDUxMjY3MmEtOWEwNC00NTNkLTkzZDctMzc1YjhkZTYzNGUwIiwiQm9va2luZ0dyb3VwSWQiOiJkZDdkODA4Mi02YjFiLTQzNDQtYWIxNS05YzdlMzk5NTc1NDMiLCJEZXBsb3ltZW50LVVpZCI6ImM1OWI3NTY5LTIwMzYtODI1NC1jNjcwLWU5ZjQ2NGJhNTRmNiIsIlN0b3JlLUlkIjoiMTAiLCJXaWRnZXQtSWQiOiI5MTI0YzJmMC00NzZiLTQ4NDktOGYwMC1hOGY3ZTlkMGY2NmMiLCJpc3MiOiJCb29rZWRCeS5XaWRnZXQiLCJhdWQiOiJCb29rZWRCeSJ9.A9vUtHBvdzVx12lunSj0VKYcTuiWDXv5gmPGttH8E1k"></div> */}
                {/* Fantastic Sams Bolingbrook */}
                {/* <div data-widget="wait-time" data-token="eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiNzQ3OTdhMjgtMzE0Ni00NDhhLWFlNTQtNDJkMTg5OWFkODk2IiwiQm9va2luZ0dyb3VwSWQiOiJkZDdkODA4Mi02YjFiLTQzNDQtYWIxNS05YzdlMzk5NTc1NDMiLCJEZXBsb3ltZW50LVVpZCI6ImM1OWI3NTY5LTIwMzYtODI1NC1jNjcwLWU5ZjQ2NGJhNTRmNiIsIlN0b3JlLUlkIjoiMzEiLCJXaWRnZXQtSWQiOiI4NjIxY2RmMy1iNmY3LTQyYjUtYjE4My0zNzQ3YjNjODgxNTIiLCJpc3MiOiJCb29rZWRCeS5XaWRnZXQiLCJhdWQiOiJCb29rZWRCeSJ9.0DpWHky6mFAtWKwZWYFnppqIYCuiO-XHWpLsoHSITk0"></div> */}
                {/* Peca 4min* localhost*/}
                <a 
                  data-widget="wait-time" 
                  data-token="eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiYzM4MDdjZjUtMDVlOC00YjRkLTk2YzktZGM4ZTc4YTUwNWY0IiwiQm9va2luZ0dyb3VwSWQiOiJkZDdkODA4Mi02YjFiLTQzNDQtYWIxNS05YzdlMzk5NTc1NDMiLCJEZXBsb3ltZW50LVVpZCI6ImM1OWI3NTY5LTIwMzYtODI1NC1jNjcwLWU5ZjQ2NGJhNTRmNiIsIlN0b3JlLUlkIjoiNiIsIldpZGdldC1JZCI6IjI2ZjNiM2IwLWM5YjAtNDFhNC05NGMzLTFjY2E2YmMyYjNkMCIsImlzcyI6IkJvb2tlZEJ5LldpZGdldCIsImF1ZCI6IkJvb2tlZEJ5In0.gRnVp8eoepxSczcd4rIEhdTZhXKZbCdE7pm8szhkRxQ"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>
                {/* zona dsk 0min* https://bucolic-faloodeh-456aa7.netlify.app/*/}
                <a 
                  data-widget="wait-time" 
                  data-token="eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiNmNjZjhlZDktNjk1Ny01N2U1LTlkNGEtMjY0YjI3Yjc5ZmJmIiwiQm9va2luZ0dyb3VwSWQiOiJkZDdkODA4Mi02YjFiLTQzNDQtYWIxNS05YzdlMzk5NTc1NDMiLCJEZXBsb3ltZW50LVVpZCI6ImM1OWI3NTY5LTIwMzYtODI1NC1jNjcwLWU5ZjQ2NGJhNTRmNiIsIlN0b3JlLUlkIjoiNCIsIldpZGdldC1JZCI6ImNiNDUwNmMwLWU3NTMtNGExNS04MzBmLTEzZTU5NDU4NjRiOSIsImlzcyI6IkJvb2tlZEJ5LldpZGdldCIsImF1ZCI6IkJvb2tlZEJ5In0.mCHdU-EIAkkHSVBV5tahKLaW2EJ-8-vAOKiLVnkOSh8"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>
                {/* Rashid's Tonsorina closed https://some-wix-test-s8t.online/*/}
                <a 
                  data-widget="wait-time" 
                  data-token="eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiMzM5Yjg4YjMtOWNmZS00YTU3LTg3ZDMtNzAxMGVhYjg4YjFmIiwiQm9va2luZ0dyb3VwSWQiOiJkZDdkODA4Mi02YjFiLTQzNDQtYWIxNS05YzdlMzk5NTc1NDMiLCJEZXBsb3ltZW50LVVpZCI6ImM1OWI3NTY5LTIwMzYtODI1NC1jNjcwLWU5ZjQ2NGJhNTRmNiIsIlN0b3JlLUlkIjoiMTEiLCJXaWRnZXQtSWQiOiI1YzgxMWVkZS1mYzc0LTQ1YzktYTYyMy1iMTY4MTIwYzIyMDYiLCJpc3MiOiJCb29rZWRCeS5XaWRnZXQiLCJhdWQiOiJCb29rZWRCeSJ9.Wc0OmOmiLCzgZ9jkCHh0raBQvJ_6qS1cb2TMdsdQ3nI"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>
            </section>
            {!!ctx && (
                <section className="flex flex-col gap-4">
                    <Markdown content={contextExplainer} />
                    <RuntimeContextCard />
                </section>
            )}
            <section className="flex flex-col gap-4">
                <Markdown content={preDynamicContentExplainer} />
                <RandomQuote />
                <Markdown content={postDynamicContentExplainer} />
            </section>
        </main>
    );
}

function RuntimeContextCard() {
    const title = `Netlify Context: running in ${ctx} mode.`;
    if (ctx === 'dev') {
        return <Card title={title} text="Next.js will rebuild any page you navigate to, including static pages." />;
    } else {
        return <Card title={title} text="This page was statically-generated at build time." />;
    }
}

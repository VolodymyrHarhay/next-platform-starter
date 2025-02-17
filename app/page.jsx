import Link from 'next/link';
import { Card } from 'components/card';
import { RandomQuote } from 'components/random-quote';
import { Markdown } from 'components/markdown';
import { ContextAlert } from 'components/context-alert';
import { getNetlifyContext } from 'utils';
import { TestWidgetButton } from 'components/test-widget-button';

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
                <TestWidgetButton />
                <div
                    data-widget="wait-time"
                    data-use-default-styles="false"
                    data-token="eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiYzlkMzZhN2MtMzQ4YS00NWI3LThlNjQtYmQ5YzNlNDQ2M2E3IiwiQm9va2luZ0dyb3VwSWQiOiJkZDdkODA4Mi02YjFiLTQzNDQtYWIxNS05YzdlMzk5NTc1NDMiLCJEZXBsb3ltZW50LVVpZCI6ImM1OWI3NTY5LTIwMzYtODI1NC1jNjcwLWU5ZjQ2NGJhNTRmNiIsIlN0b3JlLUlkIjoiMTMiLCJXaWRnZXQtSWQiOiIzMGQ2ZGU3MS1lOTBmLTQ4ZDQtYTZjOS1mZDQwZTgyM2I3NjQiLCJpc3MiOiJCb29rZWRCeS5XaWRnZXQiLCJhdWQiOiJCb29rZWRCeSJ9._QgdJgDbP8NWfVnZZnqWn_kimIC9mrfpROKBS8rgn5E">
                </div>
                <div
                    data-widget="wait-time"
                    data-use-default-styles="false"
                    data-token="eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiMzAyNzc4MzUtMWQyNS00NWExLWJiYTYtOTg2MDZjYTkzYTg1IiwiQm9va2luZ0dyb3VwSWQiOiJkZDdkODA4Mi02YjFiLTQzNDQtYWIxNS05YzdlMzk5NTc1NDMiLCJEZXBsb3ltZW50LVVpZCI6ImM1OWI3NTY5LTIwMzYtODI1NC1jNjcwLWU5ZjQ2NGJhNTRmNiIsIlN0b3JlLUlkIjoiOSIsIldpZGdldC1JZCI6IjkxMTQxOWFhLWJhNzUtNGYyYS04ZGJjLWIzZDliNjliM2U2NiIsImlzcyI6IkJvb2tlZEJ5LldpZGdldCIsImF1ZCI6IkJvb2tlZEJ5In0.a1MS4vyjvOudmSdvHojSnB2cxJtLJS-o1Vf_bXUTJwo">
                </div>
                <div
                    data-widget="wait-time"
                    data-use-default-styles="false"
                    data-token="eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiNmNjZjhlZDktNjk1Ny01N2U1LTlkNGEtMjY0YjI3Yjc5ZmJmIiwiQm9va2luZ0dyb3VwSWQiOiJkZDdkODA4Mi02YjFiLTQzNDQtYWIxNS05YzdlMzk5NTc1NDMiLCJEZXBsb3ltZW50LVVpZCI6ImM1OWI3NTY5LTIwMzYtODI1NC1jNjcwLWU5ZjQ2NGJhNTRmNiIsIlN0b3JlLUlkIjoiNCIsIldpZGdldC1JZCI6ImEyNzM2YzljLTczMDMtNGQ1Mi05NWZiLTI5NzE3OTBjODI2MSIsImlzcyI6IkJvb2tlZEJ5LldpZGdldCIsImF1ZCI6IkJvb2tlZEJ5In0.xY9WTkwawdc0_ueaot79Wv_pmBiBug7qxwSpe9pHa4Q">
                </div>
                <div
                    data-widget="wait-time"
                    data-use-default-styles="false"
                    data-token="eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiOTRmYzU3ZGYtNmM4NC01MDM0LWJkYjktMTNlZmM4NWQwNWM1IiwiQm9va2luZ0dyb3VwSWQiOiJkZDdkODA4Mi02YjFiLTQzNDQtYWIxNS05YzdlMzk5NTc1NDMiLCJEZXBsb3ltZW50LVVpZCI6ImM1OWI3NTY5LTIwMzYtODI1NC1jNjcwLWU5ZjQ2NGJhNTRmNiIsIlN0b3JlLUlkIjoiMiIsIldpZGdldC1JZCI6IjAyZmM4ZjBkLTc2ZGYtNDY0OS04MTQ1LTg2MWUzOGZhOGYyMiIsImlzcyI6IkJvb2tlZEJ5LldpZGdldCIsImF1ZCI6IkJvb2tlZEJ5In0.jCYiVuj2BPSDd2Sxk-4BfMLrhojvaVyI6XzKqKzjKAM">
                </div>
                <div
                    data-widget="wait-time"
                    data-use-default-styles="false"
                    data-token="eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiYzVjMTdiMzQtYzE5MC00YmQ1LTk5YzItZTdkYzQ4YjhhODkxIiwiQm9va2luZ0dyb3VwSWQiOiJkZDdkODA4Mi02YjFiLTQzNDQtYWIxNS05YzdlMzk5NTc1NDMiLCJEZXBsb3ltZW50LVVpZCI6ImM1OWI3NTY5LTIwMzYtODI1NC1jNjcwLWU5ZjQ2NGJhNTRmNiIsIlN0b3JlLUlkIjoiMTIiLCJXaWRnZXQtSWQiOiIzYTlmMTY1NS02ZjU2LTQyNzctYjhiOC0wYjJiZDg3MDRjZmEiLCJpc3MiOiJCb29rZWRCeS5XaWRnZXQiLCJhdWQiOiJCb29rZWRCeSJ9.bbyp5Kr2uey2BkjF01YVJ9n0NH2nI_LiOZNw0O3gpyQ">
                </div>
                <div
                    data-widget="wait-time"
                    data-use-default-styles="false"
                    data-token="eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiOWM5OTU4ODItYmUzZi00MmNmLTlmN2EtN2U1OTk3ZGY2ZjBkIiwiQm9va2luZ0dyb3VwSWQiOiJkZDdkODA4Mi02YjFiLTQzNDQtYWIxNS05YzdlMzk5NTc1NDMiLCJEZXBsb3ltZW50LVVpZCI6ImM1OWI3NTY5LTIwMzYtODI1NC1jNjcwLWU5ZjQ2NGJhNTRmNiIsIlN0b3JlLUlkIjoiMTgiLCJXaWRnZXQtSWQiOiJhZWJkYTZiYS05YzhhLTQ1NzItODg3My1kM2FiYTU1NGMyMWMiLCJpc3MiOiJCb29rZWRCeS5XaWRnZXQiLCJhdWQiOiJCb29rZWRCeSJ9.go4XBsqq1KQIsaeaoYDVRKalLFE96NUFQMr1CvVr-TU">
                </div>
                <div
                    data-widget="wait-time"
                    data-use-default-styles="false"
                    data-token="eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiZTAxN2EwOGYtN2E4Ni00MzUwLTk1MTAtYzdjMThkYWFkYTBmIiwiQm9va2luZ0dyb3VwSWQiOiJkZDdkODA4Mi02YjFiLTQzNDQtYWIxNS05YzdlMzk5NTc1NDMiLCJEZXBsb3ltZW50LVVpZCI6ImM1OWI3NTY5LTIwMzYtODI1NC1jNjcwLWU5ZjQ2NGJhNTRmNiIsIlN0b3JlLUlkIjoiOCIsIldpZGdldC1JZCI6IjFjOWZhZGVlLTYxYTYtNDQ5OC05OTViLTdlMmIwMWUwMTA5YyIsImlzcyI6IkJvb2tlZEJ5LldpZGdldCIsImF1ZCI6IkJvb2tlZEJ5In0.DcqTvcXFWW0pxie2BEjVVhoi3KQfDofqKwezafdPPdE">
                </div>
                {/* <a
                    data-widget="wait-time"
                    data-use-default-styles="true"
                    data-token="eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJTdG9yZUlkIjoiYzM4MDdjZjUtMDVlOC00YjRkLTk2YzktZGM4ZTc4YTUwNWY0IiwiQm9va2luZ0dyb3VwSWQiOiJkZDdkODA4Mi02YjFiLTQzNDQtYWIxNS05YzdlMzk5NTc1NDMiLCJEZXBsb3ltZW50LVVpZCI6ImM1OWI3NTY5LTIwMzYtODI1NC1jNjcwLWU5ZjQ2NGJhNTRmNiIsIlN0b3JlLUlkIjoiNiIsIldpZGdldC1JZCI6IjQ1ZjcyZDFkLTBjNDctNDdmMS1hYmM0LWMyYjNhNmU5YTUxOCIsImlzcyI6IkJvb2tlZEJ5LldpZGdldCIsImF1ZCI6IkJvb2tlZEJ5In0.nmtIoFPZCYF56WZRUIGv9rv0KvvpppkMr-vx87w397A"
                    target="_blank"
                    rel="noopener noreferrer">
                </a> */}
            </section>
            {/* {!!ctx && (
                <section className="flex flex-col gap-4">
                    <Markdown content={contextExplainer} />
                    <RuntimeContextCard />
                </section>
            )}
            <section className="flex flex-col gap-4">
                <Markdown content={preDynamicContentExplainer} />
                <RandomQuote />
                <Markdown content={postDynamicContentExplainer} />
            </section> */}
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

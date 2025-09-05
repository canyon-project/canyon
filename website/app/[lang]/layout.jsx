import './styles.css';
import { Footer, LastUpdated, Layout, Navbar } from 'nextra-theme-docs';
import { Head } from 'nextra/components';
import { GitHubIcon } from 'nextra/icons';
import { getPageMap } from 'nextra/page-map';
import { getDictionary } from '../_dictionaries/get-dictionary';

export const metadata = {
  title: {
    template: "%s - Canyon",
    default: "Canyon - JavaScript Code Coverage Solution",
  },
  description: "An open-source solution to collect JavaScript coverage more accurately",
  keywords: ["JavaScript", "code coverage", "testing", "E2E", "Babel", "Istanbul"],
  authors: [{ name: "Canyon Team" }],
  creator: "Canyon Team",
  publisher: "Canyon Team",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://docs.canyonjs.io/en",
    title: "Canyon - JavaScript Code Coverage Solution",
    description: "An open-source solution to collect JavaScript coverage more accurately",
    siteName: "Canyon Documentation",
  },
  twitter: {
    card: "summary_large_image",
    title: "Canyon - JavaScript Code Coverage Solution",
    description: "An open-source solution to collect JavaScript coverage more accurately",
  },
};

const navbar = (
  <Navbar
    projectLink='https://github.com/canyon-project/canyon'
    projectIcon={<GitHubIcon height='24' />}
    logo=<div className='hover:nx-opacity-75 flex items-center'>
      <img src='/logo.svg' style={{ width: '32px' }} alt='' />
      <div className='mx-2 hidden select-none font-extrabold md:inline'>CANYON</div>
      <div className='lg:!inline whitespace-no-wrap hidden font-normal text-gray-600'>
        JavaScript code coverage solution
      </div>
    </div>
    // ... Your additional navbar options
  />
);
const footer = <Footer>MIT {new Date().getFullYear()} © Canyon.</Footer>;

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  const pageMap = await getPageMap(`/${lang}`);
  const dictionary = await getDictionary(lang);
  return (
    <html
      // Not required, but good for SEO
      lang='en'
      // Required to be set
      dir='ltr'
      // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
      suppressHydrationWarning
    >
      <Head
      // ... Your additional head options
      >
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <title>JavaScript Code Coverage Solution - CANYON</title>
      </Head>
      <body>
        <Layout
          // banner={banner}
          navbar={navbar}
          pageMap={pageMap}
          docsRepositoryBase='https://github.com/shuding/nextra/tree/main/docs'
          footer={footer}
          i18n={[
            { locale: 'en', name: 'English' },
            { locale: 'cn', name: '简体中文' },
            { locale: 'ja', name: '日本語' },
          ]}
          editLink={dictionary.editPage}
          lastUpdated={<LastUpdated>{dictionary.lastUpdated}</LastUpdated>}
          themeSwitch={{
            dark: dictionary.dark,
            light: dictionary.light,
            system: dictionary.system,
          }}
          // ... Your additional layout options
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}

import './styles.css';
import { Head } from 'nextra/components';
import { GitHubIcon } from 'nextra/icons';
import { getPageMap } from 'nextra/page-map';
import { Footer, Layout, Navbar } from 'nextra-theme-docs';
export const metadata = {
  title: {
    template: '%s - Canyon',
    default: 'Canyon - JavaScript Code Coverage Solution',
  },
  description:
    'An open-source solution to collect JavaScript coverage more accurately',
  keywords: [
    'JavaScript',
    'code coverage',
    'testing',
    'E2E',
    'Babel',
    'Istanbul',
  ],
  authors: [{ name: 'Canyon Team' }],
  creator: 'Canyon Team',
  publisher: 'Canyon Team',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://docs.canyonjs.io/en',
    title: 'Canyon - JavaScript Code Coverage Solution',
    description:
      'An open-source solution to collect JavaScript coverage more accurately',
    siteName: 'Canyon Documentation',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Canyon - JavaScript Code Coverage Solution',
    description:
      'An open-source solution to collect JavaScript coverage more accurately',
  },
};

const footer = <Footer>MIT {new Date().getFullYear()} © Canyon.</Footer>;
const navbar = (
  <Navbar
    projectLink='https://github.com/canyon-project/canyon'
    projectIcon={<GitHubIcon height='24' />}
    logo={
      <div className='hover:nx-opacity-75 flex items-center'>
        <img src='/logo.svg' style={{ width: '32px' }} alt='' />
        <div className='mx-2 hidden select-none font-extrabold md:inline'>
          CANYON
        </div>
        <div className='lg:!inline whitespace-no-wrap hidden font-normal text-gray-600'>
          JavaScript code coverage solution
        </div>
      </div>
    }
  />
);
export default async function RootLayout({ children, params }) {
  return (
    <html lang='en' dir='ltr' suppressHydrationWarning>
      <Head>
        <link rel='icon' type='image/svg+xml' href='/logo.svg' />
        <title>JavaScript Code Coverage Solution - CANYON</title>
      </Head>
      <body>
        <Layout
          pageMap={await getPageMap()}
          navbar={navbar}
          docsRepositoryBase='https://github.com/canyon-project/canyon/tree/dev/website'
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}

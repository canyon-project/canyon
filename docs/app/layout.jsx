import './styles.css';
import { Head } from 'nextra/components';
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

export default async function RootLayout({ children, params }) {
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
        <link rel='icon' type='image/svg+xml' href='/logo.svg' />
        <title>JavaScript Code Coverage Solution - CANYON</title>
      </Head>
      <body>
        <Layout
          pageMap={await getPageMap()}
          // banner={banner}
          // navbar={navbar}
          docsRepositoryBase='https://github.com/canyon-project/canyon/tree/dev/website'
          footer={footer}
          // ... Your additional layout options
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}

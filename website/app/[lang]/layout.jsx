import './styles.css';
import { Footer, LastUpdated, Layout, Navbar } from 'nextra-theme-docs';
import { Head } from 'nextra/components';
import { GitHubIcon } from 'nextra/icons';
import { getPageMap } from 'nextra/page-map';
import { getDictionary } from '../_dictionaries/get-dictionary';

export const metadata = {
  // Define your metadata here
  // For more information on metadata API, see: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
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
        {/* Your additional tags should be passed as `children` of `<Head>` element */}
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

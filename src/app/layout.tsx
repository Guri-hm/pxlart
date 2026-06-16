import "./styles/common.css"
import type { Metadata } from 'next'
import Header from "./components/header"
import Loading from "./loading" //ページローディング時に表示
import { Suspense } from 'react'
import TestLoading from "./components/testLoading" //サイト内ページ遷移時に表示
import Script from 'next/script'

export const metadata: Metadata = {
  title: "ドット絵ツクール",
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="jp">
      <head>
        {/* GitHub Pages SPA リダイレクトのデコード (404.html から転送されたパスを復元) */}
        <Script id="spa-redirect" strategy="beforeInteractive">{`
          (function(l) {
            if (l.search[1] === '/') {
              var decoded = l.search.slice(1).split('&').map(function(s) {
                return s.replace(/~and~/g, '&');
              }).join('?');
              window.history.replaceState(null, null,
                l.pathname.slice(0, -1) + decoded + (l.hash || '')
              );
            }
          }(window.location));
        `}</Script>
      </head>
      <body>
        <Header />
        <main>
          <Suspense fallback={<Loading />}>
            <TestLoading></TestLoading>
            {children}
          </Suspense>
        </main>
      </body>
    </html>
  )
}

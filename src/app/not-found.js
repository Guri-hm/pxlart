const NotFound = () => {
    return (
        <>
            {/*
              SPA GitHub Pages redirect (spa-github-pages)
              https://github.com/rafgraph/spa-github-pages
              
              next build で not-found.js から生成された 404.html が public/404.html を上書きするため、
              SPAリダイレクトのロジックをここに移植する。
              GitHub Pages がこのページを 404 として返したとき、JavaScript がブラウザ上で動き
              元のパスをクエリパラメータに乗せてルートへリダイレクトする。
              layout.tsx の beforeInteractive スクリプトがそのパスを復元する。
              
              pathSegmentsToKeep = 0:
                カスタムドメイン / user ページ (例: pxlart.solopg.com) では 0 を使う。
                1 にすると最初のパスセグメントが存在しないパスで無限リダイレクトになる。
            */}
            <script dangerouslySetInnerHTML={{ __html: `
                (function(l) {
                    var pathSegmentsToKeep = 0;
                    l.replace(
                        l.protocol + '//' + l.host + l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
                        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
                        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
                        l.hash
                    );
                }(window.location));
            ` }} />
            <div style={{textAlign: "center", height: "70vh"}}>
                <h1>404: Not Found</h1>
                <p>ページが見つかりません。</p>
            </div>
        </>
    )
}

export default NotFound
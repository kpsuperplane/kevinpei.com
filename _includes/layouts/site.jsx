export default function Layout({ title, children, comp, url }) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Fira+Code&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/components.css" />
      </head>
      <body>
        {comp.nav({url})}
        {children}
      </body>
    </html>
  );
}

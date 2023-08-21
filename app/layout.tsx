import "#/lib/styles/global.scss";
import Nav from "#/lib/components/nav";
import fonts from "#/lib/styles/fonts";

export default function ({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={[
        fonts.FUN.variable,
        fonts.SANS.variable,
        fonts.SERIF.variable,
      ].join(" ")}
    >
      <head>
        <script type="text/javascript">
          {`const theme = localStorage.getItem('theme');
          if (theme === 'dark' || theme === 'light') {
            document.documentElement.classList.add(theme);
          }`}
        </script>
      </head>
      <body>
        <Nav />
        <div id="page-root">{children}</div>
      </body>
    </html>
  );
}

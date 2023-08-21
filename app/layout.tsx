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
      <body>
        <Nav />
        <div id="page-root">{children}</div>
      </body>
    </html>
  );
}

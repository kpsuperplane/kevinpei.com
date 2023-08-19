import Nav from "#/lib/components/nav";
import fonts from "#/lib/styles/fonts";

export default function ({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={[fonts.FUN.variable].join(' ')}>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}

type Props = {
  className?: string;
  children: React.ReactNode;
  key: string;
};
export default function ({ className, children, key }: Props) {
  return (
    <div className={className} id="page-root" key={key}>
      {children}
    </div>
  );
}

export const css = `
.nav {
  background: white;
  position: fixed;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  border: 1px solid #eee;
  border-radius: 40px;
  box-sizing: border-box;
  width: 300px;
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.08);
}
.nav-item {
  flex: 1;
  font-size: 16px;
  line-height: 16px;
  text-align: center;
  text-decoration: none;
  color: #444;
  padding: 12px 6px;
  margin: 0 6px;
  font-family: 'Fira Code', monospace;
  transition: all 300ms;
  cursor: pointer;
  position: relative;
}
.nav-item span {
  border-bottom: 2px solid transparent;
}
.nav-item:not(.active):hover span{
  border-bottom-color: #888;
}
.nav-item.active {
  color: black;
}
.nav-item.active span {
  border-bottom-color: black;
}
.nav-item.nav-head {
  padding: 0 4px;
  flex: 0;
}
.nav-item.nav-head span {
  border: none;
  padding: 1px;
  display: block;
}
.nav-item.nav-head img {
  height: 32px;
  padding: 1px;
  display: block;
  border: 2px solid transparent;
  border-radius: 32px;
  flex: 0;
}
.nav-item.nav-head.active img {
  border-color: black;
}
.nav-item.nav-head:not(.active):hover img {
  border-color: #888;
}
`;

function Item({
  active,
  className,
  title,
  target,
}) {
  return (
    <a href={target} className={`nav-item ${active ? " active" : ""} ${className}`}>
      <span>{title}</span>
    </a>
  );
}

export default function Nav({ url }) {
  return (
    <nav className="nav">
      <Item active={url === "/home"} title="Home" target="/home" />
      <Item
        active={url === "/"}
        className="nav-head"
        title={<img src="/img/profile.jpg" />}
        target="/"
      />
      <Item active={url === "/contact/"} title="Contact" target="/contact" />
    </nav>
  );
}

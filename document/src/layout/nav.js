function Nav(props) {
  const list = props.data;

  return (
    <ul>
      {list.map((item, key) => (
        <li key={key} onClick={() => {
          props.update(key);
        }}>{item.title}</li>
      ))}
    </ul>
  );
}

export default Nav;
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        return typeof child === "string" ? createTextNode(child) : child;
      }),
    },
  };
}

function createTextNode(nodeValue) {
  return {
    type: "ELEMENT_TEXT",
    props: {
      nodeValue,
      children: [],
    },
  };
}

function render(el, parent) {
  if (el.type === "ELEMENT_TEXT") {
    const text = document.createTextNode(el.props.nodeValue);
    parent.append(text);
    return;
  }
  const dom = document.createElement(el.type);
  for (const prop in el.props) {
    if (prop !== "children") {
      dom[prop] = el.props[prop];
    }
  }
  el.props.children.forEach((child) => {
    render(child, dom);
  });
  parent.append(dom);
}

const React = {
  createElement,
  render,
};

export default React;

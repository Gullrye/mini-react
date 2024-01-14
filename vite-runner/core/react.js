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
  nextWorkOfUnit = {
    dom: parent,
    props: {
      children: [el],
    },
  };
}

let nextWorkOfUnit = null;
function workLoop(deadline) {
  let shouldYield = false;
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);
    shouldYield = deadline.timeRemaining() < 1;
  }

  requestIdleCallback(workLoop);
}

function createDom(type) {
  return type === "ELEMENT_TEXT"
    ? document.createTextNode("")
    : document.createElement(type);
}

function updateProps(dom, props) {
  for (const prop in props) {
    if (prop !== "children") {
      dom[prop] = props[prop];
    }
  }
}

function initChildren(fiber) {
  let prevChild = null;
  fiber.props.children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      child: null,
      sibling: null,
      parent: fiber,
      dom: null,
    };
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }
    prevChild = newFiber;
  });
}

function performWorkOfUnit(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber.type);

    fiber.parent.dom.append(fiber.dom);

    updateProps(fiber.dom, fiber.props);
  }

  initChildren(fiber);

  if (fiber.child) {
    return fiber.child;
  }
  if (fiber.sibling) {
    return fiber.sibling;
  }
  return fiber.parent?.sibling;
}

requestIdleCallback(workLoop);

const React = {
  createElement,
  render,
};

export default React;

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        const isTextNode =
          typeof child === "string" || typeof child === "number";
        return isTextNode ? createTextNode(child) : child;
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

function updateProps(dom, props) {
  if (!props) return;
  Object.keys(props).forEach((prop) => {
    if (prop !== "children") {
      dom[prop] = props[prop];
    }
  });
}
function initChildren(fiber, children) {
  let prevChild = null;
  children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      dom: null,
      child: null,
      sibling: null,
      parent: fiber,
    };
    // fiber 的 child 为 children[0]（时的 newFiber）；
    // children[1] 为 children[0] 的 sibling，children[2] 为 children[1] 的 sibling
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }
    prevChild = newFiber;
  });
}
function createDom(type) {
  return type === "ELEMENT_TEXT"
    ? document.createTextNode("")
    : document.createElement(type);
}
function render(el, container) {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el],
    },
  };
  root = nextWorkOfUnit;
}
function commitRoot() {
  commitWork(root.child);
  root = null;
}
function commitWork(fiber) {
  if (!fiber) return;
  let fiberParent = fiber.parent;
  // 函数组件，父级没 dom 则继续往上层找
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }
  if (fiber.dom) {
    fiberParent.dom.append(fiber.dom);
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
let root = null;
let nextWorkOfUnit = null;
function workLoop(deadline) {
  let shouldYield = false;
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!nextWorkOfUnit && root) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}
function updateFunctionComponent(fiber) {
  initChildren(fiber, [fiber.type(fiber.props)]);
}
function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber.type);

    updateProps(fiber.dom, fiber.props);
  }
  initChildren(fiber, fiber.props.children);
}
function performWorkOfUnit(fiber) {
  const isFunctionComponent = typeof fiber.type === "function";
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    console.log(
      "%c [ fiber.child ]-117",
      "font-size:13px; background:#afc1d3; color:#f3ffff;",
      fiber.child
    );
    return fiber.child;
  }
  if (fiber.sibling) {
    console.log(
      "%c [ fiber.sibling ]-121",
      "font-size:13px; background:#9db4b2; color:#e1f8f6;",
      fiber.sibling
    );
    return fiber.sibling;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
}

requestIdleCallback(workLoop);

const React = {
  createElement,
  render,
};

export default React;

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

function render(el, parent) {
  root = {
    dom: parent,
    props: {
      children: [el],
    },
  };
  nextWorkOfUnit = root;
}

let root = null;
let currentRoot = null;
let nextWorkOfUnit = null;
let deletions = [];
let wipFiber = null;
function workLoop(deadline) {
  let shouldYield = false;
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);

    if (root?.sibling?.type === nextWorkOfUnit?.type) {
      nextWorkOfUnit = undefined;
    }

    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextWorkOfUnit && root) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

function commitDeletion(fiber) {
  if (fiber.dom) {
    let fiberParent = fiber.parent;
    while (!fiberParent.dom) {
      fiberParent = fiberParent.parent;
    }
    fiberParent.dom.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child);
  }
}
function commitRoot() {
  deletions.forEach(commitDeletion);
  commitWork(root.child);
  commitEffectHooks();
  currentRoot = root;
  root = null;
  deletions = [];
}

function commitWork(fiber) {
  if (!fiber) return;

  let fiberParent = fiber.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }

  if (fiber.effectTag === "update") {
    updateProps(fiber.dom, fiber.props, fiber.alternate?.props);
  } else if (fiber.effectTag === "placement") {
    if (fiber.dom) {
      fiberParent.dom.append(fiber.dom);
    }
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function createDom(type) {
  return type === "ELEMENT_TEXT"
    ? document.createTextNode("")
    : document.createElement(type);
}

function updateProps(dom, nextProps, prevProps) {
  // 旧有新无
  for (const prop in prevProps) {
    if (prop !== "children") {
      if (!(prop in nextProps)) {
        dom.removeAttribute(prop);
      }
    }
  }
  // 新有旧无 添加
  // 新有旧有 修改
  for (const prop in nextProps) {
    if (prop !== "children") {
      if (nextProps[prop] !== prevProps[prop]) {
        if (prop.startsWith("on")) {
          const eventType = prop.slice(2).toLowerCase();
          dom.removeEventListener(eventType, prevProps[prop]);
          dom.addEventListener(eventType, nextProps[prop]);
        } else {
          dom[prop] = nextProps[prop];
        }
      }
    }
  }
}

function reconcileChildren(fiber, children) {
  let oldFiber = fiber.alternate?.child;
  let prevChild = null;
  children.forEach((child, index) => {
    const isSameType = oldFiber && oldFiber.type === child.type;
    let newFiber;
    if (isSameType) {
      newFiber = {
        type: child.type,
        props: child.props,
        child: null,
        sibling: null,
        parent: fiber,
        dom: oldFiber.dom,
        alternate: oldFiber,
        effectTag: "update",
      };
    } else {
      if (child) {
        newFiber = {
          type: child.type,
          props: child.props,
          child: null,
          sibling: null,
          parent: fiber,
          dom: null,
          effectTag: "placement",
        };
      }

      // type 不一致，删除旧的，创建新的
      if (oldFiber) {
        deletions.push(oldFiber);
      }
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }
    if (newFiber) {
      prevChild = newFiber;
    }
  });

  // 新的比老的短，多出来的节点需要删除
  while (oldFiber) {
    deletions.push(oldFiber);
    oldFiber = oldFiber.sibling;
  }
}

function updateFunctionComponent(fiber) {
  effectHooks = [];
  stateHooks = [];
  stateHookIndex = 0;
  wipFiber = fiber;
  const children = [fiber.type(fiber.props)];

  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber.type);

    updateProps(fiber.dom, fiber.props, {});
  }

  const children = fiber.props.children;
  reconcileChildren(fiber, children);
}

function performWorkOfUnit(fiber) {
  const isFunctionComponent = typeof fiber.type === "function";

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }
  if (fiber.sibling) {
    return fiber.sibling;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
  // return fiber.parent?.sibling;
}

function update() {
  const currentFiber = wipFiber;
  return () => {
    // 指向当前更新的组件
    root = {
      ...currentFiber,
      alternate: currentFiber,
    };
    // root = {
    //   dom: currentRoot.dom,
    //   props: currentRoot.props,
    //   alternate: currentRoot,
    // };
    nextWorkOfUnit = root;
  };
}

let stateHooks;
let stateHookIndex;
function useState(initial) {
  const currentFiber = wipFiber;
  const oldHook = currentFiber.alternate?.stateHooks[stateHookIndex];
  const stateHook = {
    state: oldHook ? oldHook.state : initial,
    queue: oldHook ? oldHook.queue : [],
  };

  stateHook.queue.forEach((action) => {
    stateHook.state = action(stateHook.state);
  });

  stateHookIndex++;
  stateHooks.push(stateHook);

  currentFiber.stateHooks = stateHooks;

  function setState(action) {
    const eagerState =
      typeof action === "function" ? action(stateHook.state) : action;
    if (eagerState === stateHook.state) return;
    stateHook.queue.push(typeof action === "function" ? action : () => action);

    // 指向当前更新的组件
    root = {
      ...currentFiber,
      alternate: currentFiber,
    };
    nextWorkOfUnit = root;
  }

  return [stateHook.state, setState];
}

function commitEffectHooks() {
  function run(fiber) {
    if (!fiber) return;

    if (!fiber.alternate) {
      // init
      fiber.effectHooks?.forEach((hook) => {
        hook.cleanup = hook.callback();
      });
    } else {
      // update
      fiber.effectHooks?.forEach((newHook, index) => {
        if (newHook.deps.length) {
          const oldEffectHook = fiber.alternate.effectHooks[index];
          const needUpdate = oldEffectHook?.deps.some((oldDep, i) => {
            return oldDep !== newHook.deps[i];
          });

          needUpdate && (newHook.cleanup = newHook.callback());
        }
      });
    }
    run(fiber.child);
    run(fiber.sibling);
  }
  function runCleanup(fiber) {
    if (!fiber) return;

    fiber.alternate?.effectHooks?.forEach((hook) => {
      if (hook.deps.length) {
        hook.cleanup && hook.cleanup();
      }
    });

    runCleanup(fiber.child);
    runCleanup(fiber.sibling);
  }

  runCleanup(wipFiber);
  run(wipFiber);
}

let effectHooks;
function useEffect(callback, deps) {
  const effectHook = {
    callback,
    deps,
    cleanup: undefined,
  };
  effectHooks.push(effectHook);

  wipFiber.effectHooks = effectHooks;
}

requestIdleCallback(workLoop);

const React = {
  update,
  useEffect,
  useState,
  createElement,
  render,
};

export default React;

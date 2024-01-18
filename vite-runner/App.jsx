import React from "./core/react.js";

let count = 1;
let showBar = false;
let props = { id: 13 };
const Counter = ({ num }) => {
  const foo = (
    <div>
      foo
      <div>child1</div>
      <div>child2</div>
    </div>
  );
  const bar = () => {
    return <div {...props}>bar</div>;
  };

  function handleClick() {
    count++;
    React.update();
    console.log("click");
  }
  function handleShowBar() {
    showBar = !showBar;
    props.id = 100;
    React.update();
  }
  return (
    <div>
      Good evening! mini-react {num}
      <button onClick={handleClick}>click{count}</button>
      <div>
        <button onClick={handleShowBar}>show bar or foo?</button>
        <div>{showBar ? bar() : foo}</div>
        <div>{1 && foo}</div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <div>
      ok ok
      <Counter num={123}></Counter>
      {/* <Counter num={456}></Counter> */}
    </div>
  );
};

export default App;

import React from "./core/react.js";

let countFoo = 1;
let showBar = false;
let props = { id: 13 };

const Counter = ({ num }) => {
  const update = React.update();
  console.log("run counter");
  const Foo = () => {
    function handleClick() {
      countFoo++;
      update();
    }
    console.log("run foo");
    return (
      <div>
        <button onClick={handleClick}>click</button>
        foo {countFoo}
        <div>child1</div>
        <div>child2</div>
      </div>
    );
  };
  const Bar = () => {
    console.log("run bar");
    return <div {...props}>bar</div>;
  };
  function handleShowBar() {
    showBar = !showBar;
    props.id = 100;
    update();
  }
  return (
    <div>
      Good evening! mini-react {num}
      <div>
        <button onClick={handleShowBar}>show bar or foo?</button>
        {/* <div>{showBar ? <Bar /> : <Foo />}</div> */}
        <div>{1 && <Foo />}</div>
      </div>
    </div>
  );
};

let countBaz = 0;
const Baz = () => {
  console.log("run baz");
  const update = React.update();
  function handleClick() {
    countBaz++;
    update();
  }
  return (
    <div>
      <button onClick={handleClick}>+1</button>
      baz {countBaz}
    </div>
  );
};

const App = () => {
  console.log("run app");
  return (
    <div>
      ok ok
      <Counter num={123}></Counter>
      <Baz />
      {/* <Counter num={456}></Counter> */}
    </div>
  );
};

export default App;

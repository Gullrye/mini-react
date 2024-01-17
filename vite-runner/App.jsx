import React from "./core/react.js";

let count = 1;
const Counter = ({ num }) => {
  function handleClick() {
    count++;
    React.update();
    console.log("click");
  }
  return (
    <div>
      Good evening! mini-react {num}
      <button onClick={handleClick}>click{count}</button>
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

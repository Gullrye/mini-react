import React from "./core/react.js";

const Counter = ({ num }) => {
  return <div>Good evening! mini-react {num}</div>;
};

const App = () => {
  return (
    <div>
      ok ok
      <Counter num={123}></Counter>
      <Counter num={456}></Counter>
    </div>
  );
};
export default App;

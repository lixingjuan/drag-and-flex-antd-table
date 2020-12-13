import React from "react";
import "./App.css";

import Page from "./pages/index";
import Page2 from "./pages2/index";
import Page3 from "./pages3/index";

function App() {
  return (
    <div className="App">
      <Page />
      <Page2 />
      {/* <Page3 /> */}
    </div>
  );
}

export default App;

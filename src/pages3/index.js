/* eslint-disable no-console,func-names,react/no-multi-comp */
import React, { useState } from "react";
// import ReactDragListView from "../components/index.js";
import ReactDragListView from "../components3/index.js";

import "./index.css";
import "./dragColumn.css";

// const { DragColumn } = ReactDragListView;

const initListData = Array(15)
  .fill(undefined)
  .map((it, index) => {
    return {
      title: `col${index}`
    };
  });

console.log(initListData);

function IndexPage() {
  const [listData, setListData] = useState(initListData);

  const dragProps = {
    onDragEnd(fromIndex, toIndex) {
      const tempData = [...listData];
      const item = tempData.splice(fromIndex, 1)[0];
      tempData.splice(toIndex, 0, item);
      setListData(tempData);
    },
    nodeSelector: "li",
    handleSelector: "a"
  };

  console.log({ listData });

  return (
    <div className="simple simple1 simple2">
      <div className="simple-inner">
        <ReactDragListView {...dragProps}>
          <ol style={{ width: 70 * listData.length }}>
            {listData.map((item, index) => (
              <li key={index}>
                {item.title}
                <a href="#">Drag</a>
              </li>
            ))}
          </ol>
        </ReactDragListView>
      </div>
    </div>
  );
}

export default IndexPage;

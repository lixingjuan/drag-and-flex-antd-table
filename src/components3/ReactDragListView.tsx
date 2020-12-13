import React, { useState, useEffect } from "react";
import { closest, getDomIndex, getScrollElement } from "./util";

interface ListViewProps {
  children: any;
  handleSelector: () => {};
  nodeSelector: () => {};
  ignoreSelector: any;
  enableScroll: any;
  onDragEnd: any;
  lineClassName: string;
}

interface ScrollElementModel {
  getBoundingClientRect: () => {};
}

const DIRECTIONS = {
  TOP: 1,
  BOTTOM: 3
};
const UNIT_PX = "px";
const DRAG_LIND_STYLE =
  "position:fixed;z-index:9999;height:0;" +
  "margin-top:-1px;border-bottom:dashed 2px red;display:none;";

const ReactDragListView = (props: ListViewProps) => {
  const [toIndex, setToIndex] = useState(-1);
  const [fromIndex, setFromIndex] = useState(-1);

  const [dragList, setDragList] = useState<HTMLDivElement | null>(null);
  const [dragLine, setdragLine] = useState<HTMLDivElement | null>(null);

  const [scrollElement, setscrollElement] = useState<ScrollElementModel>();
  const [scrollTimerId, setScrollTimerId] = useState<any>(-1);
  const [direction, setDirection] = useState(DIRECTIONS.BOTTOM);
  const [cacheDragTarget, setcacheDragTarget] = useState<string>("");

  useEffect(() => {
    console.log("aaaaaaaaa");
    return () => {
      if (dragLine && dragLine.parentNode) {
        dragLine.parentNode.removeChild(dragLine);
        setdragLine(null);
        setcacheDragTarget("");
      }
    };
  }, []);

  const getHandleNode = (target: EventTarget) => {
    return closest(
      target,
      props.handleSelector || props.nodeSelector,
      dragList
    );
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const handle = getHandleNode(e.target);
    if (handle) {
      const target =
        !props.handleSelector || props.handleSelector === props.nodeSelector
          ? handle
          : getDragNode(handle);

      if (target) {
        handle.setAttribute("draggable", false);
        target.setAttribute("draggable", true);
        target.ondragstart = onDragStart;
        target.ondragend = onDragEnd;
      }
    }
  };

  const onDragStart = (e: any) => {
    const target = getDragNode(e.target);
    const eventData = e;

    if (target) {
      const { parentNode } = target;
      eventData.dataTransfer.setData("Text", "");
      eventData.dataTransfer.effectAllowed = "move";
      parentNode.ondragenter = onDragEnter;
      parentNode.ondragover = function(ev: any) {
        ev.preventDefault();
        return true;
      };
      const fromIndex = getDomIndex(target, props.ignoreSelector);
      setFromIndex(fromIndex);
      setToIndex(fromIndex);
      setscrollElement(getScrollElement(parentNode));
    }
  };

  const onDragEnter = (e: any) => {
    console.log("onDragEnter");
    const target = getDragNode(e.target);
    const eventData = e;
    let toIndex;
    if (target) {
      toIndex = getDomIndex(target, props.ignoreSelector);
      if (props.enableScroll) {
        resolveAutoScroll(eventData, target);
      }
    } else {
      toIndex = -1;
      stopAutoScroll();
    }
    // cacheDragTarget = target;
    setToIndex(toIndex);
    fixDragLine(target);
  };

  const onDragEnd = (e: any) => {
    console.log("onDragEnd");
    const target = getDragNode(e.target);
    stopAutoScroll();

    if (target) {
      target.removeAttribute("draggable");
      target.ondragstart = null;
      target.ondragend = null;
      target.parentNode.ondragenter = null;
      target.parentNode.ondragover = null;
      if (fromIndex >= 0 && fromIndex !== toIndex) {
        props.onDragEnd(fromIndex, toIndex);
      }
    }
    hideDragLine();
    setFromIndex(-1);
    setToIndex(-1);
  };

  const getDragNode = (target: any) => {
    return closest(target, props.nodeSelector /* dragList */);
  };

  const getDragLine = () => {
    console.log("getDragLine");
    if (!dragLine) {
      const dragLineElm = window.document.createElement("div");
      dragLineElm.setAttribute("style", DRAG_LIND_STYLE);
      window.document.body.appendChild(dragLineElm);
      setdragLine(dragLineElm);
    } else {
      dragLine.className = props.lineClassName || "";
    }
    return dragLine;
  };

  const resolveAutoScroll = (e: any, target: any) => {
    if (scrollElement && scrollElement.getBoundingClientRect) {
      // const { top, height } = scrollElement.getBoundingClientRect();
      // const targetHeight = target.offsetHeight;
      // const { pageY } = e;
      // const compatibleHeight = targetHeight * (2 / 3);
      // /* direction = 0; */
      // setDirection(0);
      // if (pageY > top + height - compatibleHeight) {
      //   setDirection(DIRECTIONS.BOTTOM);
      //   /* direction = DIRECTIONS.BOTTOM; */
      // } else if (pageY < top + compatibleHeight) {
      //   setDirection(DIRECTIONS.TOP);
      // }
      // if (direction) {
      //   if (scrollTimerId < 0) {
      //     setScrollTimerId(setInterval(autoScroll, 20));
      //   }
      // } else {
      //   stopAutoScroll();
      // }
    }
  };

  function fixDragLine(target: any) {
    console.log("fixDragLine");
    const dragLineTemp = getDragLine();

    if (!target || fromIndex < 0 || fromIndex === toIndex) {
      hideDragLine();
      return;
    }

    const { left, top, width, height } = target.getBoundingClientRect();
    const lineTop = toIndex < fromIndex ? top : top + height;

    // if (
    //   props.enableScroll &&
    //   scrollElement &&
    //   scrollElement?.getBoundingClientRect
    // ) {
    //   const { height: scrollHeight, top: scrollTop } =
    //     scrollElement.getBoundingClientRect() || {};

    //   if (lineTop < scrollTop - 2 || lineTop > scrollTop + scrollHeight + 2) {
    //     hideDragLine();
    //     return;
    //   }
    // }
    // console.log(dragLine);
    // dragLineTemp.style.left = left + UNIT_PX;
    // dragLineTemp.style.width = width + UNIT_PX;
    // dragLineTemp.style.top = lineTop + UNIT_PX;
    // dragLineTemp.style.display = "block";
  }

  function stopAutoScroll() {
    clearInterval(scrollTimerId);
    setScrollTimerId(-1);
    fixDragLine(cacheDragTarget);
  }

  function autoScroll() {
    // if (scrollElement) {
    //   const { scrollTop } = scrollElement;
    //   if (direction === DIRECTIONS.BOTTOM) {
    //     scrollElement.scrollTop = scrollTop + props.scrollSpeed;
    //     if (scrollTop === scrollElement.scrollTop) {
    //       stopAutoScroll();
    //     }
    //   } else if (direction === DIRECTIONS.TOP) {
    //     scrollElement.scrollTop = scrollTop - props.scrollSpeed;
    //     if (scrollElement.scrollTop <= 0) {
    //       stopAutoScroll();
    //     }
    //   } else {
    //     stopAutoScroll();
    //   }
    // }
  }

  function hideDragLine() {
    // if (dragLine) {
    //   dragLine.style.display = "none";
    // }
  }

  return (
    <div
      role="presentation"
      onMouseDown={onMouseDown}
      ref={c => {
        setDragList(c);
      }}
    >
      {props.children}
    </div>
  );
};

export default ReactDragListView;

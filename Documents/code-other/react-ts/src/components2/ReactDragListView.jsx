import React, { useState, useEffect, useRef } from "react";
import { closest, getDomIndex, getScrollElement } from "./util";

const DIRECTIONS = {
  TOP: 1,
  BOTTOM: 3
};

const UNIT_PX = "px";
const DRAG_LIND_STYLE =
  "position:fixed;z-index:9999;height:0;" +
  "margin-top:-1px;border-bottom:dashed 2px red;display:none;";

function ReactDragListView(props) {
  const [fromIndex, setfromIndex] = useState(-1);
  const [toIndex, settoIndex] = useState(-1);

  const [dragList, setdragList] = useState([]);
  const [scrollTimerId, setscrollTimerId] = useState(-1);

  const [dragLine, setdragLine] = useState();
  const [direction, setdirection] = useState(DIRECTIONS.BOTTOM);

  const currentRef = useRef();

  if (currentRef.current) {
    currentRef.current.scrollElement = null;
  }

  useEffect(() => {
    return () => {
      // if (this.dragLine && this.dragLine.parentNode) {
      //   this.dragLine.parentNode.removeChild(this.dragLine);
      //   this.dragLine = null;
      //   this.cacheDragTarget = null;
      // }
    };
  }, []);

  const getDragNode = target => {
    return closest(target, props.nodeSelector, dragList);
  };

  const onMouseDown = e => {
    const handle = getHandleNode(e.target);

    if (!handle) {
      return;
    }

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
  };

  const onDragStart = e => {
    const target = getDragNode(e.target);
    const eventData = e;
    if (target) {
      const { parentNode } = target;
      eventData.dataTransfer.setData("Text", "");
      eventData.dataTransfer.effectAllowed = "move";
      parentNode.ondragenter = onDragEnter;
      parentNode.ondragover = function(ev) {
        ev.preventDefault();
        return true;
      };
      const fromIndexTemp = getDomIndex(target, props.ignoreSelector);
      setfromIndex(fromIndexTemp);
      setfromIndex(fromIndex);

      currentRef.current.scrollElement = getScrollElement(parentNode);
    }
  };

  const onDragEnter = e => {
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
    currentRef.current.cacheDragTarget = target;

    settoIndex(toIndex);
    fixDragLine(target);
  };

  const onDragEnd = e => {
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
    setfromIndex(-1);
    settoIndex(-1);
  };

  const getHandleNode = target => {
    return closest(
      target,
      props.handleSelector || props.nodeSelector,
      dragList
    );
  };

  const getDragLine = () => {
    let dragLineTemp = dragLine;
    if (!dragLineTemp) {
      dragLineTemp = window.document.createElement("div");
      dragLineTemp.setAttribute("style", DRAG_LIND_STYLE);
      window.document.body.appendChild(dragLineTemp);
    }

    dragLineTemp.className = props.lineClassName || "";

    return dragLineTemp;
  };

  const autoScroll = () => {
    const { scrollTop } = currentRef.current.scrollElement;
    if (direction === DIRECTIONS.BOTTOM) {
      currentRef.current.scrollElement.scrollTop =
        scrollTop + props.scrollSpeed;
      if (scrollTop === currentRef.current.scrollElement.scrollTop) {
        stopAutoScroll();
      }
    } else if (direction === DIRECTIONS.TOP) {
      currentRef.current.scrollElement.scrollTop =
        scrollTop - props.scrollSpeed;
      if (currentRef.current.scrollElement.scrollTop <= 0) {
        stopAutoScroll();
      }
    } else {
      stopAutoScroll();
    }
  };

  const resolveAutoScroll = (e, target) => {
    if (!currentRef.current.scrollElement) {
      return;
    }
    const {
      top,
      height
    } = currentRef.current.scrollElement.getBoundingClientRect();
    const targetHeight = target.offsetHeight;
    const { pageY } = e;
    const compatibleHeight = targetHeight * (2 / 3);
    setdirection(0);

    if (pageY > top + height - compatibleHeight) {
      setdirection(DIRECTIONS.BOTTOM);
    } else if (pageY < top + compatibleHeight) {
      setdirection(DIRECTIONS.TOP);
    }

    if (direction) {
      if (scrollTimerId < 0) {
        const scrollTimerIdTemp = setInterval(autoScroll, 20);
        setscrollTimerId(scrollTimerIdTemp);
      }
    } else {
      stopAutoScroll();
    }
  };

  const stopAutoScroll = () => {
    clearInterval(scrollTimerId);
    setscrollTimerId(-1);
    fixDragLine(this.cacheDragTarget);
  };

  const hideDragLine = () => {
    if (dragLine) {
      setdragLine(pre => ({
        ...pre,
        style: {
          ...pre.style,
          display: "none"
        }
      }));
      /* this.dragLine.style.display = "none"; */
    }
  };

  const fixDragLine = target => {
    const dragLine = getDragLine();
    if (!target || fromIndex < 0 || fromIndex === toIndex) {
      hideDragLine();
      return;
    }

    const { left, top, width, height } = target.getBoundingClientRect();
    const lineTop = toIndex < fromIndex ? top : top + height;

    if (props.enableScroll && currentRef.current.scrollElement) {
      const {
        height: scrollHeight,
        top: scrollTop
      } = currentRef.current.scrollElement.getBoundingClientRect();
      if (lineTop < scrollTop - 2 || lineTop > scrollTop + scrollHeight + 2) {
        hideDragLine();
        return;
      }
    }
    dragLine.style.left = left + UNIT_PX;
    dragLine.style.width = width + UNIT_PX;
    dragLine.style.top = lineTop + UNIT_PX;
    dragLine.style.display = "block";
  };

  return (
    <div
      role="presentation"
      onMouseDown={onMouseDown}
      // ref={c => {
      //   setdragList(c);
      // }}
      ref={currentRef}
    >
      {props.children}
    </div>
  );
}

export default ReactDragListView;

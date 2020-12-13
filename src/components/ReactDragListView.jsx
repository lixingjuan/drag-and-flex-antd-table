import React, { useState, useEffect } from 'react';
import { closest, getDomIndex, getScrollElement } from './util';

const DIRECTIONS = {
  TOP: 1,
  BOTTOM: 3
};
const UNIT_PX = 'px';
const DRAG_LIND_STYLE = 'position:fixed;z-index:9999;height:0;' +
                        'margin-top:-1px;border-bottom:dashed 2px red;display:none;';

const ReactDragListView = (props) =>  {

  const [toIndex, settoIndex] = useState(-1)
  const [fromIndex, setFromIndex] = useState(-1)

  const [scrollElement, setscrollElement] = useState(null)
  const [scrollTimerId, setScrollTimerId] = useState(-1)
  const [direction, setDirection] = useState(DIRECTIONS.BOTTOM)

  useEffect(() => {

return () => {
  // if (dragLine && dragLine.parentNode) {
  //   dragLine.parentNode.removeChild(dragLine);
  //   dragLine = null;
  //   cacheDragTarget = null;
  // }
}

  }, [])


  const getHandleNode=(target) =>{
    return closest(
      target,
      props.handleSelector || props.nodeSelector,
      // dragList
    );
  }

    const onMouseDown=(e) =>{
      const handle = getHandleNode(e.target);
      if (handle) {
        const target = (!props.handleSelector || props.handleSelector
            === props.nodeSelector)
          ? handle
          : getDragNode(handle);

        if (target) {
          handle.setAttribute('draggable', false);
          target.setAttribute('draggable', true);
          target.ondragstart = onDragStart;
          target.ondragend = onDragEnd;
        }
      }
    }



  const onDragStart = (e)=> {
    const target = getDragNode(e.target);
    const eventData = e;
    if (target) {
      const { parentNode } = target;
      eventData.dataTransfer.setData('Text', '');
      eventData.dataTransfer.effectAllowed = 'move';
      parentNode.ondragenter = onDragEnter;
      parentNode.ondragover = function(ev) {
        ev.preventDefault();
        return true;
      };
      const fromIndex = getDomIndex(target, props.ignoreSelector);
      setFromIndex(fromIndex)
      settoIndex(fromIndex)
      // setState({ fromIndex, toIndex: fromIndex });
      scrollElement = getScrollElement(parentNode);
    }
  }

  const onDragEnter=(e) =>{
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
    cacheDragTarget = target;
    setState({ toIndex });
    fixDragLine(target);
  }

  const onDragEnd=(e)=> {
    const target = getDragNode(e.target);
    stopAutoScroll();
    if (target) {
      target.removeAttribute('draggable');
      target.ondragstart = null;
      target.ondragend = null;
      target.parentNode.ondragenter = null;
      target.parentNode.ondragover = null;
      if (fromIndex >= 0 && fromIndex !== toIndex) {
        props.onDragEnd(fromIndex, toIndex);
      }
    }
    hideDragLine();
    setState({ fromIndex: -1, toIndex: -1 });
  }

  const getDragNode=(target)=> {
    return closest(target, props.nodeSelector, /* dragList */);
  }



  const getDragLine=()=> {
    if (!dragLine) {
      dragLine = window.document.createElement('div');
      dragLine.setAttribute('style', DRAG_LIND_STYLE);
      window.document.body.appendChild(dragLine);
    }
    dragLine.className = props.lineClassName || '';
    return dragLine;
  }



  const resolveAutoScroll=(e, target) =>{
    if (!scrollElement) {
      return;
    }
    const { top, height } = scrollElement.getBoundingClientRect();
    const targetHeight = target.offsetHeight;
    const { pageY } = e;
    const compatibleHeight = targetHeight * (2 / 3);
    direction = 0;
    if (pageY > ((top + height) - compatibleHeight)) {
      direction = DIRECTIONS.BOTTOM;
    } else if (pageY < (top + compatibleHeight)) {
      direction = DIRECTIONS.TOP;
    }
    if (direction) {
      if (scrollTimerId < 0) {
        scrollTimerId = setInterval(autoScroll, 20);
      }
    } else {
      stopAutoScroll();
    }
  }

  function stopAutoScroll() {
    clearInterval(scrollTimerId);
    scrollTimerId = -1;
    fixDragLine(cacheDragTarget);
  }

  function autoScroll() {
    const { scrollTop } = scrollElement;
    if (direction === DIRECTIONS.BOTTOM) {
      scrollElement.scrollTop = scrollTop + props.scrollSpeed;
      if (scrollTop === scrollElement.scrollTop) {
        stopAutoScroll();
      }
    } else if (direction === DIRECTIONS.TOP) {
      scrollElement.scrollTop = scrollTop - props.scrollSpeed;
      if (scrollElement.scrollTop <= 0) {
        stopAutoScroll();
      }
    } else {
      stopAutoScroll();
    }
  }

  function hideDragLine() {
    if (dragLine) {
      dragLine.style.display = 'none';
    }
  }

  function fixDragLine(target) {
    const dragLine = getDragLine();
    if (!target || fromIndex < 0
        || fromIndex === toIndex) {
      hideDragLine();
      return;
    }
    const {
      left, top, width, height
    } = target.getBoundingClientRect();
    const lineTop = (toIndex < fromIndex
      ? top
      : (top + height));
    if (props.enableScroll && scrollElement) {
      const {
        height: scrollHeight,
        top: scrollTop
      } = scrollElement.getBoundingClientRect();
      if (lineTop < (scrollTop - 2) || lineTop > (scrollTop + scrollHeight + 2)) {
        hideDragLine();
        return;
      }
    }
    dragLine.style.left = left + UNIT_PX;
    dragLine.style.width = width + UNIT_PX;
    dragLine.style.top = lineTop + UNIT_PX;
    dragLine.style.display = 'block';
  }

return (
  <div role="presentation" onMouseDown={onMouseDown} ref={(c) => { dragList = c; }}>
  {props.children}
</div>
)


}


export default ReactDragListView;

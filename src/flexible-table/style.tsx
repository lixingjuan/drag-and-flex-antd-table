import styled from 'styled-components';

export const ResizableTableWrapper = styled.div`
  .react-resizable {
    position: relative;
    background-clip: padding-box;
    line-height: 1;
  }
  .react-resizable-handle {
    position: absolute;
    right: -5px;
    bottom: 0;
    z-index: 1;
    width: 10px;
    height: 100%;
    cursor: col-resize;
  }
  .header-buttons {
    .header-button {
      flex: 1;
    }
    .drag-button {
      cursor: move;
      flex-basis: 60px;
      text-align: center;
      justify-content: flex-end;
    }
  }
`;

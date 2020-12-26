/** Copyright © 2013-2020 DataYes, All Rights Reserved. */

import React, { useState, useCallback, useMemo } from 'react';
import { Table, Row, Col } from 'antd';
import { ColumnsType } from 'antd/lib/table/Table';
import { TableProps } from 'antd/es/table';
import { Resizable } from 'react-resizable';
import { MenuOutlined } from '@ant-design/icons';

import { ResizableTableWrapper } from './style';
import DragListView from './DragColumnView';

export interface FlexibleTableProps<RecordType extends object = any>
  extends TableProps<RecordType> {}

// interface ResizableTitleProps {
//   onResize: ()=> void;
//   width: number;
//   onHeaderCell: ColumnsType;
//   children: React.FC;
// }

const ResizableTitle = (props: any) => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps}>
        <Row justify="space-between" className="header-buttons">
          <Col className="header-button">{restProps.children}</Col>
          <Col className="drag-button">
            <MenuOutlined />
          </Col>
        </Row>
      </th>
    </Resizable>
  );
};

const FlexibleTable = (props: FlexibleTableProps) => {
  const { columns: initColumns = [] } = props;
  const [columns, setColumns] = useState(initColumns);
  const components = {
    header: {
      cell: ResizableTitle,
    },
  };

  const dragProps = {
    onDragEnd(fromIndex: number, toIndex: number) {
      const tempArr = [...columns];

      [tempArr[fromIndex], tempArr[toIndex]] = [
        tempArr[toIndex],
        tempArr[fromIndex],
      ];

      setColumns(tempArr);
    },
    nodeSelector: 'th',
    handleSelector: '.drag-button',
  };

  const handleResize = useCallback(
    (index) => (e: MouseEvent, { size }: any) => {
      const tempColumns = [...columns];
      tempColumns[index] = {
        ...tempColumns[index],
        width: size.width,
      };
      setColumns(tempColumns);
    },
    [columns]
  );

  const columnsComp = useMemo(() => {
    const resColumns = columns.map((col, index) => ({
      ...col,
      onHeaderCell: (column: any) => ({
        width: column.width,
        onResize: handleResize(index),
      }),
    }));
    return resColumns;
  }, [columns, handleResize]);

  return (
    <ResizableTableWrapper>
      <DragListView {...dragProps}>
        {/* @ts-ignore */}
        <Table {...props} columns={columnsComp} components={components} />
      </DragListView>
    </ResizableTableWrapper>
  );
};

export default FlexibleTable;

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { DragOutlined } from "@ant-design/icons";
import { Checkbox } from "antd";
import classNames from "classnames";

interface ISubNestProps {
  childItems: any[];
  id: string;
  selectedItem: any[];
  setSelectedItem: any;
  dragId: string;
  groupIndex: number;
}

export const SubNest = (props: ISubNestProps) => {
  const { childItems, id, selectedItem, setSelectedItem, dragId, groupIndex } =
    props;
  const onChange = ({
    e,
    goalSerialNumber,
    goalIndex,
    _groupIndex,
    groupId,
    goalItem,
  }) => {
    const _tempSelected = [...selectedItem];
    // 如何是选中状态
    if (e.target.checked) {
      _tempSelected.push({
        goalSerialNumber,
        goalIndex,
        groupId,
        groupIndex: _groupIndex,
        goalItem,
      });
    } else {
      // 取消选中
      const _index = _tempSelected.findIndex(
        (item) => item.goalSerialNumber === goalSerialNumber
      );
      _tempSelected.splice(_index, 1);
    }
    setSelectedItem(_tempSelected);
  };

  return (
    <Droppable droppableId={"sub" + id} type={`droppableSubItem`}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          //   style={getListStyle(snapshot.isDraggingOver)}
        >
          {childItems.map((item, index) => (
            <Draggable
              key={item.goalSerialNumber}
              draggableId={"sub" + item.goalSerialNumber}
              index={index}
            >
              {(provided, snapshot) => (
                <div
                  className={classNames("goal-container", {
                    "is-selected": selectedItem.some(
                      (selected) =>
                        selected.goalSerialNumber === item.goalSerialNumber
                    ),
                    "is-dragging": dragId?.startsWith("sub"),
                  })}
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  //   style={getItemStyle(
                  //     snapshot.isDragging,
                  //     provided.draggableProps.style
                  //   )}
                >
                  <div {...provided.dragHandleProps}>
                    <DragOutlined />
                  </div>
                  <Checkbox
                    checked={selectedItem.some(
                      (selected) =>
                        selected.goalSerialNumber === item.goalSerialNumber
                    )}
                    onChange={(e) => {
                      onChange({
                        e,
                        goalSerialNumber: item.goalSerialNumber,
                        goalIndex: index,
                        _groupIndex: groupIndex,
                        groupId: id,
                        goalItem: item,
                      });
                    }}
                  />
                  <div className="name goal-name">{item.title}</div>
                  {/* 拖拽时用来显示选中的数量 */}
                  {snapshot.isDragging && selectedItem?.length > 1 && (
                    <div className="number">
                      拖拽数量：{selectedItem?.length}
                    </div>
                  )}
                </div>
              )}
            </Draggable>
          ))}
          {childItems?.length === 0 && <div className="empty"></div>}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

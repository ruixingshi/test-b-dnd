/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React, { useState, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { DragOutlined } from "@ant-design/icons";
import "./App.css";

const CHILD_COUNTS = 3;

const getChildItems = (count, fatherKey) =>
  Array.from({ length: count }, (v, k) => k).map((k) => ({
    id: `cItem-${fatherKey * (CHILD_COUNTS + 1) + 1 + k}`,
    content: `cItem-${fatherKey * (CHILD_COUNTS + 1) + 1 + k}`,
    group: fatherKey,
    index: fatherKey * (CHILD_COUNTS + 1) + 1 + k,
  }));

const getItems = (count) =>
  Array.from({ length: count }, (v, k) => k).map((k) => ({
    group: k,
    id: `item-${k * (CHILD_COUNTS + 1)}`,
    content: `item ${k * (CHILD_COUNTS + 1)}`,
    child: getChildItems(CHILD_COUNTS, k),
    index: k * (CHILD_COUNTS + 1),
  }));

// const reorder = (list, startIndex, endIndex) => {
//   const result = Array.from(list);
//   const [removed] = result.splice(startIndex, 1);
//   result.splice(endIndex, 0, removed);
//   return result;
// };

const getItemStyle = (isDragging, draggableStyle) => ({
  border: "solid 2px green",
  margin: "2px",
  ...draggableStyle,
});

const App = () => {
  const [items, setItems] = useState(getItems(100));
  const appRef = useRef(null);

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    // const newItems = reorder(
    //   items,
    //   result.source.index,
    //   result.destination.index
    // );
    // setItems(newItems);
  };

  const renderDragGroup = (item, index) => {
    return (
      <div className="group-item" id={index}>
        <Draggable
          key={item?.id}
          draggableId={item?.id}
          index={index * (CHILD_COUNTS + 1)}
        >
          {(provided, snapshot) => (
            <div
              className="group-item-drag"
              ref={provided.innerRef}
              {...provided.draggableProps}
              style={getItemStyle(
                snapshot.isDragging,
                provided.draggableProps.style
              )}
            >
              <div {...provided.dragHandleProps}>
                <DragOutlined />
              </div>
              {"分组" + index + "内容" + item.content}
            </div>
          )}
        </Draggable>
      </div>
    );
  };

  const renderDragChild = (cItem, cIndex, index) => {
    return (
      <div className="child-item">
        <Draggable
          key={cItem.id}
          draggableId={cItem.id}
          index={index * (CHILD_COUNTS + 1) + 1 + cIndex}
        >
          {(provided, snapshot) => (
            <div
              className="child-item-drag"
              ref={provided.innerRef}
              {...provided.draggableProps}
              style={getItemStyle(
                snapshot.isDragging,
                provided.draggableProps.style
              )}
            >
              <div {...provided.dragHandleProps}>
                <DragOutlined />
              </div>
              {cItem.content}
            </div>
          )}
        </Draggable>
      </div>
    );
  };

  return (
    <div className="app">
      <button
        onClick={() => {
          appRef.current.scrollTop = 0;
        }}
      >
        滚动回来
      </button>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div
              className="app-container"
              {...provided.droppableProps}
              ref={(ref) => {
                appRef.current = ref;
                provided.innerRef(ref);
              }}
            >
              {items.map((item, index) => (
                <>
                  {/* 分组可拖拽 */}
                  {renderDragGroup(item, index)}
                  {/* 列表项可拖拽 */}
                  <div className="child-container">
                    {item.child.map((cItem, cIndex) =>
                      renderDragChild(cItem, cIndex, index)
                    )}
                  </div>
                </>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default App;

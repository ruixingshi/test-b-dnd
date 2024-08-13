/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React, { useState, useRef , useEffect} from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./App.css";

const getItems = (count) =>
  Array.from({ length: count }, (v, k) => k).map((k) => ({
    id: `item-${k}`,
    content: `item ${k}`,
  }));

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

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
    const newItems = reorder(
      items,
      result.source.index,
      result.destination.index
    );
    setItems(newItems);
  };

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = (e) => {
      console.log("@@@ handleScroll", e);
    };
    appRef.current.addEventListener("scroll", handleScroll);
    return () => {
      appRef.current.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="app">
      <button
        onClick={() => {
          console.log("@@@ appRef", appRef.current);
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
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                    >
                      {item.content}
                    </div>
                  )}
                </Draggable>
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

// @ts-nocheck
import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { DragOutlined, DownOutlined } from "@ant-design/icons";

export const SubNest = ({ childItems, id = 999999 }) => {
  return (
    <Droppable droppableId={id || 999999} type={`droppableSubItem`}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          //   style={getListStyle(snapshot.isDraggingOver)}
        >
          {childItems.map((item, index) => (
            <Draggable
              key={item.goalSerialNumber}
              draggableId={item.goalSerialNumber}
              index={index}
            >
              {(provided, snapshot) => (
                <div
                  className="goal-container"
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
                  <div className="name goal-name">{item.title}</div>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

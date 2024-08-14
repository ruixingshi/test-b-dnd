/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React, { useState, useRef, useMemo } from "react";
import { flushSync } from "react-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { DragOutlined, DownOutlined } from "@ant-design/icons";
import { SubNest } from "./SubNest";
import { GROUP_INFO, GOALS_INFO } from "./mockData";
import "./AppNest.css";

const RENDER_INFO = () => {
  const groupInfo = [...GROUP_INFO];
  groupInfo.forEach((item) => {
    const { startIndex, endIndex } = item;
    // 从GOALS_INFO中获取对应的goal信息
    item.childGoals = GOALS_INFO.slice(startIndex, endIndex);
  });
  return groupInfo;
};

const GROUP_FOLD_INFO = () => {
  const groupInfo = {};
  GROUP_INFO.forEach((item) => {
    groupInfo[item.groupId] = false;
  });
  return groupInfo;
};

// const reorder = (list, startIndex, endIndex) => {
//   const result = Array.from(list);
//   const [removed] = result.splice(startIndex, 1);
//   result.splice(endIndex, 0, removed);
//   return result;
// };

const getItemStyle = (isDragging, draggableStyle) => ({
  border: "solid 2px green",
  margin: "2px",
  maxHeight: isDragging ? "30px" : "none",
  ...draggableStyle,
});

// const getItemStyle = (isDragging, draggableStyle) => ({
//   // some basic styles to make the items look a bit nicer
//   border: "solid 2px green",
//   userSelect: "none",
//   padding: 2 * 2,
//   margin: `0 0 2px 0`,
//   height: isDragging ? "200px" : "auto",
//   width: isDragging ? "50px" : "220px",

//   // change background colour if dragging
//   background: isDragging ? "lightgreen" : "grey",

//   // styles we need to apply on draggables
//   ...draggableStyle,
// });

const AppNest = () => {
  const [renderInfo, setRenderInfo] = useState(RENDER_INFO);
  const [groupFoldStatus, setGroupFoldStatus] = useState(GROUP_FOLD_INFO());
  const [dragId, setDragId] = useState(null);
  const dragStartY = useRef(null);
  const appRef = useRef(null);

  const onDragEnd = (result) => {
    console.log("@@@ result", result);
    setDragId(null);
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

  const onBeforeCapture = (beforeCapture) => {
    console.log("@@@ 5", beforeCapture.draggableId);
    // flushSync(() => {
    //   foldAllStatus();
    // });
    flushSync(() => {
      // foldAllStatus();
      setDragId(beforeCapture.draggableId);
    });
    // adjustY(beforeCapture.draggableId.slice(5));
  };

  const foldAllStatus = () => {
    const newFoldStatus = { ...groupFoldStatus };
    // 将所有分组状态设置为false
    Object.keys(newFoldStatus).forEach((key) => {
      newFoldStatus[key] = true;
    });
    flushSync(() => {
      setGroupFoldStatus(newFoldStatus);
    });
  };

  const onDragStart = (startItem) => {
    console.log("@@@ 3");
    // 如果拖拽的是分组
    if (startItem.draggableId.startsWith("group")) {
      // foldAllStatus();
      // adjustY();
    }
  };

  const resetFoldStatus = () => {
    const newFoldStatus = { ...groupFoldStatus };
    Object.keys(newFoldStatus).forEach((key) => {
      newFoldStatus[key] = false;
    });
    setGroupFoldStatus(newFoldStatus);
  };

  const adjustY = (_id) => {
    const dom = document.getElementById(_id);
    if (!dom) return;
    const { top } = dom.getBoundingClientRect();
    console.log("@@@ N", top, dragStartY.current);
    appRef.current.scrollTop = top - dragStartY.current;
    console.log("@@@ N+1", appRef.current.scrollTop);
  };

  const onBeforeDragStart = (startItem) => {
    console.log("@@@ 2");
    // 如果拖拽的是分组
    if (startItem.draggableId?.startsWith("group")) {
      // foldAllStatus();
      // console.log("@@@ draggableId", startItem.draggableId);
    }
  };
  console.log("@@@ 4");
  return (
    <div className="app">
      <div>
        <button
          onClick={() => {
            appRef.current.scrollTop = 0;
          }}
        >
          滚动回来
        </button>
        <button
          onClick={() => {
            resetFoldStatus();
          }}
        >
          全部展开
        </button>
      </div>
      <DragDropContext
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        onBeforeDragStart={onBeforeDragStart}
        onBeforeCapture={onBeforeCapture}
      >
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
              {renderInfo.map((item, index) => {
                return (
                  <>
                    {/* 分组标题 */}
                    <Draggable
                      key={"group" + String(item?.groupId)}
                      draggableId={"group" + String(item?.groupId)}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <>
                          <div
                            className="group-container"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={getItemStyle(
                              snapshot.isDragging ||
                                dragId === "group" + String(item?.groupId),
                              provided.draggableProps.style
                            )}
                          >
                            <div className="group-title" id={+item?.groupId}>
                              <div
                                {...provided.dragHandleProps}
                                onMouseDown={(e) => {
                                  console.log("@@@ 1", e.clientX, e.clientY);
                                  dragStartY.current = e.clientY;
                                  flushSync(() => {
                                    foldAllStatus();
                                  });
                                  // window.setTimeout(() => {
                                  //   adjustY(item?.groupId);
                                  // }, 0);
                                }}
                              >
                                <DragOutlined />
                              </div>
                              <DownOutlined
                                onClick={() => {
                                  const newFoldStatus = { ...groupFoldStatus };
                                  newFoldStatus[item.groupId] =
                                    !newFoldStatus[item.groupId];
                                  setGroupFoldStatus(newFoldStatus);
                                }}
                              />
                              <div className="name group-name">
                                {item.groupName}({item.goalCount})
                              </div>
                            </div>
                            {/* 所有子目标 */}
                            <div
                              className={
                                groupFoldStatus[item.groupId]
                                  ? "goals-fold"
                                  : "goals-expand"
                              }
                            >
                              <SubNest
                                childItems={item.childGoals}
                                id={item.groupId}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </Draggable>
                    {/* 所有子目标 */}
                    {/* <div
                      className={
                        groupFoldStatus[item.groupId]
                          ? "goals-fold"
                          : "goals-expand"
                      }
                    >
                      <SubNest childItems={item.childGoals} id={item.groupId} />
                    </div> */}
                  </>
                );
              })}
              {dragId ? <div className="fake">fake</div> : null}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* {dragId ? <div className="fake">fake</div> : null} */}
    </div>
  );
};

export default AppNest;

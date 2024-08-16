/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React, { useState, useRef, useMemo, flushSync } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { DragOutlined, DownOutlined } from "@ant-design/icons";
import { GROUP_INFO, GOALS_INFO } from "./mockData";
import "./AppGoal.css";

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
  ...draggableStyle,
});

const AppGoal = () => {
  const [renderInfo, setRenderInfo] = useState(RENDER_INFO);
  const [groupFoldStatus, setGroupFoldStatus] = useState(GROUP_FOLD_INFO());

  // 计算所有的分组和目标的index，用于dnd的拖拽
  const IndexArr = useMemo(() => {
    const newArr = [];
    renderInfo.forEach((item) => {
      const { groupId, childGoals } = item;
      newArr.push(String(groupId));
      childGoals.forEach((_item) => {
        const { goalSerialNumber } = _item;
        if (goalSerialNumber) {
          newArr.push(goalSerialNumber);
        }
      });
    });
    return newArr;
  }, [renderInfo]);

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

  const onDragStart = (startItem) => {
    // 如果拖拽的是分组
    if (startItem.draggableId.length === 4) {
      const newFoldStatus = { ...groupFoldStatus };
      // 将所有分组状态设置为false
      Object.keys(newFoldStatus).forEach((key) => {
        newFoldStatus[key] = true;
      });
      setGroupFoldStatus(newFoldStatus);
    }
  };

  const getInd = (_id) => {
    return IndexArr.indexOf(String(_id));
  };

  const resetFoldStatus = () => {
    const newFoldStatus = { ...groupFoldStatus };
    Object.keys(newFoldStatus).forEach((key) => {
      newFoldStatus[key] = false;
    });
    setGroupFoldStatus(newFoldStatus);
  };

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

      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
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
              {renderInfo.map((item) => {
                return (
                  <>
                    {/* 分组标题 */}
                    <Draggable
                      key={String(item?.groupId)}
                      draggableId={String(item?.groupId)}
                      index={getInd(item?.groupId)}
                    >
                      {(provided, snapshot) => (
                        <div
                          className="group-container"
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
                      )}
                    </Draggable>
                    {/* 所有子目标 */}
                    <div
                      className={
                        groupFoldStatus[item.groupId]
                          ? "goals-fold"
                          : "goals-expand"
                      }
                    >
                      {item.childGoals.map((item) => {
                        return (
                          <Draggable
                            key={item.goalSerialNumber}
                            draggableId={item.goalSerialNumber}
                            index={getInd(item.goalSerialNumber)}
                          >
                            {(provided, snapshot) => (
                              <div
                                className="goal-container"
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
                                <div className="name goal-name">
                                  {item.title}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                    </div>
                  </>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default AppGoal;

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React, { useState, useRef } from "react";
import { flushSync } from "react-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { DragOutlined, DownOutlined } from "@ant-design/icons";
import classNames from "classnames";
import { SubNest } from "./SubNest";
import { GROUP_INFO, GOALS_INFO } from "./mockData4";
import "./AppNest.css";

const deepClone = function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
};

// 拖拽时是否这的分组
const IS_FOLD_ALL = true;
// 是否调整滚动条
const IS_ADJUST = true;
// 是否多拖拽
const IS_MUILT_DRAG = false;
// 是否展示公告
const IS_SHOW_A_MENT = true;

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

const getItemStyle = (isDragging, draggableStyle) => ({
  border: "solid 2px green",
  margin: "2px",
  // maxHeight: isDragging ? "30px" : "none",
  ...draggableStyle,
});

const AppNest = () => {
  const [renderInfo, setRenderInfo] = useState(RENDER_INFO);
  const [groupFoldStatus, setGroupFoldStatus] = useState(GROUP_FOLD_INFO());
  const [dragId, setDragId] = useState(null);
  const [selectedItem, setSelectedItem] = useState([]);
  const mouseY = useRef(null);
  const fakeBottomRef = useRef(null);
  const fakeTopRef = useRef(null);
  const appRef = useRef(null);

  const setY = (_id) => {
    const dom = document.getElementById(_id);
    if (!dom) return;
    const { top: domY } = dom.getBoundingClientRect();
    if (Math.abs(mouseY.current - domY) < 30) return;
    if (mouseY.current > domY) {
      fakeTopRef.current = mouseY.current - domY;
    } else {
      fakeBottomRef.current = domY - mouseY.current;
    }
  };

  const adjustY = () => {
    if (fakeTopRef.current) {
      appRef.current.scrollTop = 0;
    }
    if (fakeBottomRef.current) {
      appRef.current.scrollTop = fakeBottomRef.current;
    }
  };

  const foldAllStatus = (_groupId) => {
    const newFoldStatus = { ...groupFoldStatus };
    if (IS_FOLD_ALL) {
      // 将所有分组状态设置为false
      Object.keys(newFoldStatus).forEach((key) => {
        newFoldStatus[key] = true;
      });
    } else {
      // 将选定分组状态设置为false
      newFoldStatus[_groupId] = true;
    }

    flushSync(() => {
      setGroupFoldStatus(newFoldStatus);
    });
  };

  const resetFoldStatus = () => {
    const newFoldStatus = { ...groupFoldStatus };
    Object.keys(newFoldStatus).forEach((key) => {
      newFoldStatus[key] = false;
    });
    setGroupFoldStatus(newFoldStatus);
  };

  const onBeforeCapture = (beforeCapture) => {
    // ① 折叠分组
    flushSync(() => {
      if (beforeCapture.draggableId.startsWith("group")) {
        foldAllStatus(beforeCapture.draggableId.slice(5));
        // !!! 关键步骤，需将原有滚动位置重置，再进行后续计算
        appRef.current.scrollTop = 0;
      }
    });
    // ② 此时折叠分组已生效，可以拿到折叠后鼠标位置和折叠的分组位置
    flushSync(() => {
      if (beforeCapture.draggableId.startsWith("group")) {
        setY(beforeCapture.draggableId.slice(5));
      }
    });
    // ③ 标记dragId，触发渲染
    flushSync(() => {
      // foldAllStatus();
      setDragId(beforeCapture.draggableId);
    });
    // ④ 调整滚动条
    if (beforeCapture.draggableId.startsWith("group")) {
      adjustY(beforeCapture.draggableId.slice(5));
    }
  };

  const onBeforeDragStart = (startItem) => {
    // 如果拖拽的是分组
    if (startItem.draggableId?.startsWith("group")) {
      // foldAllStatus();
    }
  };

  const onDragStart = (startItem) => {
    // 如果拖拽的是分组
    if (startItem.draggableId.startsWith("group")) {
      // foldAllStatus();
      // adjustY();
    }
  };

  const onDragEnd = (result) => {
    fakeBottomRef.current = 0;
    fakeTopRef.current = 0;
    setDragId(null);

    if (!result.destination) {
      return;
    }

    // 如果是分组位置拖拽排序，进行整体排序
    if (result.draggableId.startsWith("group")) {
      const newRenderInfo = [...renderInfo];
      const [removed] = newRenderInfo.splice(result.source.index, 1);
      newRenderInfo.splice(result.destination.index, 0, removed);
      setRenderInfo(newRenderInfo);
      return;
    }

    // 如果是子目标位置拖拽排序，并且是单个目标
    if (
      result.draggableId.startsWith("sub") &&
      (!selectedItem?.length || selectedItem?.length === 1)
    ) {
      const newRenderInfo = [...renderInfo];
      const sourceGroupIndex = newRenderInfo.findIndex(
        (item) => String(item.groupId) === result.source.droppableId.slice(3)
      );
      const targetGroupIndex = newRenderInfo.findIndex(
        (item) =>
          String(item.groupId) === result.destination.droppableId.slice(3)
      );
      // 找到目标分组和源分组
      const targetGroup = newRenderInfo[targetGroupIndex];
      const sourceGroup = newRenderInfo[sourceGroupIndex];
      // 从源分组中删除目标
      const [removed] = sourceGroup.childGoals.splice(result.source.index, 1);
      // 将目标插入到目标分组
      targetGroup.childGoals.splice(result.destination.index, 0, removed);
      setRenderInfo(newRenderInfo);
      return;
    }

    // 如果是子目标位置拖拽排序，并且是多个目标
    if (result.draggableId.startsWith("sub") && selectedItem?.length > 1) {
      const newRenderInfo = [...renderInfo];
      // 首先将选中的目标排序，根据groupIndex和goalIndex
      const newSelected = [...selectedItem];
      newSelected.sort((a, b) => {
        return a.groupIndex - b.groupIndex || a.goalIndex - b.goalIndex;
      });
      // 按照newSelected顺序，提取出所有的goalItem，组成数组
      const newSourceGoalItems = [];
      newSelected.forEach((item) => {
        newSourceGoalItems.push(item.goalItem);
      });

      // 先把正在拖拽的单个目标从源分组中删除， 否则在后续追加fake时会导致位置计算有问题
      const sourceGroupIndex = newRenderInfo.findIndex(
        (item) => String(item.groupId) === result.source.droppableId.slice(3)
      );
      const sourceGroup = newRenderInfo[sourceGroupIndex];
      sourceGroup.childGoals.splice(result.source.index, 1);

      // 找到drop的目标分组
      const targetGroupIndex = newRenderInfo.findIndex(
        (item) =>
          String(item.groupId) === result.destination.droppableId.slice(3)
      );
      // 再目标分组的目标位置后追加一条fake的数据，用于占位，{goalSerialNumber: "fake"}
      const targetGroup = newRenderInfo[targetGroupIndex];
      targetGroup.childGoals.splice(result.destination.index, 0, {
        goalSerialNumber: "fake",
      });

      // 从原来的分组中删除所有选中的目标
      newSelected.forEach((item) => {
        const sourceGroupIndex = newRenderInfo.findIndex(
          (_item) => _item.groupId === item.groupId
        );
        const sourceGroup = newRenderInfo[sourceGroupIndex];
        const _index = sourceGroup.childGoals.findIndex(
          (_item) => _item.goalSerialNumber === item.goalSerialNumber
        );
        if (_index >= 0) {
          sourceGroup.childGoals.splice(_index, 1);
        }
      });

      // 找到之前标记的fake数据
      const fakeIndex = targetGroup.childGoals.findIndex(
        (item) => item.goalSerialNumber === "fake"
      );
      // 在该位置后面插入所有选中的目标，并删除fake数据
      targetGroup.childGoals.splice(fakeIndex, 1, ...newSourceGoalItems);
      // 更新数据
      setRenderInfo(newRenderInfo);
      // 清空选中
      setSelectedItem([]);
    }
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
              // style={{ maxHeight: dragId ? "400px" : "none" }}
            >
              {IS_SHOW_A_MENT && <div className="a-ment">公告</div>}
              {/* 使用fakeTop占位 */}
              {dragId?.startsWith("group") && IS_ADJUST ? (
                <div
                  className="fake-top"
                  style={{ height: fakeTopRef.current || 0 }}
                ></div>
              ) : null}
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
                            className={classNames("group-container")}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={getItemStyle(
                              snapshot.isDragging,
                              // dragId === "group" + String(item?.groupId),
                              provided.draggableProps.style
                            )}
                          >
                            <div className="group-title" id={+item?.groupId}>
                              <div
                                {...provided.dragHandleProps}
                                onMouseDown={(e) => {
                                  mouseY.current = e.clientY;
                                  flushSync(() => {
                                    // foldAllStatus();
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
                            {groupFoldStatus[item.groupId] ? null : (
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
                                  selectedItem={selectedItem}
                                  setSelectedItem={setSelectedItem}
                                  dragId={dragId}
                                  groupIndex={index}
                                />
                              </div>
                            )}
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
              {/* 使用fakeBottom占位 */}
              {dragId?.startsWith("group") && IS_ADJUST ? (
                <div className="fake-bottom" style={{ height: "100vh" }}></div>
              ) : null}
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

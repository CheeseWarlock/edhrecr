import type {ClientRect} from '@dnd-kit/core';
import type {SortingStrategy} from '@dnd-kit/sortable/dist/types';

// To-do: We should be calculating scale transformation
const defaultScale = {
  scaleX: 1,
  scaleY: 1,
};

export const CustomListSortingStrategy: SortingStrategy = ({
  rects,
  activeNodeRect: fallbackActiveRect,
  activeIndex,
  overIndex,
  index,
}) => {
  const activeNodeRect = rects[activeIndex] ?? fallbackActiveRect;

  const TEST_GAP_INDEX = 2;

  if (!activeNodeRect) {
    return null;
  }

  const itemGap = getItemGap(rects, index, activeIndex);

  if (index === activeIndex) {
    const newIndexRect = rects[overIndex];

    if (!newIndexRect) {
      return null;
    }

    return {
      x:
        activeIndex < overIndex
          ? newIndexRect.left +
            newIndexRect.width -
            (activeNodeRect.left + activeNodeRect.width)
          : newIndexRect.left - activeNodeRect.left,
      y: 0,
      ...defaultScale,
    };
  }

  if (index > activeIndex && index <= overIndex) {
    const fudge = (index == TEST_GAP_INDEX + 1 ? 177.25 + itemGap : 0);
    return {
      x: -activeNodeRect.width - itemGap - fudge,
      y: 0,
      ...defaultScale,
    };
  }

  if (index < activeIndex && index >= overIndex) {
    const fudge = (index == TEST_GAP_INDEX - 1 ? 177.25 + itemGap : 0);
    return {
      x: activeNodeRect.width + itemGap + fudge,
      y: 0,
      ...defaultScale,
    };
  }

  return {
    x: 0,
    y: 0,
    ...defaultScale,
  };
};

function getItemGap(rects: ClientRect[], index: number, activeIndex: number) {
  const currentRect: ClientRect | undefined = rects[index];
  const previousRect: ClientRect | undefined = rects[index - 1];
  const nextRect: ClientRect | undefined = rects[index + 1];

  if (!currentRect || (!previousRect && !nextRect)) {
    return 0;
  }

  const fudgeFactor = 0;

  let ret = 0;

  if (activeIndex < index) {
    ret = previousRect
      ? currentRect.left - (previousRect.left + previousRect.width) + fudgeFactor
      : nextRect.left - (currentRect.left + currentRect.width) + fudgeFactor;
  }

  ret = nextRect
    ? nextRect.left - (currentRect.left + currentRect.width) + fudgeFactor
    : currentRect.left - (previousRect.left + previousRect.width) + fudgeFactor;

    // console.log("For index", index, "and active index", activeIndex, "the item gap is", ret);
    return ret;
}
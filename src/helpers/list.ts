// TODO: find better name
export const getFilteredIndexesMap = <T>(
  data: T[],
  selectedDataIndex: number,
  filterFn: (data: T) => boolean
): [number[], number] =>
  data.reduce(
    (accum, dataItem, index) => {
      if (!filterFn(dataItem)) return accum;

      const [indexMap, selectedOptionIndex] = accum;
      return [[...indexMap, index], selectedDataIndex === index ? indexMap.length : selectedOptionIndex];
    },
    [[], -1] as [number[], number]
  );

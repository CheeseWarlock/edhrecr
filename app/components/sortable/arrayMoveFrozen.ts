/**
 * Move an array item to a different position. Returns a new array with the item moved to the new position.
 */
export function arrayMoveFrozen<T>(array: T[], from: number, to: number, frozen?: number): T[] {
    const newArray = array.slice();
    const _to = (frozen != null && to > frozen ? to - 1 : to);
    const _from = (frozen != null && from > frozen ? from - 1 : from);
    const removedItems = [];
    if (frozen != null) {
        removedItems.push(newArray.splice(frozen, 1)[0]);
    }

    newArray.splice(
        _to < 0 ? newArray.length + _to : _to,
        0,
        newArray.splice(_from, 1)[0]
    );

    if (frozen != null) {
        newArray.splice(
            frozen,
            0,
            ...removedItems
        );
    }
    return newArray;
}
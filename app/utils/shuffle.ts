export function shuffle<T>(array: T[]): T[] {
    let i = array.length;

    while (--i > 0) {
        const target = Math.floor(Math.random() * (i + 1));
        [array[i], array[target]] = [array[target], array[i]];
    }

    return array;
}
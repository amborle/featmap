const alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
const minChar = alphabet[0]
const maxChar = alphabet[alphabet.length - 1]


const Rank = (prev: string, next: string): { rank: string, rebalance: boolean } => {
    if (prev === "") {
        prev = minChar
    }

    if (next === "") {
        next = maxChar
    }

    let rank = ""
    let i = 0

    while (true) {
        let prevChar = getChar(prev, i, minChar)
        let nextChar = getChar(next, i, maxChar)

        if (prevChar === nextChar) {
            rank += prevChar
            i++
            continue
        }

        let midChar = mid(prevChar, nextChar)

        if (midChar === prevChar || midChar === nextChar) {
            rank += prevChar
            i++
            continue
        }

        rank += midChar
        break
    }

    if (rank >= next) {
        return { rank: prev, rebalance: true }

    }

    return { rank: rank, rebalance: false }
}

const mid = (prev: string, next: string): string => {

    let prevIndex = alphabet.findIndex(x => x === prev)
    let nextIndex = alphabet.findIndex(x => x === next)

    return alphabet[Math.floor((prevIndex + nextIndex) / 2)]
}


const getChar = (s: string, i: number, defaultChar: string): string => {
    if (i >= s.length) {
        return defaultChar
    }
    return s[i]
}

export { Rank }
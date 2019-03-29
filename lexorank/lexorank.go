package lexorank

const (
	minChar = byte('a')
	maxChar = byte('z')
)

// Rank returns a new rank string between prev and next.
// ok=false if it needs to be reshuffled. e.g. same or adjacent prev, next values.
func Rank(prev, next string) (string, bool) {
	if prev == "" {
		prev = string(minChar)
	}
	if next == "" {
		next = string(maxChar)
	}

	rank := ""
	i := 0

	for {
		prevChar := getChar(prev, i, minChar)
		nextChar := getChar(next, i, maxChar)

		if prevChar == nextChar {
			rank += string(prevChar)
			i++
			continue
		}

		midChar := mid(prevChar, nextChar)
		if midChar == prevChar || midChar == nextChar {
			rank += string(prevChar)
			i++
			continue
		}

		rank += string(midChar)
		break
	}

	if rank >= next {
		return prev, false
	}

	return rank, true
}

func mid(prev, next byte) byte {
	return (prev + next) / 2
}

func getChar(s string, i int, defaultChar byte) byte {
	if i >= len(s) {
		return defaultChar
	}
	return s[i]
}

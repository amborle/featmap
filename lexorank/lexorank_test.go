package lexorank

import (
	"testing"
)

func TestSimple(t *testing.T) {
	got, _ := Rank("a", "b")
	if got != "am" {
		t.Error() // to indicate test failed
	}
}

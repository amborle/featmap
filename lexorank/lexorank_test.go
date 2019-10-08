package lexorank

import (
	"testing"
)

func TestSimple(t *testing.T) {
	got, _ := Rank("a", "b")
	if got != "am_test" {
		t.Error() // to indicate test failed
	}
}

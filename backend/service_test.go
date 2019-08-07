package main

import (
	"testing"
)

func TestWelcomeBody(t *testing.T) {
	w := welcome{"http://localhost:3000/", "test@test.test", "test", "key"}

	body, err := WelcomeBody(w)
	println(body)
	if err != nil {
		t.Failed()
	}
}

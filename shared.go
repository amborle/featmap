package main

import "time"

func subHasExpired(s *Subscription) bool {
	b := s.ExpirationDate.Before(time.Now().UTC())
	return b
}

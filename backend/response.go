package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/render"
)

// Response ...
type Response struct {
	Status  string                 ` json:"status"`
	Message string                 ` json:"message"`
	Data    map[string]interface{} ` json:"data"`
}

// NewSuccess creates a blag successful response

// NewSuccessWithData creates a blag successful response with data

// NewFail creates a blag response with status = fail

// NewFailWithMessage creates a blag response with status = fail and a message

// NewBad ...

// NewInvalid ...

// NewError creates a blag respone  with status = error

// NewResponse ...

// AddMessage adds a message to the response
func (r *Response) AddMessage(message string) {
	r.Message = message
}

// AddData adds data to the response
func (r *Response) AddData(key string, data interface{}) {
	r.Data[key] = data
}

// JSON generates a JSON formatted response
func (r *Response) JSON() []byte {
	res, err := json.Marshal(r)
	if err != nil {
		log.Fatalln(err)
	}

	return res
}

// ErrInvalidRequest ...
func ErrInvalidRequest(err error) render.Renderer {
	return &ErrResponse{
		Err:            err,
		HTTPStatusCode: 400,
		StatusText:     "",
		ErrorText:      err.Error(),
	}
}

// ErrInternal ...

// ErrResponse ...
type ErrResponse struct {
	Err            error `json:"-"` // low-level runtime error
	HTTPStatusCode int   `json:"-"` // http response status code

	StatusText string `json:"status,omitempty"`  // user-level status message
	AppCode    int64  `json:"code,omitempty"`    // application-specific error code
	ErrorText  string `json:"message,omitempty"` // application-level error message, for debugging
}

// Render ...
func (e *ErrResponse) Render(w http.ResponseWriter, r *http.Request) error {
	render.Status(r, e.HTTPStatusCode)
	return nil
}

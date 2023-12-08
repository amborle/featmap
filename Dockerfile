FROM node:14-alpine as node-build
COPY ./webapp/ /src/webapp
WORKDIR /src/webapp
RUN npm ci && \
    npm run build

FROM golang:1.18-alpine as go-build
WORKDIR /src

COPY . .
COPY --from=node-build /src/webapp/build /src/webapp/build

RUN go install github.com/go-bindata/go-bindata/...
RUN cd ./migrations && \
    go-bindata  -pkg migrations .
RUN go-bindata  -pkg tmpl -o ./tmpl/bindata.go  ./tmpl/ && \
    go-bindata  -pkg webapp -o ./webapp/bindata.go  ./webapp/build/...    

RUN go build -o ./build/featmap && \
    chmod 755 ./build/featmap

FROM alpine
COPY --from=go-build /src/build/featmap /opt/featmap/featmap
WORKDIR /opt/featmap
CMD /opt/featmap/featmap

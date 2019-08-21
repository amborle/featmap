FROM golang:alpine
RUN apk add --update npm git
RUN go get -u github.com/jteeuwen/go-bindata/...
ENV PATH="/home/node/.npm-global/bin:${PATH}"
RUN mkdir -p /opt/build && \
    mkdir -p /opt/featmap
COPY . /opt/build
RUN cd /opt/build/webapp && \
    npm install && \
    npm run build
RUN cd /opt/build/migrations && \
    go-bindata -pkg migrations . && \
    cd /opt/build/migrations && \
    go-bindata  -pkg tmpl -o ./tmpl/bindata.go  ./tmpl/ && \
    go-bindata  -pkg webapp -o ./webapp/bindata.go  ./webapp/build/...    

RUN cd /opt/build && \
    go build -o /opt/featmap/featmap && \
    chmod 775 /opt/featmap/featmap

ENTRYPOINT cd /opt/featmap && ./featmap

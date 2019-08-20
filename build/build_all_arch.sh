scriptDir=$(dirname -- "$(readlink -f -- "$BASH_SOURCE")")
cd "$scriptDir"
cd ..

VERSION=1.0.3

export GO111MODULE=on

export GOOS=darwin
export GOARCH=amd64 
go build -o featmap-$VERSION-darwin-amd64

export GOOS=windows
export GOARCH=amd64
go build -o featmap-$VERSION-windows-amd64.exe

export GOOS=linux
export GOARCH=amd64
go build -o featmap-$VERSION-linux-amd64

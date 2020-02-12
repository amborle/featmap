scriptDir=$(dirname -- "$(readlink -f -- "$BASH_SOURCE")")
cd "$scriptDir"
cd ..

export GO111MODULE=on

export GOOS=darwin
export GOARCH=amd64 
go build -o bin/featmap-$VERSION-darwin-amd64

export GOOS=windows
export GOARCH=amd64
go build -o bin/featmap-$VERSION-windows-amd64.exe

export GOOS=linux
export GOARCH=amd64
go build -o bin/featmap-$VERSION-linux-amd64

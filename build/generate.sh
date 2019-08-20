scriptDir=$(dirname -- "$(readlink -f -- "$BASH_SOURCE")")
cd "$scriptDir"
cd ..

cd migrations && go-bindata -pkg migrations . && cd ..

go-bindata  -pkg tmpl -o ./tmpl/bindata.go  ./tmpl/
go-bindata  -pkg webapp -o ./webapp/bindata.go  ./webapp/build/...
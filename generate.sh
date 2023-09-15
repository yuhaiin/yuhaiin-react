# ts_plugin=./node_modules/.bin/protoc-gen-ts_proto
output=./app/docs/protos
# proto_opt="esModuleInterop=true,env=browser,snakeToCamel=false,outputClientImpl=false,outputServices=false,oneof=unions"
proto_dir="${HOME}/Documents/Programming/yuhaiin/pkg/protos"
# protoc --plugin=${ts_plugin} --ts_proto_out=${output} --ts_proto_opt=${proto_opt} --proto_path=${proto_dir} ${proto_dir}/config/config.proto
# protoc --plugin=${ts_plugin} --ts_proto_out=${output} --ts_proto_opt=${proto_opt} --proto_path=${proto_dir} ${proto_dir}/node/node.proto
# protoc --plugin=${ts_plugin} --ts_proto_out=${output} --ts_proto_opt=${proto_opt} --proto_path=${proto_dir} ${proto_dir}/node/grpc/node.proto
# protoc --plugin=${ts_plugin} --ts_proto_out=${output} --ts_proto_opt=${proto_opt} --proto_path=${proto_dir} ${proto_dir}/node/latency/latency.proto
# protoc --plugin=${ts_plugin} --ts_proto_out=${output} --ts_proto_opt=${proto_opt} --proto_path=${proto_dir} ${proto_dir}/statistic/config.proto
# protoc --plugin=${ts_plugin} --ts_proto_out=${output} --ts_proto_opt=${proto_opt} --proto_path=${proto_dir} ${proto_dir}/statistic/grpc/config.proto

npx pbjs -t static-module --no-typeurl --keep-case --no-verify --no-delimited --no-beautify --no-service --null-defaults false --es6 -w es6 -p ${proto_dir} -o ./app/docs/pbts/proto.js \
    ${proto_dir}/config/config.proto \
    ${proto_dir}/node/node.proto \
    ${proto_dir}/node/grpc/node.proto \
    ${proto_dir}/node/latency/latency.proto \
    ${proto_dir}/statistic/config.proto \
    ${proto_dir}/statistic/grpc/config.proto
npx pbts -o ./app/docs/pbts/proto.d.ts ./app/docs/pbts/proto.js

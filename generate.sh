ts_plugin=./node_modules/.bin/protoc-gen-ts_proto
output=./src/protos
proto_opt="esModuleInterop=true,env=browser,snakeToCamel=false,outputClientImpl=false,outputServices=false,oneof=unions"
proto_dir="${HOME}/Documents/Programming/yuhaiin/pkg/protos"
protoc --plugin=${ts_plugin} --ts_proto_out=${output} --ts_proto_opt=${proto_opt} --proto_path=${proto_dir} ${proto_dir}/config/config.proto
protoc --plugin=${ts_plugin} --ts_proto_out=${output} --ts_proto_opt=${proto_opt} --proto_path=${proto_dir} ${proto_dir}/node/node.proto
protoc --plugin=${ts_plugin} --ts_proto_out=${output} --ts_proto_opt=${proto_opt} --proto_path=${proto_dir} ${proto_dir}/node/grpc/node.proto
protoc --plugin=${ts_plugin} --ts_proto_out=${output} --ts_proto_opt=${proto_opt} --proto_path=${proto_dir} ${proto_dir}/statistic/config.proto
protoc --plugin=${ts_plugin} --ts_proto_out=${output} --ts_proto_opt=${proto_opt} --proto_path=${proto_dir} ${proto_dir}/statistic/grpc/config.proto
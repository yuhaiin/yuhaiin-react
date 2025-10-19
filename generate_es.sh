#!/bin/bash

PROTO_PATH=../yuhaiin/pkg/idl
OUTPUT_PATH=./app/docs/pbes


protoc -I ${PROTO_PATH} --plugin ./node_modules/.bin/protoc-gen-es --es_out ${OUTPUT_PATH} --es_opt target=ts,js_import_style=legacy_commonjs ${PROTO_PATH}/node/node.proto
protoc -I ${PROTO_PATH} --plugin ./node_modules/.bin/protoc-gen-es --es_out ${OUTPUT_PATH} --es_opt target=ts,js_import_style=legacy_commonjs ${PROTO_PATH}/node/protocol.proto
protoc -I ${PROTO_PATH} --plugin ./node_modules/.bin/protoc-gen-es --es_out ${OUTPUT_PATH} --es_opt target=ts,js_import_style=legacy_commonjs ${PROTO_PATH}/node/subscribe.proto
protoc -I ${PROTO_PATH} --plugin ./node_modules/.bin/protoc-gen-es --es_out ${OUTPUT_PATH} --es_opt target=ts,js_import_style=legacy_commonjs ${PROTO_PATH}/node/point.proto
protoc -I ${PROTO_PATH} --plugin ./node_modules/.bin/protoc-gen-es --es_out ${OUTPUT_PATH} --es_opt target=ts,js_import_style=legacy_commonjs ${PROTO_PATH}/node/latency.proto
protoc -I ${PROTO_PATH} --plugin ./node_modules/.bin/protoc-gen-es --es_out ${OUTPUT_PATH} --es_opt target=ts,js_import_style=legacy_commonjs ${PROTO_PATH}/node/tag.proto
# protoc -I ${PROTO_PATH} --plugin ./node_modules/.bin/protoc-gen-es --es_out ${OUTPUT_PATH} --es_opt target=ts,js_import_style=legacy_commonjs ${PROTO_PATH}/node/grpc/node.proto

# //go:generate protoc --go_out=. --go_opt=paths=source_relative --go-grpc_out=. --go-grpc_opt=paths=source_relative node/grpc/node.proto

# // statistic

protoc -I ${PROTO_PATH} --plugin ./node_modules/.bin/protoc-gen-es --es_out ${OUTPUT_PATH} --es_opt target=ts,js_import_style=legacy_commonjs ${PROTO_PATH}/statistic/config.proto
# protoc -I ${PROTO_PATH} --plugin ./node_modules/.bin/protoc-gen-es --es_out ${OUTPUT_PATH} --es_opt target=ts,js_import_style=legacy_commonjs ${PROTO_PATH}/statistic/grpc/config.proto

# //go:generate protoc --go_out=. --go_opt=paths=source_relative --go-grpc_out=. --go-grpc_opt=paths=source_relative statistic/grpc/config.proto

# // config

protoc -I ${PROTO_PATH} --plugin ./node_modules/.bin/protoc-gen-es --es_out ${OUTPUT_PATH} --es_opt target=ts ${PROTO_PATH}/config/config.proto
# protoc -I ${PROTO_PATH} --plugin ./node_modules/.bin/protoc-gen-es --es_out ${OUTPUT_PATH} --es_opt target=ts ${PROTO_PATH}/config/grpc/config.proto
protoc -I ${PROTO_PATH} --plugin ./node_modules/.bin/protoc-gen-es --es_out ${OUTPUT_PATH} --es_opt target=ts ${PROTO_PATH}/config/log.proto
protoc -I ${PROTO_PATH} --plugin ./node_modules/.bin/protoc-gen-es --es_out ${OUTPUT_PATH} --es_opt target=ts ${PROTO_PATH}/config/bypass.proto
protoc -I ${PROTO_PATH} --plugin ./node_modules/.bin/protoc-gen-es --es_out ${OUTPUT_PATH} --es_opt target=ts ${PROTO_PATH}/config/dns.proto
protoc -I ${PROTO_PATH} --plugin ./node_modules/.bin/protoc-gen-es --es_out ${OUTPUT_PATH} --es_opt target=ts ${PROTO_PATH}/config/inbound.proto

# //go:generate protoc --go-grpc_out=. --go-grpc_opt=paths=source_relative config/grpc/config.proto


# // tools

protoc -I ${PROTO_PATH} --plugin ./node_modules/.bin/protoc-gen-es --es_out ${OUTPUT_PATH} --es_opt target=ts ${PROTO_PATH}/tools/tools.proto

protoc -I ${PROTO_PATH} --plugin ./node_modules/.bin/protoc-gen-es --es_out ${OUTPUT_PATH} --es_opt target=ts ${PROTO_PATH}/google/protobuf/go_features.proto

# backup

protoc -I ${PROTO_PATH} --plugin ./node_modules/.bin/protoc-gen-es --es_out ${OUTPUT_PATH} --es_opt target=ts ${PROTO_PATH}/backup/backup.proto


# api

protoc -I ${PROTO_PATH} --plugin ./node_modules/.bin/protoc-gen-es --es_out ${OUTPUT_PATH} --es_opt target=ts ${PROTO_PATH}/api/tools.proto
protoc -I ${PROTO_PATH} --plugin ./node_modules/.bin/protoc-gen-es --es_out ${OUTPUT_PATH} --es_opt target=ts ${PROTO_PATH}/api/node.proto
protoc -I ${PROTO_PATH} --plugin ./node_modules/.bin/protoc-gen-es --es_out ${OUTPUT_PATH} --es_opt target=ts ${PROTO_PATH}/api/statistic.proto
protoc -I ${PROTO_PATH} --plugin ./node_modules/.bin/protoc-gen-es --es_out ${OUTPUT_PATH} --es_opt target=ts ${PROTO_PATH}/api/config.proto
protoc -I ${PROTO_PATH} --plugin ./node_modules/.bin/protoc-gen-es --es_out ${OUTPUT_PATH} --es_opt target=ts ${PROTO_PATH}/api/backup.proto

# ------------------------------

# protoc -I ${PROTO_PATH} --js_out=import_style=commonjs,binary:./app/proto-js ${PROTO_PATH}/node/node.proto
# protoc -I ${PROTO_PATH} --js_out=import_style=commonjs,binary:./app/proto-js ${PROTO_PATH}/node/protocol/protocol.proto
# protoc -I ${PROTO_PATH} --js_out=import_style=commonjs,binary:./app/proto-js ${PROTO_PATH}/node/subscribe/subscribe.proto
# protoc -I ${PROTO_PATH} --js_out=import_style=commonjs,binary:./app/proto-js ${PROTO_PATH}/node/point/point.proto
# protoc -I ${PROTO_PATH} --js_out=import_style=commonjs,binary:./app/proto-js ${PROTO_PATH}/node/latency/latency.proto
# protoc -I ${PROTO_PATH} --js_out=import_style=commonjs,binary:./app/proto-js ${PROTO_PATH}/node/tag/tag.proto
# protoc -I ${PROTO_PATH} --js_out=import_style=commonjs,binary:./app/proto-js ${PROTO_PATH}/node/grpc/node.proto

# # statistic

# protoc -I ${PROTO_PATH} --js_out=import_style=commonjs,binary:./app/proto-js ${PROTO_PATH}/statistic/config.proto
# protoc -I ${PROTO_PATH} --js_out=import_style=commonjs,binary:./app/proto-js ${PROTO_PATH}/statistic/grpc/config.proto


# # config

# protoc -I ${PROTO_PATH} --js_out=import_style=commonjs,binary:./app/proto-js ${PROTO_PATH}/config/config.proto
# protoc -I ${PROTO_PATH} --js_out=import_style=commonjs,binary:./app/proto-js ${PROTO_PATH}/config/grpc/config.proto
# protoc -I ${PROTO_PATH} --js_out=import_style=commonjs,binary:./app/proto-js ${PROTO_PATH}/config/log.proto
# protoc -I ${PROTO_PATH} --js_out=import_style=commonjs,binary:./app/proto-js ${PROTO_PATH}/config/bypass/bypass.proto
# protoc -I ${PROTO_PATH} --js_out=import_style=commonjs,binary:./app/proto-js ${PROTO_PATH}/config/dns/dns.proto
# protoc -I ${PROTO_PATH} --js_out=import_style=commonjs,binary:./app/proto-js ${PROTO_PATH}/config/listener/listener.proto

# # tools

# protoc -I ${PROTO_PATH} --js_out=import_style=commonjs,binary:./app/proto-js ${PROTO_PATH}/tools/tools.proto

# protoc -I ${PROTO_PATH} --js_out=import_style=commonjs,binary:./app/proto-js ${PROTO_PATH}/google/protobuf/go_features.proto

# # backup

# protoc -I ${PROTO_PATH} --js_out=import_style=commonjs,binary:./app/proto-js ${PROTO_PATH}/backup/backup.proto

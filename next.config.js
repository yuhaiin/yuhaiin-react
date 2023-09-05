// const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
    output: 'export',
    compress: true,
    transpilePackages: ['react-bootstrap'],
    // webpack: function (config) {
    //     config.plugins.push(new CompressionPlugin({
    //         // deleteOriginalAssets: true,
    //         // filename: "gzip/[file]"
    //     }));

    //     return config;
    // }
}
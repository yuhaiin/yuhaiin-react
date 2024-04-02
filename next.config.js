module.exports = {
    output: 'export',
    compress: true,
    trailingSlash: true,
    transpilePackages: ['react-bootstrap'],
    webpack: (config, options) => {
        config.module.rules.push({
            resolve: {
                extensionAlias: {
                    '.js': ['.ts', '.js'],
                },
            }
        })
        return config
    }
}
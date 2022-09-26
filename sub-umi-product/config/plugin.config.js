const {
    NODE_ENV
} = process.env;

function getPackageNameFromArr(packagesName, moduleName) {
    return moduleName ? packagesName.some(name => moduleName.includes(name)) : false;
}
export default config => {
    if (NODE_ENV === 'production') {
        config.merge({
            optimization: {
                minimize: true,
                splitChunks: {
                    cacheGroups: {
                        app: {
                            name: 'app',
                            test({ resource }) {
                                return getPackageNameFromArr(['react', 'react-dom', 'react-error-overlay', 'core-js', 'moment'], resource)
                            },
                            chunks: 'all',
                            minSize: 10,
                            minChunks: 1,
                            priority: 10,
                        }
                    },
                },
            }
        });
    }
}
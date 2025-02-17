const {join} = require('path')
const withPlugins = require('next-compose-plugins')
const mdx = require('@zeit/next-mdx')
const getPageMap = require('next-page-map')

const pageExtensions = ['js', 'jsx', 'md', 'mdx']
const pageMap = getPageMap(join(__dirname, 'pages'), pageExtensions)

const assetPrefix = process.env.NOW_URL

module.exports = withPlugins([mdx({extension: /\.mdx?$/})], {
  /*
   * Note: Prefixing assets with the fully qualified deployment URL
   * makes them available even when the site is served from a path alias, as in
   * <https://primer.style/components>
   */
  assetPrefix: process.env.NOW_URL,
  pageExtensions,
  publicRuntimeConfig: {
    assetPrefix,
    pageMap
  },

  webpack(config, {dev}) {
    config.module.rules.push({
      test: /\.svg$/,
      use: {loader: '@svgr/webpack'}
    })

    config.module.rules.push({
      test: /\.css$/,
      use: {loader: 'raw-loader'}
    })

    config.resolve.alias = {
      [__dirname + '$']: join(__dirname, 'src/index.js'),
      [join(__dirname, 'css$')]: join(__dirname, 'src/css.js')
    }

    const {optimization} = config
    if (optimization && Array.isArray(optimization.minimizer)) {
      const terserPlugin = optimization.minimizer[0]
      /* eslint-disable camelcase, no-console */
      console.warn('*** disabling mangling in Terser plugin ***')
      terserPlugin.options.terserOptions = {
        keep_fnames: true
      }
      /* eslint-enable camelcase, no-console */
    }
    return config
  }
})

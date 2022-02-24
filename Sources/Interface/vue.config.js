module.exports = {
  publicPath: '',
  lintOnSave: true,
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "@/assets/styles/variables.scss";`
      }
    }
  }
}

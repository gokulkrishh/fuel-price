export default function (config, env, helpers) {
  if (env.production) {
    config.devtool = ""; // disabling sourcemaps for production
    // var SWPlugin = helpers.getPluginsByName(config, "SWPrecacheWebpackPlugin");
    // SWPlugin[0].plugin.options.minify = false;
  }
}

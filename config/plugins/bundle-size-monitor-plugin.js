// BundleSizeMonitorPlugin.js
class BundleSizeMonitorPlugin {
  apply(compiler) {
    compiler.hooks.done.tap('BundleSizeMonitorPlugin', (stats) => {
      // 获取所有产物
      const assets = stats.compilation.assets;
      const limit = 500 * 1024; // 限制 500KB

      Object.entries(assets).forEach(([filename, source]) => {
        if (filename.endsWith('.js') && source.size() > limit) {
          console.warn(`\n⚠️  警告: ${filename} 太大了! 当前大小 ${(source.size() / 1024).toFixed(2)}KB (限制 500KB)`);
        } else {
            console.log(`✅ ${filename} 大小合适: ${(source.size() / 1024).toFixed(2)}KB`);
        }
      });
    });
  }
}

module.exports = BundleSizeMonitorPlugin;
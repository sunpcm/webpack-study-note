class BuildTimePlugin {
  apply(compiler) {
    let startTime;

    // 用一个通用方法处理
    const onBuildStart = (name) => {
      startTime = Date.now();
      console.log(`\n🚀 ${name} 开始构建...`);
    };

    const onBuildEnd = () => {
      const duration = (Date.now() - startTime) / 1000;
      const emoji = duration > 5 ? '⚠️' : '✅';
      console.log(`${emoji} 构建完成: ${duration.toFixed(2)}s`);
    };

    compiler.hooks.run.tapAsync('BuildTimePlugin', (compiler, callback) => {
      onBuildStart('[Build]');
      callback();
    });

    compiler.hooks.watchRun.tapAsync('BuildTimePlugin', (compiler, callback) => {
      onBuildStart('[Watch]');
      callback();
    });

    compiler.hooks.done.tap('BuildTimePlugin', onBuildEnd);
  }
}

module.exports = BuildTimePlugin;
let userConfig = undefined;

// 尝试加载用户配置，如果文件不存在则忽略
try {
  userConfig = await import('./v0-user-next.config');
} catch (e) {
  console.log("User config file not found, using default config.");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // 确保生成独立输出目录
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
};

// 如果用户配置存在，则合并到默认配置中
if (userConfig && userConfig.default) {
  console.log("Merging user config:", userConfig.default);
  mergeConfig(nextConfig, userConfig.default);
}

function mergeConfig(nextConfig, userConfig) {
  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      };
    } else {
      nextConfig[key] = userConfig[key];
    }
  }
}

console.log("Final nextConfig:", nextConfig);
export default nextConfig;

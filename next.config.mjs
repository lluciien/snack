let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  console.log("Failed to load user config:", e.message)
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
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    console.log("No user config found, using default config.")
    return
  }

  console.log("Merging user config:", userConfig)

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig

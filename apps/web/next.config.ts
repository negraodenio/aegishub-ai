import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: ["@mindops/database", "@mindops/domain", "@mindops/ui", "@react-pdf/renderer"],
  typedRoutes: false,
};

export default nextConfig;

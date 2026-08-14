import type { NextConfig } from "next";
import { generateRegistry } from "./src/lib/loaders/registry-generator";

// Run registry generation on server boot / compilation startup
generateRegistry();

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

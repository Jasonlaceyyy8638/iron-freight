import type { NextConfig } from 'next'
import { loadEnvConfig } from '@next/env'

// Force-load .env.local so API routes see SENDGRID_API_KEY (fixes empty process.env in dev)
loadEnvConfig(process.cwd())

const nextConfig: NextConfig = {}
export default nextConfig

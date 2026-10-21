import { defineCloudflareConfig } from '@opennextjs/cloudflare'

// No incremental cache: the page is static and the parse route never caches.
export default defineCloudflareConfig({})

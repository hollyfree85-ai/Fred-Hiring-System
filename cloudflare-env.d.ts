declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    MANAGER_USERNAME?: string;
    MANAGER_PASSCODE?: string;
    SESSION_SECRET?: string;
  }
}

import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://root:Complex123%40@massai.k9x6i.mongodb.net/intelligent?retrywrites=true&w=majority';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Define a type-safe cache object
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Create a cache object in the window object since we're in the browser
declare global {
  interface Window {
    mongooseCache?: MongooseCache;
  }
}

// Initialize the cache
if (typeof window !== 'undefined' && !window.mongooseCache) {
  window.mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
  // For browser environments
  if (typeof window !== 'undefined') {
    if (window.mongooseCache?.conn) {
      return window.mongooseCache.conn;
    }

    if (!window.mongooseCache?.promise) {
      const opts = {
        bufferCommands: false,
      };

      window.mongooseCache.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        return mongoose;
      });
    }

    try {
      window.mongooseCache.conn = await window.mongooseCache.promise;
    } catch (e) {
      window.mongooseCache.promise = null;
      throw e;
    }

    return window.mongooseCache.conn;
  }

  // For non-browser environments (fallback)
  if (mongoose.connection.readyState) {
    return mongoose;
  }

  return mongoose.connect(MONGODB_URI);
}

export default connectDB;
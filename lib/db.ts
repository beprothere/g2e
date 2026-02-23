// import mongoose from "mongoose";

// const MONGO_URI = process.env.MONGO_URI as string;

// if (!MONGO_URI) {
//   throw new Error("MONGO_URI missing in .env");
// }

// let cached = (global as any).mongoose;

// if (!cached) {
//   cached = (global as any).mongoose = { conn: null, promise: null };
// }

// export async function connectDB() {
//   if (cached.conn) return cached.conn;

//   mongoose.set("strictQuery", true);

//   cached.promise = mongoose.connect(MONGO_URI);
//   cached.conn = await cached.promise;

//   return cached.conn;
// }
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
  throw new Error("MONGO_URI missing in .env");
}

/** * Global is used here to maintain a cached connection across hot reloads in development.
 * This prevents connections from growing exponentially during development.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  // 1. Agar connection pehle se hai, toh foran wahi return karo
  if (cached.conn) {
    return cached.conn;
  }

  // 2. Agar connection process mein hai, toh naya shuru mat karo, purane ka wait karo
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Performance ke liye behtar hai
      maxPoolSize: 20,       // Connection limit set karein
    };

    mongoose.set("strictQuery", true);
    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    // 3. Promise ka wait karein aur connection save karein
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Error ki soorat mein promise clear karein taaki retry ho sakay
    throw e;
  }

  return cached.conn;
}
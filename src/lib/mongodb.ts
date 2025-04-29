import { MongoClient, ServerApiVersion } from "mongodb";

const uri = import.meta.env.VITE_MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function connectToDatabase() {
  try {
    await client.connect();
    return client.db(import.meta.env.VITE_MONGODB_DB_NAME);
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
}

export { client };

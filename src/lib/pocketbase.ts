import PocketBase from "pocketbase";

// Initialize PocketBase client
const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

export default pb;

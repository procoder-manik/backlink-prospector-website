import dns from "dns";
import { MongoClient } from "mongodb";

// Some networks and Windows setups refuse the SRV lookup that mongodb+srv:// needs
// ("querySrv ECONNREFUSED"). Set MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1 to look it up through public DNS instead.
const dnsServers = (process.env.MONGODB_DNS_SERVERS || "").split(",").map((s) => s.trim()).filter(Boolean);
if (dnsServers.length) {
  dns.setServers(dnsServers);
  dns.promises.setServers(dnsServers);
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "backlink_prospector";

// Reuse one client across hot reloads and serverless invocations.
let clientPromise = globalThis._bpMongoClientPromise;

export async function getDb() {
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add it in .env.local or in your Vercel project settings.");
  }
  if (!clientPromise) {
    const client = new MongoClient(uri, { maxPoolSize: 5 });
    clientPromise = client.connect().catch((err) => {
      // Do not cache a failed connection; the next request tries again.
      clientPromise = null;
      globalThis._bpMongoClientPromise = null;
      throw err;
    });
    globalThis._bpMongoClientPromise = clientPromise;
  }
  const client = await clientPromise;
  return client.db(dbName);
}

export async function ordersCollection() {
  const db = await getDb();
  const col = db.collection("orders");
  if (!globalThis._bpIndexes) {
    globalThis._bpIndexes = Promise.all([
      col.createIndex({ orderNumber: 1 }, { unique: true }),
      col.createIndex({ createdAt: -1 }),
      col.createIndex({ email: 1 }),
      col.createIndex({ customerId: 1, createdAt: -1 }),
    ]).catch(() => {});
  }
  await globalThis._bpIndexes;
  return col;
}

export async function customersCollection() {
  const db = await getDb();
  const col = db.collection("customers");
  if (!globalThis._bpCustomerIndexes) {
    globalThis._bpCustomerIndexes = Promise.all([
      col.createIndex({ email: 1 }, { unique: true }),
    ]).catch(() => {});
  }
  await globalThis._bpCustomerIndexes;
  return col;
}

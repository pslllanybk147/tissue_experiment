import { collection, doc, getDoc, getDocs, setDoc, type Firestore } from "firebase/firestore";
import type { PlantRecord } from "../domain/models";
import type { PlantInput, PlantRepository } from "../repositories/plant-repository";
import { getFirebaseServices } from "./client";

function adapter(db: Firestore, uid: string): PlantRepository {
  const ref = (id: string) => doc(db, "users", uid, "plants", id);
  return {
    async list(ownerId) { if (ownerId !== uid) throw new Error("Owner mismatch"); return (await getDocs(collection(db, "users", uid, "plants"))).docs.map((item) => item.data() as PlantRecord); },
    async get(ownerId, plantId) { if (ownerId !== uid) throw new Error("Owner mismatch"); const item = await getDoc(ref(plantId)); return item.exists() ? item.data() as PlantRecord : null; },
    async create(ownerId, input) { if (ownerId !== uid) throw new Error("Owner mismatch"); const timestamp = new Date().toISOString(); const item: PlantRecord = { ...input, id: "plant-" + crypto.randomUUID(), ownerId: uid, createdAt: timestamp, updatedAt: timestamp }; await setDoc(ref(item.id), item); return item; },
    async update(ownerId, plantId, input: PlantInput) { if (ownerId !== uid) throw new Error("Owner mismatch"); const current = await this.get(ownerId, plantId); if (!current) throw new Error("Plant not found"); const item: PlantRecord = { ...input, id: plantId, ownerId: uid, createdAt: current.createdAt, updatedAt: new Date().toISOString() }; await setDoc(ref(plantId), item); return item; },
  };
}

export function createFirestorePlantRepository(uid: string): PlantRepository {
  const services = getFirebaseServices(); if (!services) throw new Error("Firebase is not configured"); return adapter(services.firestore, uid);
}

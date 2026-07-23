"use client";

import { useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { LabShell } from "@/components/lab/lab-shell";
import { PlantCard } from "@/components/plants/plant-card";
import { SEED_PLANT_PROFILES, TCDifficulty } from "@/lib/domain/plant-profile";

export default function PlantCatalogPage() {
  const { session, signOut } = useAuth();
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<TCDifficulty | "All">("All");

  const profiles = useMemo(() => {
    let result = SEED_PLANT_PROFILES;
    if (difficulty !== "All") {
      result = result.filter(p => p.tcDifficulty === difficulty);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        p => p.cultivarName.toLowerCase().includes(q)
          || p.scientificName.toLowerCase().includes(q)
          || p.tradeName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, difficulty]);

  return (
    <AuthGate>
      <LabShell
        section="Plants"
        sessionLabel={session.status === "authenticated" ? "FIREBASE" : "DEMO"}
        onSignOut={() => void signOut()}
      >
        <section className="dashboard-hero">
          <div>
            <p className="dashboard-eyebrow">PLANT CATALOG & ML DATASET PREPARATION</p>
            <h1>คลังสายพันธุ์พืชและภาพอ้างอิง (Provenance Verified)</h1>
            <p>
              รวบรวมข้อมูลทางชีววิทยา สูตรอาหารเพาะเลี้ยงเนื้อเยื่อ และภาพถ่ายอ้างอิงที่ได้รับลิขสิทธิ์ถูกต้อง (CC-BY / CC0 / Public Domain) สำหรับเป็น Dataset ในการฝึกฝนโมเดลจำแนกสายพันธุ์พืช
            </p>
          </div>
        </section>

        <section className="experiment-controls" style={{ marginTop: 24 }}>
          <div className="search-box">
            <input
              type="search"
              placeholder="ค้นหาชื่อสายพันธุ์, ชื่อวิทยาศาสตร์..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="difficulty-filter">ระดับความยาก TC:</label>
            <select
              id="difficulty-filter"
              value={difficulty}
              onChange={e => setDifficulty(e.target.value as TCDifficulty | "All")}
            >
              <option value="All">ทั้งหมด</option>
              <option value="Low">Low (ง่าย)</option>
              <option value="Medium">Medium (ปานกลาง)</option>
              <option value="High">High (ยาก / ต้องการการดูแลพิเศษ)</option>
            </select>
          </div>
        </section>

        <section style={{ marginTop: 24 }}>
          {profiles.length === 0 ? (
            <div className="experiment-empty">
              <strong>ไม่พบสายพันธุ์ที่ค้นหา</strong>
              <p>ลองปรับคำค้นหาหรือตัวกรองระดับความยาก</p>
            </div>
          ) : (
            <div className="experiment-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
              {profiles.map(profile => (
                <PlantCard key={profile.id} profile={profile} />
              ))}
            </div>
          )}
        </section>
      </LabShell>
    </AuthGate>
  );
}

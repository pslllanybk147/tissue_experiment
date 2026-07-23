"use client";

import type { PreprocessingJob } from "@/lib/image/preprocessing-job";

type PreprocessingJobsProps = {
  jobs: PreprocessingJob[];
  onStart: () => Promise<void>;
  onRetry: (job: PreprocessingJob) => Promise<void>;
};

const statusLabel: Record<PreprocessingJob["status"], string> = {
  queued: "รอคิว",
  processing: "กำลังประมวลผล",
  completed: "เสร็จแล้ว",
  failed: "มีรายการล้มเหลว",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function statusClass(status: PreprocessingJob["status"]) {
  return status === "completed" ? "dataset-status approved" : status === "failed" ? "dataset-status rejected" : "dataset-status pending";
}

export function PreprocessingJobs({ jobs, onStart, onRetry }: PreprocessingJobsProps) {
  return <section className="preprocessing-jobs" aria-labelledby="preprocessing-jobs-heading">
    <div className="preprocessing-heading"><div><p className="eyebrow">IMAGE PROCESSING / PREPROCESSING</p><h2 id="preprocessing-jobs-heading">เตรียมภาพสำหรับโมเดล</h2><p>ระบบจะปรับภาพตาม contract เดียวกัน แล้วเก็บ artifact ที่ตรวจสอบซ้ำได้ใน Cloudinary</p></div><button className="primary-button" onClick={() => void onStart()} type="button">เริ่มจากรายการที่ผ่านการตรวจ</button></div>
    {!jobs.length ? <div className="dataset-empty"><h3>ยังไม่มี preprocessing job</h3><p>อนุมัติ provenance และ label ก่อน แล้วกดเริ่มเพื่อสร้างชุดภาพที่พร้อมใช้</p></div> : <div className="preprocessing-job-list">{jobs.map(job => {
      const ready = job.artifacts.filter(artifact => artifact.status === "ready").length;
      const failed = job.artifacts.filter(artifact => artifact.status === "failed").length;
      return <article className="preprocessing-job" key={job.id}>
        <div className="preprocessing-job-top"><div><code>{job.id}</code><p>Export {job.exportId} · อัปเดต {formatDate(job.updatedAt)}</p></div><span className={statusClass(job.status)}>{statusLabel[job.status]}</span></div>
        <div className="preprocessing-progress" aria-label={`ประมวลผลแล้ว ${job.processedCount} จาก ${job.itemIds.length} รายการ`}><span style={{ width: `${job.itemIds.length ? Math.round((job.processedCount / job.itemIds.length) * 100) : 0}%` }} /></div>
        <div className="preprocessing-job-meta"><span>{job.processedCount}/{job.itemIds.length} รายการ</span><span className="preprocessing-ready">พร้อมใช้ {ready}</span>{failed > 0 && <span className="preprocessing-failed">ล้มเหลว {failed}</span>}{job.retryOf && <span>retry จาก {job.retryOf}</span>}</div>
        {failed > 0 && <button className="secondary-button" onClick={() => void onRetry(job)} type="button">Retry รายการที่ล้มเหลว</button>}
        {job.artifacts.length > 0 && <details className="preprocessing-artifacts"><summary>ดู artifact รายรายการ</summary><ul>{job.artifacts.map(artifact => <li key={artifact.datasetItemId}><code>{artifact.datasetItemId}</code><span className={artifact.status === "ready" ? "preprocessing-ready" : "preprocessing-failed"}>{artifact.status === "ready" ? "พร้อม" : artifact.error || "ล้มเหลว"}</span>{artifact.secureUrl && <a href={artifact.secureUrl} target="_blank" rel="noreferrer">เปิดภาพ</a>}</li>)}</ul></details>}
      </article>;
    })}</div>}
  </section>;
}

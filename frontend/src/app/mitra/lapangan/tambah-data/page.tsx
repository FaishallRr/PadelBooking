"use client";

import { useSearchParams } from "next/navigation";
import LapanganForm from "./LapanganForm";

export default function TambahLapanganPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug"); // ambil ?slug=xxx jika edit
  const mode = slug ? "edit" : "tambah";

  return <LapanganForm mode={mode} slug={slug ?? undefined} />;
}

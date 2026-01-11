"use client";

import { useSearchParams } from "next/navigation";
import LapanganForm from "./LapanganForm";

export default function TambahLapanganClient() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug"); // ?slug=xxx
  const mode = slug ? "edit" : "tambah";

  return <LapanganForm mode={mode} slug={slug ?? undefined} />;
}

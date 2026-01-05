"use client"; // <- ini wajib

import { useParams } from "next/navigation";
import LapanganForm from "@/app/mitra/lapangan/tambah-data/LapanganForm";

export default function EditLapanganPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : undefined;

  if (!slug) {
    return (
      <p className="text-center text-red-500 mt-20">
        Slug lapangan tidak ditemukan
      </p>
    );
  }

  return <LapanganForm mode="edit" slug={slug} />;
}

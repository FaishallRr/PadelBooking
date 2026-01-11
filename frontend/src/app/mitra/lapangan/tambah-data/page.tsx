import { Suspense } from "react";
import TambahLapanganClient from "./TambahLapanganClient";

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <TambahLapanganClient />
    </Suspense>
  );
}

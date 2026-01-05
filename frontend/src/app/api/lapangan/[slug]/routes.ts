import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // Ambil dari backend EXPRESS
    const backendRes = await fetch(
      `http://localhost:5000/api/lapangan/${slug}`,
      { cache: "no-store" }
    );

    // Jika backend tidak menemukan slug
    if (backendRes.status === 404) {
      return NextResponse.json(
        { error: "Lapangan not found" },
        { status: 404 }
      );
    }

    // Jika error lain
    if (!backendRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from backend" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

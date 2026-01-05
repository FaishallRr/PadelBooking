export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const response = await fetch("http://localhost:5000/lapangan"); // Ganti dengan URL backend kamu
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching lapangan:", error);
      res.status(500).json({ error: "Failed to fetch lapangan" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

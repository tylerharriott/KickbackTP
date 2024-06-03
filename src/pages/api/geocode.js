export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { address } = req.body;  // Expect the entire address in the request body
        const apiKey = process.env.GOOGLE_API_KEY;

        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'OK') {
                const coordinates = data.results[0].geometry.location;
                res.status(200).json({ success: true, coordinates });
            } else {
                res.status(200).json({ success: false, error: data.status });
            }
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

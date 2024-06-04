export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { lat, lng } = req.query;
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=8100&type=tourist_attraction&keyword=point_of_interest&key=${process.env.GOOGLE_API_KEY}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.results) {
                res.status(200).json({ success: true, results: data.results });
                 //console.log(data.results);
            } else {
                res.status(200).json({ success: false, error: 'No results found' });
            }
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

// pages/api/place_details.js
export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { placeId } = req.query;  // Extract the Place ID from the query parameters
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,review,user_ratings_total&key=${process.env.GOOGLE_API_KEY}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.status === 'OK') {
                res.status(200).json({ success: true, details: data.result });
            } else {
                res.status(200).json({ success: false, error: data.status });
            }
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

const fetchPhoto = async (lat, lng) => {
    const response = await fetch(`/api/places?lat=${lat}&lng=${lng}`);
    const data = await response.json();
    if (data.success) {
        return data.results.filter(place => place.user_ratings_total > 100)
            .map(restaurant => ({
                ...restaurant,
                imageUrl: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${restaurant.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`
            }));
    }
    throw new Error('Failed to load places');
};

export default fetchPhoto;
 
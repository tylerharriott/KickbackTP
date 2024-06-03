// pages/results.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import fetchPhoto from './api/fetchPhoto';

const ResultsPage = () => {
    const [places, setPlaces] = useState([]);
    const router = useRouter();
    const { lat, lng } = router.query;

    useEffect(() => {
        if (lat && lng) {
            fetchPhoto(lat, lng)
                .then(data => {
                    if (data) {
                        processPlaces(data);
                        console.log("Data: ", data);
                    }
                })
                .catch(error => console.error('Failed to load places:', error));
        }
    }, [lat, lng]);

    const processPlaces = async (places) => {
        const promises = places.map(place =>
            fetchPlaceDetails(place.place_id)
            .then(details => {
                if (details && details.reviews && details.reviews.length >= 5) {
                    const firstFiveReviews = details.reviews.slice(0, 5);
                    return analyzeSentiments(firstFiveReviews.map(review => review.text))
                        .then(sentiments => {
                            const positiveCount = sentiments.filter(sentiment => sentiment === 'positive').length;
                            if (positiveCount >= 4) {
                                return place; // Only return the place if 4 out of 5 reviews are positive
                            }
                        });
                }
            })
        );

        const results = (await Promise.all(promises)).filter(Boolean);
        setPlaces(results);
    };

    const fetchPlaceDetails = async (placeId) => {
        const response = await fetch(`/api/place_details?placeId=${placeId}`);
        const data = await response.json();
        return data.success ? data.details : null;
    };

    const analyzeSentiments = async (reviewTexts) => {
        const response = await fetch('/api/analyzeSentiment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reviews: reviewTexts })
        });
        const data = await response.json();
        return data.success ? data.sentiments.map(sentiment => sentiment.sentiment) : [];
    };

    return (
        <div>
            <h1>Finished</h1>
            {places.map((place, index) => (
                <div key={index}>
                    <img src={place.imageUrl} alt={place.name} />
                    <p>{place.name}</p>
                    <p>Rating: {place.rating}</p>
                </div>
            ))}
        </div>
    );
};

export default ResultsPage;

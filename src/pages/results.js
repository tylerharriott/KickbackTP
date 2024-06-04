import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import fetchPhoto from './api/fetchPhoto';
import { Box, Grid, Image, Text, Flex, Center } from '@chakra-ui/react';

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
                                return place;
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
        <Flex height="100vh" direction="column" align="center" justify="center" bgGradient="linear(to-r, #41436A 25%, #984063 50%, #F64668 75%, #FE9677)">
            <Text fontSize="4xl" fontWeight="bold" color="white" position="absolute" top="1rem" left="1rem">KickbackTP</Text>
            {places.length > 0 ? (
                <Grid templateColumns="repeat(3, 1fr)" gap={6} pt={20}>
                    {places.map((place, index) => (
                        <Box key={index} boxShadow='md' p='6' rounded='md' bg='white'>
                            <Center>
                                <Image src={place.imageUrl} alt={place.name} borderRadius='md' boxSize="150px" objectFit="cover" />
                            </Center>
                            <Text fontSize='lg' mt='2'>{place.name}</Text>
                            <Text fontSize='sm'>Rating: {place.rating}</Text>
                        </Box>
                    ))}
                </Grid>
            ) : (
                <Center pt={20}>
                    <Text fontSize='xl' color="white">No quality places found.</Text>
                </Center>
            )}
        </Flex>
    );
};

export default ResultsPage;

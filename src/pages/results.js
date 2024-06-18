import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import fetchPhoto from './api/fetchPhoto';
import { Box, Grid, Image, Text, Flex, Center, Badge } from '@chakra-ui/react';
import { MdStar } from "react-icons/md";

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

    const getPriceRange = (priceLevel) => {
        switch (priceLevel) {
            case 0:
                return 'Free';
            case 1:
                return '$0 - $10';
            case 2:
                return '$10 - $30';
            case 3:
                return '$30 - $60';
            case 4:
                return '$60 and above';
            default:
                return 'Free Entrance';
        }
    };

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
                                    return { ...place, priceRange: getPriceRange(details.price_level) };
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
        <Flex height="100vh" direction="column" align="center" justify="center" bgGradient="linear(to-br, #E50058, #FF740F, #FFBE36, #FCFCFC, #193B55)">
            <Text fontSize="3xl" fontWeight="bold" color="white" position="absolute" top="1rem" left="1rem">KickbackTP</Text>
            {places.length > 0 ? (
                <Grid templateColumns="repeat(3, 1fr)" gap={6} pt={20}>
                    {places.map((place, index) => (
                        <Box key={index} p="5" maxW="320px" borderWidth="1px" borderRadius="md" overflow="hidden" bg="white">
                            <Image borderRadius="md" src={place.imageUrl} alt={place.name} objectFit="cover" height="200px" width="100%" />
                            <Flex direction="column" mt={2}>
                                <Flex align="baseline">
                                    <Badge colorScheme="pink" mb={1}>Verified</Badge>
                                </Flex>
                                <Text
                                    textTransform="uppercase"
                                    fontSize="sm"
                                    fontWeight="bold"
                                    color="pink.800"
                                >
                                    {place.name}
                                </Text>
                            </Flex>
                            <Text mt={2} fontSize="xl" fontWeight="semibold" lineHeight="short">
                                {place.description}
                            </Text>
                            <Text mt={2}>{place.priceRange}</Text>
                            <Flex mt={2} align="center">
                                <Box as={MdStar} color="orange.400" />
                                <Text ml={1} fontSize="sm">
                                    <b>{place.rating}</b> ({place.user_ratings_total})
                                </Text>
                            </Flex>
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

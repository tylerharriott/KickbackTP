import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Input, Button, VStack, Box, Heading, Flex, Text } from '@chakra-ui/react';

const LocationInput = () => {
    const inputRef = useRef(null);
    const [address, setAddress] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (typeof google === "object" && typeof google.maps === "object") {
            const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
                types: ['geocode'],
            });

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place.geometry) {
                    setAddress(place.formatted_address);
                }
            });
        }
    }, []);

    const handleGeocode = async () => {
        if (address) {
            try {
                const response = await fetch(`/api/geocode`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ address }),
                });
                const data = await response.json();
                if (data.success) {
                    const { lat, lng } = data.coordinates;
                    router.push(`/results?lat=${lat}&lng=${lng}`);
                } else {
                    console.error('Geocoding failed:', data.error);
                }
            } catch (error) {
                console.error('Failed to geocode:', error.message);
            }
        }
    };

    return (
        <Flex height="100vh" direction="column" align="center" justify="center" bgGradient="linear(to-r, #41436A 25%, #984063 50%, #F64668 75%, #FE9677)">
            <Text fontSize="4xl" fontWeight="bold" color="white" position="absolute" top="1rem" left="1rem">KickbackTP</Text>
            <Box p={5} shadow='md' borderWidth='1px' borderRadius='md' bg="white" width="auto" maxWidth="480px">
                <VStack spacing={4}>
                    <Heading as='h1' size='xl'>Where would you like to go?</Heading>
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder="Start typing an address..."
                    />
                    <Button colorScheme="pink" onClick={handleGeocode}>Search</Button>
                </VStack>
            </Box>
        </Flex>
    );
};

export default LocationInput;

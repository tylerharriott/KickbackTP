import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

const LocationInput = () => {
    const inputRef = useRef(null);
    const [address, setAddress] = useState('');
    const [budget, setBudget] = useState('');  // State for storing the budget
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
                    router.push(`/results?lat=${lat}&lng=${lng}&budget=${budget}`);  // Pass the budget as a query parameter
                } else {
                    console.error('Geocoding failed:', data.error);
                }
            } catch (error) {
                console.error('Failed to geocode:', error.message);
            }
        }
    };

    return (
        <div>
            <h1>Enter your destination and budget</h1>
            <input
                ref={inputRef}
                type="text"
                placeholder="Start typing an address..."
                style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            />
            <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Enter your budget"
                style={{ width: '100%', padding: '10px', fontSize: '16px', marginTop: '10px' }}
            />
            <button onClick={handleGeocode}>Search</button>
        </div>
    );
};

export default LocationInput;

const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

// Utilities
const log = (msg) => console.log(`[TEST] ${msg}`);
const err = (msg, e) => console.error(`[FAIL] ${msg}`, e.response?.data || e.message);

async function runTest() {
    try {
        log('Starting Verification...');

        // 1. Register Owner
        const ownerEmail = `owner_${Date.now()}@test.com`;
        log(`Registering Owner: ${ownerEmail}`);
        const ownerReg = await axios.post(`${API_URL}/auth/register`, {
            email: ownerEmail,
            password: 'password123',
            name: 'Hotel Owner',
            role: 'OWNER'
        });
        const ownerToken = ownerReg.data.token;
        log('Owner Registered.');

        // 2. Create Hotel
        log('Creating Hotel...');
        const hotelRes = await axios.post(`${API_URL}/hotels`, {
            name: 'Grand Budapest Hotel',
            description: 'A famous european hotel',
            city: 'Zubrowka',
            address: 'Alpine Road 1',
            amenities: ['Wifi', 'Pool'],
            images: []
        }, { headers: { Authorization: `Bearer ${ownerToken}` } });
        const hotelId = hotelRes.data.hotel.id;
        log(`Hotel Created: ${hotelId}`);

        // 3. Create Room (Inventory: 1)
        log('Creating Room with Inventory 1...');
        const roomRes = await axios.post(`${API_URL}/rooms`, {
            hotelId,
            title: 'Mendl Suite',
            type: 'Suite',
            pricePerNight: 200,
            capacity: 2,
            inventory: 1 // CRITICAL: Only 1 room available
        }, { headers: { Authorization: `Bearer ${ownerToken}` } });
        const roomId = roomRes.data.id;
        log(`Room Created: ${roomId}`);

        // 4. Register Customer
        const custEmail = `cust_${Date.now()}@test.com`;
        log(`Registering Customer: ${custEmail}`);
        const custReg = await axios.post(`${API_URL}/auth/register`, {
            email: custEmail,
            password: 'password123',
            name: 'Zero Moustafa',
            role: 'CUSTOMER'
        });
        const custToken = custReg.data.token;
        log('Customer Registered.');

        // 5. Customer Books Room (Dates: 2025-01-01 to 2025-01-05)
        log('Attempting Booking 1 (Should Succeed)...');
        await axios.post(`${API_URL}/bookings`, {
            roomId,
            checkIn: '2025-01-01T12:00:00Z',
            checkOut: '2025-01-05T10:00:00Z',
            guestCount: 2
        }, { headers: { Authorization: `Bearer ${custToken}` } });
        log('Booking 1 Success!');

        // 6. Customer Books SAME Room SAME Dates (Should Fail)
        log('Attempting Booking 2 (Should Fail - Overlap)...');
        try {
            await axios.post(`${API_URL}/bookings`, {
                roomId,
                checkIn: '2025-01-03T12:00:00Z', // Overlaps!
                checkOut: '2025-01-07T10:00:00Z',
                guestCount: 2
            }, { headers: { Authorization: `Bearer ${custToken}` } });
            console.error('Booking 2 SUCCEEDED (Unexpected!)');
        } catch (e) {
            if (e.response?.status === 409) {
                log('Booking 2 Failed as expected (409 Conflict).');
            } else {
                err('Booking 2 Failed with unexpected error', e);
            }
        }

        // 7. Customer Books DIFFERENT Dates (Should Succeed)
        log('Attempting Booking 3 (Should Succeed - No Overlap)...');
        await axios.post(`${API_URL}/bookings`, {
            roomId,
            checkIn: '2025-02-01T12:00:00Z',
            checkOut: '2025-02-05T10:00:00Z',
            guestCount: 2
        }, { headers: { Authorization: `Bearer ${custToken}` } });
        log('Booking 3 Success!');

        log('VERIFICATION COMPLETE: All systems operational.');

    } catch (e) {
        err('Test Script Failed', e);
    }
}

runTest();

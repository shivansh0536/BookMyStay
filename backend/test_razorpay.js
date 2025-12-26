require('dotenv').config();
const Razorpay = require('razorpay');

console.log('Testing Razorpay configuration...\n');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Present' : 'Missing');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Present' : 'Missing');

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('\n❌ Razorpay credentials are missing in .env file');
    process.exit(1);
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

console.log('\n✅ Razorpay instance created successfully');
console.log('\nTesting API connection by creating a test order...\n');

// Create a test order
razorpay.orders.create({
    amount: 50000, // ₹500 in paise
    currency: 'INR',
    receipt: 'test_receipt_001',
    notes: {
        test: 'This is a test order'
    }
})
    .then(order => {
        console.log('✅ SUCCESS! Razorpay API is working correctly\n');
        console.log('Test Order Created:');
        console.log('- Order ID:', order.id);
        console.log('- Amount:', order.amount / 100, 'INR');
        console.log('- Status:', order.status);
        console.log('\n✅ Your Razorpay integration is configured correctly!');
    })
    .catch(error => {
        console.error('\n❌ FAILED! Error creating Razorpay order:\n');
        console.error('Error Code:', error.error?.code);
        console.error('Error Description:', error.error?.description);
        console.error('Error Reason:', error.error?.reason);
        console.error('\nFull error:', error);
        console.error('\n⚠️  Please check your Razorpay API keys');
        process.exit(1);
    });

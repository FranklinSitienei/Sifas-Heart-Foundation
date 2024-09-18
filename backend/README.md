# .env
GOOGLE_CLIENT_ID="545019242334-bc6k141c02tbc412876n7va0crq3qts9.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"
# APPLE_CLIENT_ID=your-apple-client-id
# APPLE_TEAM_ID=your-apple-team-id
# APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
JWT_SECRET="843bc16c7231211f0a1b08d3d0966c32f234e67091011e90b6e9b7301e9a4c89"
ADMIN_JWT_SECRET="29e3f1ddf6d7e28277132e1330d38c3abf3eb1427c3bfb2abd60ef022b9fab6b"
MONGO_URI="mongodb+srv://sitieneifranklin:frank123@cluster0.2umeiex.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
FLW_PUBLIC_KEY=your_flutterwave_public_key
FLW_SECRET_KEY=your_flutterwave_secret_key
MPESA_CONSUMER_KEY=sFwZI4lmrL9PnH8oQj7GQlGDCpWLNLW2sWABtyEiZi67v5SG
MPESA_CONSUMER_SECRET=0gPxZJbAvGrNjaZCrrYHQtwaDeEgAvPqWa4iWWNWhMfiv9jeoyOzkGFQTKi9c5cN
MPESA_PASS_KEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_STK_PUSH_URL=https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest
MPESA_ACCESS_TOKEN_URL=https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials
PAYSTACK_TEST_KEY="sk_test_ee473b864a7c800560c756af082a9a45ffc85e76"
PAYSTACK_TEST_PUBLIC="pk_test_b01bee1fece0143e4cdf99876096302cddf314d1"
EMAIL_USER="sitieneifranklin@gmail.com"
EMAIL_PASS="Sitienei2023"
CALLBACK_URL=https://mydomain.com/path
PARTY_A="254708374149"

# Install:
npm install express mongoose bcryptjs jsonwebtoken passport passport-google-oauth20 passport-apple nodemailer dotenv pdfkit cors mongodb stripe mpesa-node flutterwave-node-v3 next-auth multer bcrypt moment-timezone
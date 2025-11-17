# 🛡️ Payment Error Troubleshooting Guide

## Common Payment Initialization Errors

### 1. "Server error during payment initiation"

**Cause:** Invalid ObjectId format for userId or contentId

**Solution:** Ensure userId and contentId are valid 24-character hex strings (MongoDB ObjectIds)

**Examples:**
- ✅ Valid: `507f1f77bcf86cd799439011`
- ❌ Invalid: `invalid-user-id`, `123`, `user123`

### 2. "Invalid userId format. Must be a valid MongoDB ObjectId."

**Cause:** userId parameter is not a valid MongoDB ObjectId

**Solution:** Use a valid ObjectId from your user database or generate one for testing

### 3. "Invalid contentId format. Must be a valid MongoDB ObjectId."

**Cause:** contentId parameter is not a valid MongoDB ObjectId

**Solution:** Use a valid contentId from your content database

### 4. "Missing required fields"

**Cause:** Required parameters are missing from the request

**Required Fields:**
- `userId` (string, valid ObjectId)
- `contentId` (string, valid ObjectId) 
- `amount` (number)
- `userEmail` (string)
- `userName` (string, optional for some routes)

## Testing Valid ObjectIds

### From Database:
```bash
# Get valid user ObjectIds
curl "https://climax-fullstack.onrender.com/api/auth/users" | jq '.[0]._id'

# Get valid content ObjectIds  
curl "https://climax-fullstack.onrender.com/api/contents" | jq '.[0]._id'
```

### Generate Test ObjectIds:
```javascript
// In Node.js with mongodb package
const { ObjectId } = require('mongodb');
const testUserId = new ObjectId().toString();
const testContentId = new ObjectId().toString();
```

### Using Browser Console:
```javascript
// Generate random valid ObjectId
const generateObjectId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const random = Math.random().toString(16).substring(2, 18);
  return (timestamp + random).substring(0, 24);
};

const testUserId = generateObjectId();
const testContentId = generateObjectId();
```

## Valid Test Content IDs

From your database (confirmed working):
- `691ae27284bb3f9a66b3a865` - Big Buck Bunny (₹19)
- `691ae27284bb3f9a66b3a867` - Sintel (₹39)  
- `691ae27284bb3f9a66b3a868` - Tears of Steel (₹49)
- `691adf46d32ad6ad7e4e8fa3` - The Matrix (₹39)

## Example Working Payment Request

```javascript
const paymentData = {
  userId: "507f1f77bcf86cd799439011",
  contentId: "691ae27284bb3f9a66b3a865", 
  amount: 19,
  userEmail: "test@example.com",
  userName: "Test User"
};

fetch('https://climax-fullstack.onrender.com/api/phonepe/initiate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(paymentData)
})
.then(res => res.json())
.then(data => console.log('Success:', data))
.catch(err => console.error('Error:', err));
```

## Error Status Codes

- `400` - Bad Request (validation errors, invalid ObjectIds)
- `500` - Internal Server Error (server-side issues)
- `200` - Success (payment initiated)

## Frontend Integration Notes

1. Always validate ObjectId format before sending to backend
2. Handle 400 errors gracefully with user-friendly messages
3. Use existing user session data for userId
4. Get contentId from selected content item

## Support

If you encounter other payment errors:
1. Check browser console for detailed error messages
2. Verify API endpoints are accessible
3. Ensure test credentials are properly configured
4. Test with valid ObjectIds from the troubleshooting guide
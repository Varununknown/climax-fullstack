// Quick API test script to debug form submission issues
import API from './services/api';

export const testContentAPI = async () => {
  try {
    console.log('🧪 Testing API endpoints...\n');

    // Test 1: GET /contents
    console.log('1️⃣ Testing GET /contents...');
    const getRes = await API.get('/contents');
    console.log(`✅ GET /contents returned ${getRes.data?.length || 0} items`);
    if (getRes.data?.length > 0) {
      console.log(`   First item: ${getRes.data[0].title} (ID: ${getRes.data[0]._id})`);
    }

    // Test 2: GET /contents/:id (use first item if available)
    if (getRes.data?.length > 0) {
      const testId = getRes.data[0]._id;
      console.log(`\n2️⃣ Testing GET /contents/${testId}...`);
      const getByIdRes = await API.get(`/contents/${testId}`);
      console.log(`✅ GET /contents/:id returned: ${getByIdRes.data?.title}`);
    }

    // Test 3: POST /contents (test add)
    console.log('\n3️⃣ Testing POST /contents (add new item)...');
    const newContent = {
      title: `Test Content ${Date.now()}`,
      description: 'This is a test content item',
      category: 'Action',
      type: 'movie',
      language: 'English',
      thumbnail: 'https://via.placeholder.com/300x400',
      videoUrl: 'https://example.com/video.mp4',
      duration: 120,
      premiumPrice: 49,
      climaxTimestamp: 60,
      rating: 8,
      genre: ['Action', 'Thriller'],
      isActive: true
    };

    const postRes = await API.post('/contents', newContent);
    console.log(`✅ POST /contents succeeded, created item with ID: ${postRes.data?._id}`);

    // Test 4: PUT /contents/:id (test update)
    if (postRes.data?._id) {
      const createdId = postRes.data._id;
      console.log(`\n4️⃣ Testing PUT /contents/${createdId} (update)...`);
      const updateRes = await API.put(`/contents/${createdId}`, {
        title: `Updated Test ${Date.now()}`
      });
      console.log(`✅ PUT /contents/:id succeeded, updated title to: ${updateRes.data?.title}`);

      // Test 5: DELETE /contents/:id
      console.log(`\n5️⃣ Testing DELETE /contents/${createdId}...`);
      await API.delete(`/contents/${createdId}`);
      console.log(`✅ DELETE /contents/:id succeeded`);
    }

    console.log('\n✅ All API tests passed!');
    return { success: true };
  } catch (err: any) {
    console.error('❌ API test failed:', err);
    console.error('Error details:', {
      status: err?.response?.status,
      data: err?.response?.data,
      message: err?.message
    });
    return { success: false, error: err };
  }
};

// Run tests when script loads
if (typeof window !== 'undefined') {
  (window as any).testContentAPI = testContentAPI;
  console.log('📝 API test script loaded. Run testContentAPI() in console to test.');
}

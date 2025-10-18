// Quick script to fix broken placeholder images
// Run this in browser console on admin panel to clean up test content

(async function fixBrokenImages() {
  console.log('🔧 Starting image URL cleanup...');
  
  try {
    // Get all content
    const response = await fetch('/api/contents');
    const contents = await response.json();
    
    console.log(`📋 Found ${contents.length} content items`);
    
    let fixedCount = 0;
    
    for (const content of contents) {
      if (content.thumbnail && content.thumbnail.includes('via.placeholder.com')) {
        console.log(`🔄 Fixing broken image for: ${content.title}`);
        
        // Update with working placeholder
        const updateResponse = await fetch(`/api/contents/${content._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...content,
            thumbnail: 'https://images.unsplash.com/photo-1489599808050-e1d2b7c9fec0?w=400&h=225&fit=crop&auto=format'
          })
        });
        
        if (updateResponse.ok) {
          console.log(`✅ Fixed: ${content.title}`);
          fixedCount++;
        } else {
          console.log(`❌ Failed to fix: ${content.title}`);
        }
      }
    }
    
    console.log(`🎉 Cleanup complete! Fixed ${fixedCount} images.`);
    console.log('🔄 Refresh the page to see changes.');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
})()
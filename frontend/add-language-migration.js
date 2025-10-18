// Quick database migration to add language field to existing content
// Run this in browser console on admin panel

(async function addLanguageToExistingContent() {
  console.log('🔄 Starting language field migration...');
  
  try {
    // Get all content
    const response = await fetch('/api/contents');
    const contents = await response.json();
    
    console.log(`📋 Found ${contents.length} content items`);
    
    let updatedCount = 0;
    
    for (const content of contents) {
      if (!content.language) {
        console.log(`🔄 Adding language field to: ${content.title}`);
        
        // Determine language based on title or set default
        let language = 'English'; // Default
        
        // Simple language detection based on title
        if (content.title.includes('हिन्दी') || content.description.includes('हिन्दी')) {
          language = 'Hindi';
        } else if (content.title.includes('ಕನ್ನಡ') || content.description.includes('Kannada') || content.description.includes('kannada')) {
          language = 'Kannada';
        } else if (content.title.includes('தமிழ்') || content.description.includes('Tamil') || content.description.includes('tamil')) {
          language = 'Tamil';
        } else if (content.title.includes('తెలుగు') || content.description.includes('Telugu') || content.description.includes('telugu')) {
          language = 'Telugu';
        }
        
        // Update with language field
        const updateResponse = await fetch(`/api/contents/${content._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...content,
            language: language
          })
        });
        
        if (updateResponse.ok) {
          console.log(`✅ Added ${language} language to: ${content.title}`);
          updatedCount++;
        } else {
          console.log(`❌ Failed to update: ${content.title}`);
        }
      } else {
        console.log(`✅ ${content.title} already has language: ${content.language}`);
      }
    }
    
    console.log(`🎉 Migration complete! Updated ${updatedCount} content items.`);
    console.log('🔄 Refresh the page to see changes.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
})();
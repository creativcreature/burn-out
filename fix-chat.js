// Run this in browser console to fix chat
(async function fixChat() {
  try {
    // Import IDB
    const { openDB } = await import('https://cdn.jsdelivr.net/npm/idb@8.0.0/+esm');
    
    // Open database
    const db = await openDB('burnout-app-v7');
    const tx = db.transaction('main', 'readwrite');
    const data = await tx.objectStore('main').get('main');
    
    if (data && data.settings) {
      console.log('Current provider:', data.settings.aiProvider);
      data.settings.aiProvider = 'claude';
      await tx.objectStore('main').put(data, 'main');
      console.log('✅ Provider fixed! Refresh the page.');
    } else {
      console.log('❌ No settings found');
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
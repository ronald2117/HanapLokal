// Add this to your ChatListScreen temporarily for debugging
const debugConversations = async () => {
  if (!currentUser) return;
  
  try {
    console.log('=== DEBUGGING CONVERSATIONS ===');
    console.log('Current user ID:', currentUser.uid);
    
    // Get all conversations without ordering first
    const conversationsRef = collection(db, 'conversations');
    const allSnapshot = await getDocs(conversationsRef);
    
    console.log('Total conversations in DB:', allSnapshot.size);
    
    allSnapshot.forEach(doc => {
      const data = doc.data();
      console.log('Conversation:', doc.id, data);
      console.log('Participants:', data.participants);
      console.log('User in participants?', data.participants?.includes(currentUser.uid));
    });
    
    // Try the filtered query
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', currentUser.uid)
    );
    
    const snapshot = await getDocs(q);
    console.log('Filtered conversations count:', snapshot.size);
    
  } catch (error) {
    console.error('Debug error:', error);
  }
};

// Call this function in useEffect for debugging
useEffect(() => {
  if (currentUser) {
    debugConversations();
  }
}, [currentUser]);

export const fetchEmojis = async () => {
    try {
      const response = await fetch('https://sifas-heart-foundation.onrender.com/api/emojis/emojis');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching emojis:', error);
    }
  };
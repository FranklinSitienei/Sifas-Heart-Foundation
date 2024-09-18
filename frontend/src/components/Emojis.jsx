export const fetchEmojis = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/emojis');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching emojis:', error);
    }
  };
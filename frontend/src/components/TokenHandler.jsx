import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TokenHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleToken = () => {
      const queryParams = new URLSearchParams(window.location.search);
      const token = queryParams.get('token');

      if (token) {
        localStorage.setItem('token', token);
        navigate('/', { replace: true });
      }
    };

    handleToken();
  }, [navigate]);

  return null; // This component does not render anything
};

export default TokenHandler;

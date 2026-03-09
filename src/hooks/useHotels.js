import { useState, useEffect } from 'react';
import { hotelsAPI } from '../api.js';

export const useHotels = (filters = {}) => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await hotelsAPI.list(filters);
        setHotels(data);
      } catch (err) {
        console.error('Failed to fetch hotels:', err);
        setError(err.message);
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [JSON.stringify(filters)]);

  return { hotels, loading, error };
};

export const useHotelDetail = (id) => {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchHotel = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await hotelsAPI.getWithRooms(id);
        setHotel(data);
      } catch (err) {
        console.error('Failed to fetch hotel:', err);
        setError(err.message);
        setHotel(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [id]);

  return { hotel, loading, error };
};

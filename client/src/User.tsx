import React, { useEffect, useState } from 'react';
import { useUser } from './UserContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const User: React.FC = () => {
  const { userId, logout } = useUser();
  const [userData, setUserData] = useState<{
    username: string;
    email: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/get-user/${userId}`,
            {
              withCredentials: true,
            },
          );

          console.log('Fetched user data:', response.data);
          setUserData(response.data.dataValues);
        } catch (error) {
          console.error('Error fetching user data:', error);
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };

    fetchUserData();
  }, [userId, navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/logout`,
        {},
        {
          withCredentials: true,
        },
      );
      logout();
      console.log('Successfully logged out');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div>
      <h1>User Data</h1>
      {userData ? (
        <>
          <p>Username: {userData.username}</p>
          <p>Email: {userData.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default User;

// src/contexts/UserProvider.jsx
import { useState, useEffect } from 'react';
import { UserContext } from './UserContext';
import { BASE_URL } from '../config';

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/autologin`, {
      method: 'POST',
      credentials: 'include', 
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          setUser(data.data); 
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

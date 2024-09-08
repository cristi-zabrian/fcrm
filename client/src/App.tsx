import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { UserProvider, useUser } from './UserContext';
import Login from './Login';
import User from './User';

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/user" element={<ProtectedRoute component={User} />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

const ProtectedRoute: React.FC<{ component: React.FC }> = ({
  component: Component,
}) => {
  const { userId } = useUser();
  return userId ? <Component /> : <Navigate to="/login" />;
};

export default App;

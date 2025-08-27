import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { hashPassword, generateOTP, sendOTP } from '../utils/auth';
// import { sendOTP





const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    const storedUsers = localStorage.getItem('glence_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }

    const storedPendingUsers = localStorage.getItem('glence_pending_users');
    if (storedPendingUsers) {
      setPendingUsers(JSON.parse(storedPendingUsers));
    }

    const storedAuth = localStorage.getItem('glence_auth');
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      setIsAuthenticated(true);
      setCurrentUser(authData.email);
    }
  }, []);

  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.isVerified);
    if (user && user.hashedPassword === hashPassword(password)) {
      setIsAuthenticated(true);
      setCurrentUser(email);
      localStorage.setItem('glence_auth', JSON.stringify({ email }));
      return true;
    }
    return false;
  };

  const register = async (email, password) => {
    if (users.find(u => u.email === email)) {
      return false; // User already exists
    }

    const otp = generateOTP();
    const pendingUser = {
      email,
      hashedPassword: hashPassword(password),
      otp,
      timestamp: Date.now()
    };

    // Remove any existing pending user with same email
    const updatedPendingUsers = pendingUsers.filter(u => u.email !== email);
    updatedPendingUsers.push(pendingUser);
    setPendingUsers(updatedPendingUsers);
    localStorage.setItem('glence_pending_users', JSON.stringify(updatedPendingUsers));

    // Send OTP (simulated)
    try {
      await sendOTP(email, otp);
      return true;
    } catch (error) {
      return false;
    }
  };

  const verifyOTP = (email, otp) => {
    const pendingUser = pendingUsers.find(u => u.email === email);
    if (!pendingUser) return false;

    // Check if OTP is expired (5 minutes)
    if (Date.now() - pendingUser.timestamp > 5 * 60 * 1000) {
      return false;
    }

    if (pendingUser.otp === otp) {
      // Move user from pending to verified users
      const newUser = {
        email: pendingUser.email,
        hashedPassword: pendingUser.hashedPassword,
        isVerified: true
      };

      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      localStorage.setItem('glence_users', JSON.stringify(updatedUsers));

      // Remove from pending users
      const updatedPendingUsers = pendingUsers.filter(u => u.email !== email);
      setPendingUsers(updatedPendingUsers);
      localStorage.setItem('glence_pending_users', JSON.stringify(updatedPendingUsers));

      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('glence_auth');
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      currentUser,
      login,
      register,
      verifyOTP,
      logout,
      users,
      pendingUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
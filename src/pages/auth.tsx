import React, { useState, useEffect } from 'react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const toggleForm = () => setIsLogin(!isLogin);

  useEffect(() => {
    if (!isLogin) validateForm();
  }, [username, password, confirmPassword, role, accessCode]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!username.match(emailRegex)) newErrors.username = 'Invalid email format';
    if (password.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(password) || !/\d/.test(password))
      newErrors.password = 'Weak password (min 8 chars, number & symbol required)';
    if (!isLogin && password !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Simulate API
      alert(isLogin ? 'Logging in...' : 'Signing up...');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-transparent dark:bg-transparent transition-colors">
      <div className="w-full max-w-md p-6 rounded-xl shadow-lg bg-cream text-maroon dark:bg-gray-900 transition-colors">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? 'Login' : 'Sign Up'}
        </h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col w-[90%] mx-auto">
            <label htmlFor="username" className="font-bold text-[#EAD9C6] mb-1">
              Email:
            </label>
            <input
              autoFocus
              type="email"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`p-2 border rounded text-black ${errors.username ? 'border-red-500' : 'border-[#EAD9C6]'}`}
              placeholder="Enter your email"
              aria-invalid={!!errors.username}
              aria-describedby="username-error"
              required
            />
            {errors.username && <span id="username-error" className="text-red-500 text-sm">{errors.username}</span>}
          </div>

          <div className="flex flex-col w-[90%] mx-auto">
            <label htmlFor="password" className="font-bold text-[#EAD9C6] mb-1">
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`p-2 border rounded text-black ${errors.password ? 'border-red-500' : 'border-[#EAD9C6]'}`}
              placeholder="Enter your password"
              required
            />
            {errors.password && <span className="text-red-500 text-sm">{errors.password}</span>}
          </div>

          {!isLogin && (
            <>
              <div className="flex flex-col w-[90%] mx-auto">
                <label htmlFor="confirmPassword" className="font-bold text-[#EAD9C6] mb-1">
                  Confirm Password:
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`p-2 border rounded text-black ${errors.confirmPassword ? 'border-red-500' : 'border-[#EAD9C6]'}`}
                  placeholder="Re-enter password"
                  required
                />
                {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword}</span>}
              </div>

              <div className="flex flex-col w-[90%] mx-auto">
                <label htmlFor="role" className="font-bold text-[#EAD9C6] mb-1">
                  Role:
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="p-2 border border-[#EAD9C6] rounded text-black"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="super-admin">Admin</option>
                  <option value="admin">HOD'S</option>
                </select>
              </div>

              {role && (
                <div className="flex flex-col w-[90%] mx-auto">
                  <label htmlFor="accessCode" className="font-bold text-[#EAD9C6] mb-1">
                    Access Code:
                  </label>
                  <input
                    type="text"
                    id="accessCode"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Enter Access Code"
                    className="p-2 border border-[#EAD9C6] rounded text-black"
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={Object.keys(errors).length > 0}
            className="w-1/2 mx-auto bg-maroon text-cream font-bold py-2 rounded hover:bg-[#B8A086] disabled:opacity-50"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-sm text-[#EAD9C6] text-center">
          {isLogin ? (
            <>
              <a href="#" className="font-bold hover:text-[#FFD700]">
                Forgot Password?
              </a>
              <p className="mt-2">
                Don't have an account?{' '}
                <button onClick={toggleForm} className="text-cream hover:text-red-800 font-bold">
                  Sign Up
                </button>
              </p>
            </>
          ) : (
            <p>
              Already have an account?{' '}
              <button onClick={toggleForm} className="text-cream hover:text-white font-bold">
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
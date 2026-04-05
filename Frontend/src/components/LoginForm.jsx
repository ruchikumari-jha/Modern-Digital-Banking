
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2, RotateCcw, Mail } from 'lucide-react';
import axios from 'axios';
import { useUser } from '../context/AppContext';

const LoginForm = () => {
    const navigate = useNavigate();
    const { refreshUserData } = useUser();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    
    const [captcha, setCaptcha] = useState('');
    const [userCaptcha, setUserCaptcha] = useState('');

    const generateCaptcha = () => {
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptcha(result);
    };

    useEffect(() => {
        generateCaptcha();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        // Password validation (simple check if empty, or regex if strict)
        if (!password) {
            setError("Please enter your password.");
            return;
        }

        // Captcha validation
        if (userCaptcha !== captcha) {
            setError("Incorrect captcha. Please try again.");
            generateCaptcha();
            setUserCaptcha('');
            return;
        }
        try{
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/api/auth/login`,{
            "email":email,
            "password":password
        });
        localStorage.setItem("access_token",response.data.access_token);
        console.log("message","success");
        await refreshUserData();
        navigate('/dashboard');
    }catch(err){
        console.log(err);
    }

       

       
    };

    return (
        <div className="relative w-full max-w-sm h-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border-8 border-gray-900 flex flex-col">
            <div className="flex-1 px-8 pt-12 pb-8 flex flex-col items-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-1">Welcome Back</h2>
                <p className="text-gray-500 text-sm mb-6">Login in to continue</p>

                <form className="w-full space-y-6" onSubmit={handleLogin}>
                    
                    <div className="relative group">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border-b border-gray-300 py-2 text-gray-700 focus:outline-none focus:border-red-500 transition-colors bg-transparent"
                            required
                        />
                         {email && email.includes('@') && (
                            <CheckCircle2 className="absolute right-0 top-2 text-green-500 w-5 h-5" />
                        )}
                        {!email && <Mail className="absolute right-0 top-2 text-gray-400 w-5 h-5" />}
                    </div>

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border-b border-gray-300 py-2 text-gray-700 focus:outline-none focus:border-red-500 transition-colors bg-transparent"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 top-2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>



                    {/* Captcha Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                            <span className="text-xl font-mono font-bold tracking-widest text-gray-700 select-none">
                                {captcha}
                            </span>
                            <button
                                type="button"
                                onClick={generateCaptcha}
                                className="text-gray-500 hover:text-red-500 transition-colors"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Enter Captcha"
                                value={userCaptcha}
                                onChange={(e) => setUserCaptcha(e.target.value)}
                                className="w-full border-b border-gray-300 py-2 text-gray-700 focus:outline-none focus:border-red-500 transition-colors bg-transparent"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-xs text-center font-medium">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-gray-900 text-white py-3 rounded-lg shadow-xl hover:bg-black transition-transform active:scale-95 font-semibold text-sm tracking-wide mt-4"
                    >
                        LOGIN
                    </button>
                </form>
            </div>

            <div className="w-full pt-6 px-8 pb-6 flex flex-col items-center justify-end z-10">
                <div className="w-full flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/register')}
                        className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-black transition-colors text-sm font-medium"
                    >
                        Create an account
                    </button>

                     <button type="button" className="text-gray-500 text-xs pb-1 text-center hover:text-gray-800">
                        Forgot password?
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;

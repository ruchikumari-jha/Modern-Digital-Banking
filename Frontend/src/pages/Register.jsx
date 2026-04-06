
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Eye, EyeOff, RotateCcw, Landmark } from 'lucide-react';
import axios from 'axios'

const Register = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
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

    const handleRegister = async(e) => {
        e.preventDefault();
        setError('');

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            setError("Phone number must be exactly 10 digits.");
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;
        if (!passwordRegex.test(password)) {
            setError("Password must contain at least one uppercase letter, one lowercase letter, and one special character.");
            return;
        }

        if (userCaptcha !== captcha) {
            setError("Incorrect captcha. Please try again.");
            generateCaptcha();
            setUserCaptcha('');
            return;
        }

        // const emailExists = Object.values(localStorage).some(item => {
        //     try {
        //         const user = JSON.parse(item);
        //         return user.email === email;
        //     } catch (e) {
        //         return false;
        //     }
        // });

        // if (emailExists) {
        //     setError("Email already registered. Please login.");
        //     return;
        // }

        // const newUser = { name, bankName: 'Apna Bank', email, phone, password }; 
        // localStorage.setItem(email, JSON.stringify(newUser));
        
        // localStorage.setItem('currentUser', JSON.stringify(newUser));
        // sessionStorage.setItem('isUnlocked', 'false');

        try{
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/api/auth/signup`,{
                "name":name,
                "email":email,
                "password":password,
                "phone":phone
            })
            console.log("sucesss")
            localStorage.setItem("access_token",response.data.access_token);
            navigate('/unlock'); 
        }catch(err){
            console.log(err);
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError("Registration failed. Please try again.");
            }
        }

        // alert("Registration successful! Proceeding to Account Setup.");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 overflow-hidden relative">
             <div className="grid lg:grid-cols-2 gap-16 max-w-6xl w-full items-center z-10">
                <div className="hidden lg:flex flex-col space-y-8 pl-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center mb-4">
                        <Landmark className="text-white w-10 h-10" />
                    </div>
                    <div className="space-y-2 border-l-4 border-black pl-6">
                        <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                            Join Our <br />Digital Banking
                        </h1>
                        <h2 className="text-2xl font-bold text-gray-900">
                            | Start Your Journey
                        </h2>
                    </div>
                    <p className="text-gray-500 max-w-md leading-relaxed">
                        Create an account in minutes and take control of your finances.
                    </p>
                </div>

                <div className="flex justify-center lg:justify-start w-full">
                    <div className="relative w-full max-w-sm h-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border-8 border-gray-900 flex flex-col">
                        <div className="px-8 pt-10 pb-6 flex flex-col items-center flex-1">
                            <h2 className="text-3xl font-bold text-gray-800 mb-1">Create Account</h2>
                            <p className="text-gray-500 text-sm mb-6">Sign up to get started</p>

                            <form className="w-full space-y-5" onSubmit={handleRegister}>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full border-b border-gray-300 py-2 text-gray-700 focus:outline-none focus:border-red-500 transition-colors bg-transparent"
                                        required
                                    />
                                    <User className="absolute right-0 top-2 text-gray-400 w-5 h-5" />
                                </div>

                                <div className="relative group">
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full border-b border-gray-300 py-2 text-gray-700 focus:outline-none focus:border-red-500 transition-colors bg-transparent"
                                        required
                                    />
                                    <Mail className="absolute right-0 top-2 text-gray-400 w-5 h-5" />
                                </div>

                                <div className="relative group">
                                    <input
                                        type="tel"
                                        placeholder="Phone No. (10 digits)"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        className="w-full border-b border-gray-300 py-2 text-gray-700 focus:outline-none focus:border-red-500 transition-colors bg-transparent"
                                        required
                                    />
                                    <Phone className="absolute right-0 top-2 text-gray-400 w-5 h-5" />
                                </div>

                                <div className="relative group">
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

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
                                        <span className="text-xl font-mono font-bold tracking-widest text-gray-700 select-none px-2">
                                            {captcha}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={generateCaptcha}
                                            className="text-gray-500 hover:text-red-500 transition-colors p-1"
                                        >
                                            <RotateCcw className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter Captcha"
                                        value={userCaptcha}
                                        onChange={(e) => setUserCaptcha(e.target.value)}
                                        className="w-full border-b border-gray-300 py-2 text-gray-700 focus:outline-none focus:border-red-500 transition-colors bg-transparent"
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="text-red-500 text-xs text-center font-medium">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full bg-gray-900 text-white py-3 rounded-lg shadow-xl hover:bg-black transition-transform active:scale-95 font-semibold text-sm tracking-wide"
                                >
                                    REGISTER
                                </button>
                            </form>
                        </div>
                         
                        <div className="w-full pt-8 pb-6 px-8 flex flex-col items-center justify-end z-10 mt-auto">
                            <div className="w-full">
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="w-full bg-gray-100 border border-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                >
                                    Already have an account? Login
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
};

export default Register;

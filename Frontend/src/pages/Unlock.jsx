
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CreditCard, Landmark } from 'lucide-react';
import axios from 'axios'

const Unlock = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [selectedBank, setSelectedBank] = useState('');
    const [inputAccountNo, setInputAccountNo] = useState('');
    const [inputPin, setInputPin] = useState('');
    const [error, setError] = useState('');
    const [accountType, setAccountType] = useState('');
    const [currency, setCurrency] = useState('');

    // useEffect(() => {
    //     const storedUser = localStorage.getItem('currentUser');
    //     if (storedUser) {
    //         setUser(JSON.parse(storedUser));
    //     } else {
    //         navigate('/login');
    //     }
    // }, [navigate]);

    const handleUnlock = async (e) => {
        e.preventDefault();
        setError('');

        if (!selectedBank) {
            setError("Please select your bank.");
            return;
        }

        const pinRegex = /^\d{4}$/;
        if (!pinRegex.test(inputPin)) {
            setError("PIN must be exactly 4 digits.");
            return;
        }
        try{
            const token = localStorage.getItem("access_token");
            const respose = await axios.post("http://localhost:8000/accounts/accounts",{
                "bank_name":selectedBank,
                "account_type":accountType,
                "account_number":inputAccountNo,
                "currency":currency,
                "pin_hash":inputPin

            },{
                headers:{
                    Authorization: `Bearer ${token}`
                }
            })
            
            console.log("success",respose.data);
            navigate('/dashboard');
        }catch(err){
            console.log(err);
        }

        

    };

    // if (!user) return null;

    const isSetup = true;

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full border-4 border-gray-800">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isSetup ? "Account Setup" : "Welcome Back"}
                    </h2>
                    <p className="text-gray-500 text-sm">
                        {isSetup ? "Set up your bank details" : "Enter details to access dashboard"}
                    </p>
                </div>

                <form onSubmit={handleUnlock} className="space-y-6">
                    <div className="relative group">
                        <select
                            value={selectedBank}
                            onChange={(e) => setSelectedBank(e.target.value)}
                            className="w-full border-b border-gray-300 py-2 text-gray-700 focus:outline-none focus:border-blue-500 transition-colors bg-transparent appearance-none cursor-pointer"
                            required
                        >
                            <option value="" disabled>Select Your Bank</option>
                            <option value="Apna Bank">Apna Bank</option>
                            <option value="SBI">SBI</option>
                            <option value="HDFC">HDFC</option>
                            <option value="ICICI">ICICI</option>
                            <option value="Axis Bank">Axis Bank</option>
                        </select>
                        <Landmark className="absolute right-0 top-2 text-gray-400 w-5 h-5 pointer-events-none" />
                    </div>
                    <div className="relative group">
    <select
        value={accountType}
        onChange={(e) => setAccountType(e.target.value)}
        className="w-full border-b border-gray-300 py-2 text-gray-700 focus:outline-none focus:border-blue-500 transition-colors bg-transparent appearance-none cursor-pointer"
        required
    >
        <option value="" disabled>Select Account Type</option>
        <option value="savings">Savings</option>
        <option value="checking">Checking</option>
        <option value="credit_card">Credit Card</option>
        <option value="loan">Loan</option>
        <option value="investment">Investment</option>
    </select>
    <CreditCard className="absolute right-0 top-2 text-gray-400 w-5 h-5 pointer-events-none" />
</div>
<div className="relative group">
    <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="w-full border-b border-gray-300 py-2 text-gray-700 focus:outline-none focus:border-blue-500 transition-colors bg-transparent appearance-none cursor-pointer"
        required
    >
        <option value="" disabled>Select Currency</option>
        <option value="INR">Indian Rupee (₹)</option>
        <option value="USD">US Dollar ($)</option>
        <option value="EUR">Euro (€)</option>
        <option value="GBP">British Pound (£)</option>
        <option value="JPY">Japanese Yen (¥)</option>
    </select>
    <CreditCard className="absolute right-0 top-2 text-gray-400 w-5 h-5 pointer-events-none" />
</div>

                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Account Number"
                            value={inputAccountNo}
                            onChange={(e) => setInputAccountNo(e.target.value)}
                            className="w-full border-b border-gray-300 py-2 text-gray-700 focus:outline-none focus:border-blue-500 transition-colors bg-transparent"
                            required
                        />
                        <CreditCard className="absolute right-0 top-2 text-gray-400 w-5 h-5" />
                    </div>

                    <div className="relative group">
                        <input
                            type="password"
                            placeholder="Enter 4-Digit PIN"
                            value={inputPin}
                            onChange={(e) => setInputPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            maxLength={4}
                            className="w-full border-b border-gray-300 py-2 text-gray-700 focus:outline-none focus:border-blue-500 transition-colors bg-transparent"
                            required
                        />
                        <Shield className="absolute right-0 top-2 text-gray-400 w-5 h-5" />
                    </div>

                    {error && (
                        <div className="text-red-500 text-xs text-center font-medium">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-gray-900 text-white py-4 rounded-xl shadow-xl hover:bg-black transition-transform active:scale-95 font-bold text-sm tracking-widest mt-4"
                    >
                        {isSetup ? "COMPLETE SETUP" : "UNLOCK DASHBOARD"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Unlock;

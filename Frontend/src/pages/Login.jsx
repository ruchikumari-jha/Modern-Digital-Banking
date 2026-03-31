
import React from 'react';
import LoginForm from '../components/LoginForm';
import { Landmark } from 'lucide-react';

const Login = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="grid lg:grid-cols-2 gap-16 max-w-6xl w-full items-center">

                {/* Left Side - Marketing Text */}
                <div className="hidden lg:flex flex-col space-y-8 pl-12">
                    <div className="w-20 h-20 bg-linear-to-br from-red-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center mb-4">
                        <Landmark className="text-white w-10 h-10" />
                    </div>

                    <div className="space-y-2 border-l-4 border-black pl-6">
                        <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                            Digital Banking <br />System
                        </h1>
                        <h2 className="text-2xl font-bold text-gray-900">
                            | Your Money, Your Way
                        </h2>
                    </div>

                    <p className="text-gray-500 max-w-md leading-relaxed">
                        Bank Smarter, Live Better
                        Track every rupee, grow your savings, achieve financial freedom — all in one app.

                    </p>
                </div>

                {/* Right Side - Phone Login Form */}
                <div className="flex justify-center lg:justify-start">
                    <LoginForm />
                </div>

            </div>


        </div>
    );
};

export default Login;

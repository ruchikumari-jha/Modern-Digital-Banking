
import React, { useState,useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import axios from "axios";
import {
    Receipt,
    Plus,
    Search,
    Filter,
    Trash2,
    Edit3,
    CheckCircle,
    Clock,
    X,
    CreditCard,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import { useUser } from '../context/AppContext';

const Bills = () => {
    // Current date for simulation: March 12, 2026
    const today = new Date('2026-03-12');           

   const { user, account } = useUser();
   const [bills, setBills] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [fetchError, setFetchError] = useState(false);
    const getDueStatus = (dueDateStr, status) => {
        if (status === 'Paid') return null;

        const dueDate = new Date(dueDateStr);
        // Normalize dates to midnight for accurate day calculation
        const d1 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const d2 = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

        const diffTime = d2.getTime() - d1.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle };
        if (diffDays === 0) return { text: 'Due Today', color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle };
        if (diffDays === 1) return { text: 'Due Tomorrow', color: 'text-orange-600', bg: 'bg-orange-50', icon: AlertTriangle };
        if (diffDays <= 3) return { text: `Due in ${diffDays} days`, color: 'text-blue-600', bg: 'bg-blue-50', icon: Clock };

        return null;
    };
    useEffect(() => {
      fetchBills();
    }, [user]);

const fetchBills = async () => {
  setIsLoading(true);
  try {
    if (!user) return;
    const res=await axios.get(
        `http://127.0.0.1:8000/bills/user/${user.id}`
    );

    const formatted = res.data.filter(b => b.user_id==user.id).map(b=>({
      id: b.id,
      name: b.biller_name,
      amount: b.amount_due,
      dueDate: b.due_date,
      status: b.status === "paid" ? "Paid" : "Pending",
      autopay: b.auto_pay
    }));

    setBills(formatted);
    setFetchError(false);

  } catch (err) {
    console.error(err);
    setFetchError(true);
  } finally {
    setIsLoading(false);
  }
};

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBill, setEditingBill] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        dueDate: '',
        autopay: false
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (editingBill) {
     
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/bills/${editingBill.id}`,
        {
          biller_name: formData.name,
          due_date: formData.dueDate,
          amount_due: parseFloat(formData.amount),
          auto_pay: formData.autopay
        }
      );
          closeModal();
          fetchBills();

    } else {
    await axios.post(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/bills/`, {
      user_id: user.id,
      account_id: account.id,
      biller_name: formData.name,
      due_date: formData.dueDate,
      amount_due: parseFloat(formData.amount),
      auto_pay: formData.autopay
    });

    fetchBills();   
    closeModal();
    }
  } catch (err) {
    console.error(err);
  }
};

    const openModal = (bill = null) => {
        if (bill) {
            setEditingBill(bill);
            setFormData({
                name: bill.name,
                amount: bill.amount.toString(),
                dueDate: bill.dueDate,
                autopay: bill.autopay
            });
        } else {
            setEditingBill(null);
            setFormData({ name: '', amount: '', dueDate: '', autopay: false });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBill(null);
    };

    const deleteBill = async (id) => {
  try {
    await axios.delete(
      `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/bills/${id}`
    );

    fetchBills();

  } catch (err) {
    console.error(err);
  }
};

   const toggleStatus = async (id) => {
  try {
    await axios.put(
      `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/bills/pay/${id}`
    );

    fetchBills();

  } catch (err) {
    console.error(err);
  }
};

    // Near due bills for alerts (due within 3 days)
    const urgentBills = bills.filter(b => {
        const status = getDueStatus(b.dueDate, b.status);
        return status && (status.text.includes('Today') || status.text.includes('Tomorrow') || status.text.includes('Overdue'));
    });

    return (
        <AppLayout title="Bills & Automations" description="Manage your recurring payments and subscriptions.">
            <div className="max-w-6xl mx-auto w-full">
                {/* Header (optional, if you want specific buttons, otherwise AppLayout handles title) */}
                <header className="flex flex-col md:flex-row md:items-center justify-end gap-4 mb-6 pt-4 md:pt-0">
                    <button
                        onClick={() => openModal()}
                        className="bg-blue-600 dark:bg-amber-600 text-white dark:text-stone-900 rounded-xl px-6 py-3 flex items-center gap-2 shadow-lg hover:bg-blue-700 dark:hover:bg-amber-500 transition-all font-semibold"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add New Bill</span>
                    </button>
                </header>

                {/* Reminder Alerts Section */}
                {urgentBills.length > 0 && (
                    <div className="mb-8 space-y-3">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            Upcoming Bill Reminders
                        </h3>
                        {urgentBills.map(bill => {
                            const dueStatus = getDueStatus(bill.dueDate, bill.status);
                            return (
                                <div key={`alert-${bill.id}`} className={`flex items-center justify-between p-4 rounded-2xl border ${dueStatus.bg.replace('bg-', 'border-')} ${dueStatus.bg} transition-all hover:shadow-sm`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full ${dueStatus.bg.replace('50', '100')} ${dueStatus.color} flex items-center justify-center`}>
                                            <dueStatus.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{bill.name}</p>
                                            <p className={`text-sm font-semibold ${dueStatus.color}`}>{dueStatus.text}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">₹{bill.amount.toFixed(2)}</p>
                                        <button
                                            onClick={() => toggleStatus(bill.id)}
                                            className="ml-2 text-xs font-bold text-blue-600 hover:underline"
                                        >
                                            Mark as Paid
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-stone-800 italic transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Clock className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-gray-500">Upcoming Bills</span>
                        </div>
                        <h2 className="text-2xl font-bold">₹{bills.filter(b => b.status === 'Pending').reduce((acc, b) => acc + b.amount, 0).toFixed(2)}</h2>
                    </div>

                    <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-stone-800 italic transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-gray-500">Paid Monthly</span>
                        </div>
                        <h2 className="text-2xl font-bold">₹{bills.filter(b => b.status === 'paid').reduce((acc, b) => acc + b.amount, 0).toFixed(2)}</h2>
                    </div>

                    <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-stone-800 italic transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-gray-500">Auto-pay Active</span>
                        </div>
                        <h2 className="text-2xl font-bold">{bills.filter(b => b.autopay).length} Bills</h2>
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-gray-100 dark:border-stone-800 overflow-hidden transition-colors">
                    <div className="p-6 border-b border-gray-50 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="font-bold text-gray-800 dark:text-stone-100">Your Bills</h3>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search bills..."
                                    className="pl-10 pr-4 py-2 border border-gray-100 dark:border-stone-700 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-50/50 dark:bg-stone-800 text-sm dark:text-stone-200"
                                />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-800 border border-gray-200 dark:border-stone-700 rounded-lg text-sm text-gray-600 dark:text-stone-300 shadow-sm hover:bg-gray-50 dark:hover:bg-stone-700 transition-colors">
                                <Filter className="w-4 h-4" />
                                <span>Filter</span>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {fetchError ? (
                            <div className="p-12 text-center">
                                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                                <p className="text-gray-700 dark:text-stone-300 font-semibold mb-1">Unable to load bills</p>
                                <p className="text-gray-400 dark:text-stone-500 text-sm">The bills service is temporarily unavailable. Please try again later.</p>
                            </div>
                        ) : isLoading ? (
                            <div className="p-12 text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">Loading bills...</p>
                            </div>
                        ) : bills.length === 0 ? (
                            <div className="p-12 text-center">
                                <Receipt className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">No bills found. Add one to get started!</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-stone-800/50 border-b border-gray-100 dark:border-stone-800 text-xs uppercase text-gray-500 dark:text-stone-400 font-semibold tracking-wider">
                                        <th className="px-6 py-4">Biller Name</th>
                                        <th className="px-6 py-4">Amount Due</th>
                                        <th className="px-6 py-4">Due Date</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Auto-pay</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-stone-800/50">
                                    {bills.map((bill) => {
                                        const dueStatus = getDueStatus(bill.dueDate, bill.status);
                                        let statusBadge = {
                                            text: bill.status,
                                            bg: 'bg-yellow-100',
                                            color: 'text-yellow-700'
                                        };

                                        if (bill.status === 'Paid') {
                                            statusBadge = { text: 'PAID', bg: 'bg-green-100', color: 'text-green-700' };
                                        } else if (dueStatus && dueStatus.text === 'Overdue') {
                                            statusBadge = { text: 'OVERDUE', bg: 'bg-red-100', color: 'text-red-700' };
                                        } else {
                                            statusBadge = { text: 'UPCOMING', bg: 'bg-blue-100', color: 'text-blue-700' };
                                        }

                                        return (
                                            <tr key={bill.id} className="hover:bg-gray-50 dark:hover:bg-stone-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                                            <Receipt className="w-5 h-5" />
                                                        </div>
                                                        <span className="font-semibold text-gray-900 dark:text-stone-100">{bill.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-gray-900 dark:text-stone-100">₹{bill.amount.toFixed(2)}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className={`text-sm ${dueStatus ? 'font-bold ' + dueStatus.color : 'text-gray-500'}`}>
                                                            {bill.dueDate}
                                                        </span>
                                                        {dueStatus && (
                                                            <span className={`text-[10px] font-bold uppercase ${dueStatus.color}`}>
                                                                {dueStatus.text}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => toggleStatus(bill.id)}
                                                        className={`px-3 py-1 rounded-full text-[10px] font-black transition-all border ${statusBadge.bg.replace('bg-', 'border-')} ${statusBadge.bg} ${statusBadge.color} hover:brightness-95`}
                                                    >
                                                        {statusBadge.text}
                                                    </button>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className={`w-10 h-5 rounded-full p-1 transition-colors ${bill.autopay ? 'bg-blue-600' : 'bg-gray-200'}`}>
                                                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${bill.autopay ? 'translate-x-5' : 'translate-x-0'}`} />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openModal(bill)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteBill(bill.id)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-colors">
                        <div className="p-6 border-b border-gray-100 dark:border-stone-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-stone-100">{editingBill ? 'Edit Bill' : 'Add New Bill'}</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-stone-800 rounded-full transition-all">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-stone-300 mb-2">Biller Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Electricity, Netflix"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-stone-300 mb-2">Amount Due (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="amount"
                                        required
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-stone-300 mb-2">Due Date</label>
                                    <input
                                        type="date"
                                        name="dueDate"
                                        required
                                        value={formData.dueDate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium [color-scheme:light] dark:[color-scheme:dark]"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-blue-900">Auto-pay</span>
                                    <span className="text-xs text-blue-600">Pay automatically on due date</span>
                                </div>
                                <input
                                    type="checkbox"
                                    name="autopay"
                                    checked={formData.autopay}
                                    onChange={handleInputChange}
                                    className="w-6 h-6 rounded-md border-blue-200 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all mt-6"
                            >
                                {editingBill ? 'Update Bill' : 'Add Bill'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
};

export default Bills;

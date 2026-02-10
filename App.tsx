
import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Clock, MapPin, Phone, Settings, User, CheckCircle2, XCircle, RefreshCw, Send } from 'lucide-react';
import { DairyInfo, Product, ViewMode } from './types';
import { generateDairyAnnouncement } from './services/geminiService';

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', nameHi: 'ताज़ा दूध', nameEn: 'Fresh Milk', price: '60', unit: 'Litre', available: true },
  { id: '2', nameHi: 'गाढ़ा दही', nameEn: 'Thick Curd', price: '40', unit: '500g', available: true },
  { id: '3', nameHi: 'ताज़ा पनीर', nameEn: 'Fresh Paneer', price: '100', unit: '250g', available: true },
  { id: '4', nameHi: 'शुद्ध घी', nameEn: 'Pure Ghee', price: '650', unit: 'Litre', available: true },
  { id: '5', nameHi: 'मक्खन', nameEn: 'Butter', price: '50', unit: '100g', available: false },
];

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.CUSTOMER);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  
  const [dairy, setDairy] = useState<DairyInfo>(() => {
    const saved = localStorage.getItem('dairy_info');
    return saved ? JSON.parse(saved) : {
      name: "श्री कृष्णा दुध डेयरी",
      owner: "राजेश कुमार",
      contact: "98765-43210",
      address: "मेन रोड, डेरी फार्म कॉलोनी",
      isOpen: true,
      announcement: "हमारे यहाँ शुद्ध दूध और ताज़ा पनीर उपलब्ध है।"
    };
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('dairy_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    localStorage.setItem('dairy_info', JSON.stringify(dairy));
  }, [dairy]);

  useEffect(() => {
    localStorage.setItem('dairy_products', JSON.stringify(products));
  }, [products]);

  const toggleStatus = async () => {
    const newStatus = !dairy.isOpen;
    setDairy(prev => ({ ...prev, isOpen: newStatus }));
    
    setIsGenerating(true);
    const newAnnouncement = await generateDairyAnnouncement(newStatus, dairy.name);
    setDairy(prev => ({ ...prev, announcement: newAnnouncement }));
    setIsGenerating(false);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === '1234') {
      setIsAdminAuth(true);
    } else {
      alert('गलत पासवर्ड (सही पासवर्ड: 1234)');
    }
  };

  const updateProductStatus = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, available: !p.available } : p));
  };

  const generateAITip = async () => {
    setIsGenerating(true);
    const tip = await generateDairyAnnouncement(dairy.isOpen, dairy.name);
    setDairy(prev => ({ ...prev, announcement: tip }));
    setIsGenerating(false);
  };

  // UI Components
  const StatusBanner = () => (
    <div className={`p-8 rounded-2xl text-center shadow-lg transition-all transform hover:scale-[1.02] ${dairy.isOpen ? 'bg-green-500' : 'bg-red-500'} text-white mb-8`}>
      <div className="flex justify-center mb-4">
        {dairy.isOpen ? <CheckCircle2 size={64} className="animate-pulse" /> : <XCircle size={64} />}
      </div>
      <h1 className="text-4xl font-bold mb-2">
        {dairy.isOpen ? 'दुकान खुली है (OPEN)' : 'दुकान बंद है (CLOSED)'}
      </h1>
      <p className="text-xl opacity-90">{dairy.announcement}</p>
    </div>
  );

  const InfoCard = () => (
    <div className="bg-white rounded-xl p-6 shadow-md mb-8">
      <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center">
        <Clock className="mr-2 text-blue-600" /> संपर्क और समय (Contact & Timing)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50">
          <MapPin className="text-blue-600 mt-1 shrink-0" />
          <div>
            <p className="font-semibold text-gray-700">पता (Address)</p>
            <p className="text-gray-600">{dairy.address}</p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50">
          <Phone className="text-blue-600 mt-1 shrink-0" />
          <div>
            <p className="font-semibold text-gray-700">फ़ोन (Phone)</p>
            <p className="text-gray-600">{dairy.contact}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-white p-2 rounded-full">
              <ShoppingCart className="text-blue-700" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl leading-tight">{dairy.name}</h1>
              <p className="text-xs opacity-80 text-blue-100 uppercase tracking-wider">Milk & Fresh Dairy Products</p>
            </div>
          </div>
          <button 
            onClick={() => setViewMode(viewMode === ViewMode.CUSTOMER ? ViewMode.ADMIN : ViewMode.CUSTOMER)}
            className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-full transition-colors text-sm font-medium border border-blue-400"
          >
            {viewMode === ViewMode.CUSTOMER ? (
              <><Settings size={18} /> <span>मालिक पैनल (Admin)</span></>
            ) : (
              <><User size={18} /> <span>ग्राहक दृश्य (Customer View)</span></>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 mt-4">
        {viewMode === ViewMode.CUSTOMER ? (
          <section className="animate-in fade-in duration-500">
            <StatusBanner />
            <InfoCard />
            
            <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
              <ShoppingCart className="mr-2 text-blue-600" /> उपलब्ध उत्पाद (Available Products)
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className={`bg-white rounded-xl shadow-sm overflow-hidden border-t-4 transition-transform hover:translate-y-[-4px] ${product.available ? 'border-green-500' : 'border-gray-300 opacity-60'}`}>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{product.nameHi}</h3>
                      {product.available ? (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">In Stock</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full font-bold">Out of Stock</span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mb-4">{product.nameEn}</p>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-bold text-blue-700">₹{product.price}</span>
                      <span className="text-gray-400 text-sm">/ {product.unit}</span>
                    </div>
                  </div>
                  {!product.available && (
                    <div className="bg-gray-50 text-center py-2 text-sm text-gray-500 font-medium">
                      जल्द ही उपलब्ध होगा
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="animate-in slide-in-from-right duration-500">
            {!isAdminAuth ? (
              <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md mx-auto mt-10 text-center">
                <Settings size={48} className="mx-auto text-blue-600 mb-4" />
                <h2 className="text-2xl font-bold mb-6">मालिक लॉगिन (Admin Login)</h2>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <input 
                    type="password" 
                    placeholder="पासवर्ड दर्ज करें (Hint: 1234)" 
                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                  <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg">
                    लॉगिन करें (Login)
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Admin Quick Controls */}
                <div className="bg-white p-6 rounded-2xl shadow-md border-l-8 border-blue-600">
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                    <Settings className="mr-2" /> मुख्य सेटिंग्स (Main Settings)
                  </h2>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-blue-50 rounded-xl border border-blue-100">
                    <div>
                      <h3 className="text-lg font-bold text-blue-900">दुकान की स्थिति (Shop Status)</h3>
                      <p className="text-gray-600">ग्राहकों को सूचित करें कि दुकान खुली है या नहीं।</p>
                    </div>
                    <button 
                      onClick={toggleStatus}
                      className={`px-8 py-4 rounded-full font-bold text-xl shadow-xl transition-all transform active:scale-95 ${dairy.isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white flex items-center space-x-3`}
                    >
                      {dairy.isOpen ? <><XCircle /> <span>बंद करें (Close Shop)</span></> : <><CheckCircle2 /> <span>खोलें (Open Shop)</span></>}
                    </button>
                  </div>

                  <div className="mt-8">
                    <label className="block text-sm font-bold text-gray-700 mb-2">घोषणा (Announcement Text)</label>
                    <div className="relative">
                      <textarea 
                        className="w-full p-4 border rounded-xl min-h-[100px] bg-gray-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-blue-400"
                        value={dairy.announcement}
                        onChange={(e) => setDairy(prev => ({ ...prev, announcement: e.target.value }))}
                      />
                      <button 
                        onClick={generateAITip}
                        disabled={isGenerating}
                        className="absolute bottom-4 right-4 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center space-x-1"
                        title="AI से नया संदेश लिखें"
                      >
                        {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                        <span className="text-xs font-bold px-1">AI Suggest</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inventory Management */}
                <div className="bg-white p-6 rounded-2xl shadow-md">
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                    <ShoppingCart className="mr-2" /> स्टॉक प्रबंधन (Stock Management)
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b text-gray-400 text-sm uppercase">
                          <th className="pb-4 font-bold">उत्पाद (Product)</th>
                          <th className="pb-4 font-bold">कीमत (Price)</th>
                          <th className="pb-4 font-bold text-center">स्थिति (Status)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {products.map(product => (
                          <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4">
                              <p className="font-bold text-gray-800">{product.nameHi}</p>
                              <p className="text-xs text-gray-400 uppercase">{product.nameEn}</p>
                            </td>
                            <td className="py-4 font-semibold text-blue-700">₹{product.price} / {product.unit}</td>
                            <td className="py-4">
                              <div className="flex justify-center">
                                <button 
                                  onClick={() => updateProductStatus(product.id)}
                                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${product.available ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}
                                >
                                  {product.available ? 'Available' : 'Out of Stock'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer Admin Actions */}
                <div className="flex justify-center pt-6">
                   <button 
                     onClick={() => setIsAdminAuth(false)}
                     className="text-gray-400 hover:text-red-500 transition-colors text-sm underline flex items-center space-x-1"
                   >
                     <User size={14} /> <span>लॉगआउट करें (Logout)</span>
                   </button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Floating Action for Customers */}
      {viewMode === ViewMode.CUSTOMER && (
        <a 
          href={`tel:${dairy.contact}`} 
          className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-2xl flex items-center space-x-2 hover:bg-green-600 transition-transform hover:scale-110 active:scale-95 z-50"
        >
          <Phone size={24} />
          <span className="font-bold hidden sm:inline">अभी कॉल करें</span>
        </a>
      )}

      {/* Footer Decoration */}
      <footer className="mt-12 text-center text-gray-400 py-8 px-4 bg-white/50 border-t border-gray-100">
        <p className="text-sm">© 2024 {dairy.name} - शुद्धता का वादा</p>
        <p className="text-[10px] uppercase tracking-widest mt-1">Made for Local Dairy Business</p>
      </footer>
    </div>
  );
};

export default App;

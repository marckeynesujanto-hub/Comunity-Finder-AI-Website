import React, { useState, useEffect } from 'react';
import { User, Heart, Users, Sparkles, ArrowRight, Activity, Upload, FileText, CheckCircle, Star, Shuffle, Eye, Brain, Lightbulb, X, Link as LinkIcon, ExternalLink, Copy, MessageCircle } from 'lucide-react';

// --- 1. DATA REFERENSI MBTI (Hardcoded dari CSV Reference Anda) ---
const mbtiKnowledgeBase = {
  INTJ: ["Membaca", "Catur", "Strategi Game", "Pemrograman", "Investasi Saham"],
  INTP: ["Coding", "Video Game", "Fisika/Sains", "Debat Filosofi", "Menulis Sci-Fi"],
  ENTJ: ["Public Speaking", "Manajemen Bisnis", "Olahraga Kompetitif", "Networking"],
  ENTP: ["Debat", "Traveling", "Stand-up Comedy", "Entrepreneurship", "Trivia"],
  INFJ: ["Menulis", "Psikologi", "Meditasi", "Museum Seni", "Relawan Sosial"],
  INFP: ["Puisi", "Fotografi", "Musik Indie", "Cosplay", "Daydreaming"],
  ENFJ: ["Mentoring", "Event Organizing", "Memasak", "Klub Buku"],
  ENFP: ["Seni Teater", "Blogging", "Alat Musik", "Festival Musik", "Backpacker"],
  ISTJ: ["Sejarah", "Akuntansi", "Golf", "DIY Perbaikan", "Koleksi Barang"],
  ISFJ: ["Berkebun", "Memasak/Baking", "Kerajinan Tangan", "Menonton Film"],
  ESTJ: ["Organisasi Komunitas", "Olahraga Tim", "Manajemen Proyek", "Acara Amal"],
  ESFJ: ["Hosting Pesta", "Belanja", "Dekorasi Rumah", "Dinamika Sosial"],
  ISTP: ["Otomotif", "Extreme Sports", "Pertukangan", "Teknisi"],
  ISFP: ["Melukis", "Fashion", "Mendaki Gunung", "Fotografi Alam", "Keramik"],
  ESTP: ["Olahraga Ekstrem", "Pesta/Klubbing", "Gadget Baru", "Negosiasi"],
  ESFP: ["Menari", "Performing Arts", "Jalan-jalan Spontan", "Fashion Styling"]
};

// --- 2. DEFAULT DATA STATISTIK ---
const defaultData = [
  { Personality: 'INFJ', Interest: 'Writing' },
  { Personality: 'INFJ', Interest: 'Psychology' },
  { Personality: 'INTJ', Interest: 'Programming' },
  { Personality: 'INTJ', Interest: 'Chess' },
  { Personality: 'ENTP', Interest: 'Debating' },
  { Personality: 'ENTP', Interest: 'Entrepreneurship' },
  { Personality: 'INFP', Interest: 'Poetry' },
  { Personality: 'INFP', Interest: 'Art' },
  { Personality: 'ENFP', Interest: 'Traveling' },
  { Personality: 'ISTJ', Interest: 'Accounting' },
  { Personality: 'ESTP', Interest: 'Sports' },
  { Personality: 'ESFJ', Interest: 'Cooking' },
  { Personality: 'ISTP', Interest: 'Mechanics' },
  { Personality: 'ISFP', Interest: 'Design' },
  { Personality: 'ESTJ', Interest: 'Management' },
  { Personality: 'ENTJ', Interest: 'Leadership' },
  { Personality: 'UNKNOWN', Interest: 'Reading' }
];

export default function App() {
  // --- STATE ---
  const [formData, setFormData] = useState({
    personality: '',
    age: '',
    gender: 'Male',
    introversionScore: 5,
    sensingScore: 5,
    thinkingScore: 5
  });

  const [dataset, setDataset] = useState(defaultData);
  const [isCustomData, setIsCustomData] = useState(false);
  const [fileName, setFileName] = useState('');

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // State untuk Modal/Popup
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // --- HELPER: Parsing CSV Statistik ---
  const parseCSV = (text) => {
    const lines = text.split('\n');
    const newDataset = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const cols = line.split(',');
        if (cols.length >= 9) {
          const interest = cols[7]?.trim();
          const personality = cols[8]?.trim();
          if (interest && personality) {
            newDataset.push({
              Interest: interest,
              Personality: personality.toUpperCase()
            });
          }
        }
      }
    }
    return newDataset;
  };

  // --- EFFECT: Load CSV Otomatis ---
  useEffect(() => {
    const loadPublicCSV = async () => {
      try {
        const response = await fetch('/data.csv');
        if (response.ok) {
          const text = await response.text();
          const parsedData = parseCSV(text);
          if (parsedData.length > 0) {
            setDataset(parsedData);
            setIsCustomData(true);
            setFileName('data.csv (Otomatis)');
            console.log(`Berhasil memuat ${parsedData.length} data statistik.`);
          }
        }
      } catch (error) {
        console.error("Gagal memuat CSV:", error);
      }
    };
    loadPublicCSV();
  }, []);

  const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const newDataset = parseCSV(text);
      if (newDataset.length > 0) {
        setDataset(newDataset);
        setIsCustomData(true);
        alert(`Berhasil memuat ${newDataset.length} data statistik dari CSV!`);
      } else {
        alert("Gagal membaca data statistik.");
      }
    };
    reader.readAsText(file);
  };

  // --- LOGIC UTAMA: Get Recommendations (1 Stat + 2 Ref) ---
  const getRecommendations = (personalityInput) => {
    const personality = personalityInput.toUpperCase();
    
    // 1. CARI TOP MATCH (Berdasarkan Data Statistik)
    const filtered = dataset.filter(item => item.Personality === personality);
    
    let topInterest = "General Interest";
    if (filtered.length > 0) {
      const counts = {};
      filtered.forEach(item => {
        const cleanInterest = item.Interest.replace(/['"]+/g, '');
        counts[cleanInterest] = (counts[cleanInterest] || 0) + 1;
      });
      
      const sortedInterests = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      topInterest = sortedInterests[0][0];
      
      if ((topInterest === 'Unknown' || topInterest === 'Others') && sortedInterests.length > 1) {
        topInterest = sortedInterests[1][0];
      }
    }

    // 2. CARI 2 HOBI AWAL (Berdasarkan Knowledge Base MBTI)
    const standardHobbies = mbtiKnowledgeBase[personality] || ["Membaca", "Traveling", "Musik"];
    
    let refHobbies = standardHobbies.filter(h => h.toLowerCase() !== topInterest.toLowerCase());
    const selectedRefHobbies = refHobbies.slice(0, 2);
    if (selectedRefHobbies.length < 2 && refHobbies.length > 2) {
        selectedRefHobbies.push(refHobbies[2]);
    }

    // 3. GABUNGKAN
    const finalOptions = [
      { interest: topInterest, type: 'statistical', label: 'Pilihan Data' },
      ...selectedRefHobbies.map(i => ({ interest: i, type: 'reference', label: 'Saran MBTI' }))
    ];

    return shuffleArray(finalOptions);
  };

  const generateDescription = (interestObj, age, gender, score) => {
    const { interest, type, label } = interestObj;
    let introCategory, introFocus;

    if (score <= 4) {
      introCategory = "Ekstrovert";
      introFocus = "Diskusi grup & Meetup.";
    } else if (score <= 7) {
      introCategory = "Fleksibel";
      introFocus = "Santai & Casual.";
    } else {
      introCategory = "Introvert";
      introFocus = "Fokus & Online.";
    }

    let ageFocus = age <= 25 ? "Tren Terbaru" : "Profesional";

    // Generate Slug untuk Link Palsu
    const slug = interest.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const mockLink = `https://komunitas.id/invite/${slug}-${Math.floor(Math.random() * 1000)}`;

    return {
      title: `Komunitas ${interest}`,
      interest: interest,
      introCategory,
      introFocus,
      ageFocus,
      type,
      label,
      mockLink // Link palsu ditambahkan ke objek hasil
    };
  };

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!formData.personality || !formData.age) {
      alert("Mohon lengkapi Kepribadian dan Usia!");
      return;
    }
    setLoading(true);
    setResults(null);
    setTimeout(() => {
      const recommendationOptions = getRecommendations(formData.personality);
      const generatedResults = recommendationOptions.map(opt => 
        generateDescription(opt, parseInt(formData.age), formData.gender, formData.introversionScore)
      );
      setResults(generatedResults);
      setLoading(false);
    }, 800);
  };

  // Fungsi Buka Modal
  const openLinkModal = (result) => {
    setSelectedInterest(result);
    setShowModal(true);
  };

  // Fungsi Tutup Modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedInterest(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 p-4 md:p-8 relative">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <Users className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Community Matchmaker
          </h1>
          <p className="text-gray-500 text-lg">Temukan circle yang pas dengan vibe kamu.</p>
        </header>

        {/* CSV Status */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="bg-white p-2 rounded-lg shadow-sm">
                <FileText className="w-6 h-6 text-indigo-600" />
             </div>
             <div>
               <h3 className="font-semibold text-indigo-900">Database Pengetahuan</h3>
               <p className="text-xs text-indigo-600">
                 {isCustomData ? `Sumber: ${fileName}` : "Sumber: Data Simulasi"}
               </p>
             </div>
          </div>
          <div className="relative">
            <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <button className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition shadow-sm ${isCustomData ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-white hover:bg-gray-50 text-indigo-600 border border-indigo-200'}`}>
              {isCustomData ? <CheckCircle className="w-4 h-4"/> : <Upload className="w-4 h-4"/>}
              {isCustomData ? 'Data Aktif' : 'Upload Data'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> Data Profil
            </h2>
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Kepribadian (MBTI)</label>
                  <input type="text" placeholder="Contoh: INFJ, ENTP" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition outline-none" value={formData.personality} onChange={(e) => setFormData({...formData, personality: e.target.value})} maxLength={4} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Usia</label>
                    <input type="number" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} >
                      <option value="Male">Pria</option>
                      <option value="Female">Wanita</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-2"></div>
              {/* Sliders */}
              <div>
                <div className="flex justify-between items-center mb-1"><label className="text-sm font-medium text-gray-700 flex items-center gap-1"><Activity className="w-4 h-4 text-blue-500"/> Introversi</label><span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 rounded">{formData.introversionScore}</span></div>
                <input type="range" min="1" max="10" step="0.5" className="w-full h-2 bg-gray-200 rounded-lg accent-blue-600" value={formData.introversionScore} onChange={(e) => setFormData({...formData, introversionScore: parseFloat(e.target.value)})} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1"><label className="text-sm font-medium text-gray-700 flex items-center gap-1"><Eye className="w-4 h-4 text-emerald-500"/> Sensing</label><span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 rounded">{formData.sensingScore}</span></div>
                <input type="range" min="1" max="10" step="0.5" className="w-full h-2 bg-gray-200 rounded-lg accent-emerald-600" value={formData.sensingScore} onChange={(e) => setFormData({...formData, sensingScore: parseFloat(e.target.value)})} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1"><label className="text-sm font-medium text-gray-700 flex items-center gap-1"><Brain className="w-4 h-4 text-rose-500"/> Thinking</label><span className="text-xs font-bold bg-rose-100 text-rose-700 px-2 rounded">{formData.thinkingScore}</span></div>
                <input type="range" min="1" max="10" step="0.5" className="w-full h-2 bg-gray-200 rounded-lg accent-rose-600" value={formData.thinkingScore} onChange={(e) => setFormData({...formData, thinkingScore: parseFloat(e.target.value)})} />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-3 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 group mt-4">
                {loading ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : <><Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" /> Analisis Profil</>}
              </button>
            </form>
          </div>

          {/* Result Section */}
          <div className="lg:col-span-8">
            {!results && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl p-10 bg-gray-50/50 min-h-[400px]">
                <Activity className="w-16 h-16 mb-4 opacity-20" />
                <p>Isi data di sebelah kiri untuk melihat 3 rekomendasi terbaik.</p>
              </div>
            )}
            {loading && (
              <div className="h-full flex flex-col items-center justify-center p-10 min-h-[400px]">
                <div className="animate-bounce mb-4 text-blue-500"><Heart className="w-12 h-12 fill-current" /></div>
                <p className="text-gray-500 animate-pulse">Mencari komunitas terbaik...</p>
              </div>
            )}
            {results && !loading && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Shuffle className="w-5 h-5 text-blue-600" /> 3 Rekomendasi Pilihan</h3>
                  <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-500">Urutan diacak</span>
                </div>
                
                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {results.map((res, idx) => (
                    <div key={idx} className={`relative flex flex-col bg-white rounded-2xl p-5 shadow-sm border transition-all hover:-translate-y-1 hover:shadow-md ${res.type === 'statistical' ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-100'}`}>
                      <div className={`absolute -top-3 left-4 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1 ${res.type === 'statistical' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {res.type === 'statistical' ? <Star className="w-3 h-3 fill-current" /> : <Lightbulb className="w-3 h-3" />}
                        {res.label}
                      </div>
                      <div className="mb-4 mt-3">
                        <h4 className="text-lg font-bold text-gray-900 leading-tight mb-1">{res.interest}</h4>
                        <p className="text-xs text-blue-600 font-medium bg-blue-50 inline-block px-2 py-0.5 rounded-md">{res.introCategory}</p>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="text-sm text-gray-600"><p className="text-xs text-gray-400 mb-0.5 uppercase tracking-wide">Vibe</p>{res.introFocus}</div>
                        <div className="text-sm text-gray-600"><p className="text-xs text-gray-400 mb-0.5 uppercase tracking-wide">Fokus ({formData.age}th)</p>{res.ageFocus}</div>
                      </div>
                      <div className="mt-5 pt-4 border-t border-gray-50">
                        {/* TOMBOL LIHAT DETAIL (MEMBUKA MODAL) */}
                         <button 
                           onClick={() => openLinkModal(res)}
                           className="w-full py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 text-gray-600 transition flex items-center justify-center gap-2 group"
                         >
                           Lihat Link <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL / POPUP LINK --- */}
      {showModal && selectedInterest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative">
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium bg-blue-500/30 px-2 py-1 rounded text-blue-50 border border-blue-400/30">
                  Undangan Eksklusif
                </span>
              </div>
              <h3 className="text-2xl font-bold">Gabung Komunitas</h3>
              <p className="text-blue-100 text-sm mt-1">Anda cocok dengan grup {selectedInterest.interest}!</p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-6 text-center">
                <p className="text-gray-600 text-sm mb-4">
                  Berdasarkan profil {formData.personality} Anda, kami mengundang Anda untuk bergabung ke server privat ini:
                </p>
                
                {/* Mock Link Box */}
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 flex items-center justify-between group hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600 font-mono truncate">
                      {selectedInterest.mockLink}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                        navigator.clipboard.writeText(selectedInterest.mockLink);
                        alert("Link tersalin!");
                    }}
                    className="p-1.5 hover:bg-white rounded-md transition text-gray-500 hover:text-blue-600"
                    title="Salin Link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                   onClick={() => alert(`Mengarahkan ke ${selectedInterest.mockLink}...`)}
                   className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                  Buka Link Undangan <ExternalLink className="w-4 h-4" />
                </button>
                <button 
                  onClick={closeModal}
                  className="w-full py-3 text-gray-500 font-medium hover:text-gray-800 transition"
                >
                  Nanti Saja
                </button>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-3 text-center border-t border-gray-100">
               <p className="text-xs text-gray-400">
                 Link ini berlaku selama 24 jam untuk profil {formData.personality}.
               </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

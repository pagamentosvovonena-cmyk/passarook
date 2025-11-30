
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HashRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { 
  Heart, 
  Plus, 
  Activity, 
  BookOpen, 
  ChevronRight, 
  Lock, 
  ArrowLeft, 
  Check, 
  AlertTriangle,
  Info,
  Pencil,
  FileText,
  Calendar,
  Eye,
  Camera,
  Bell,
  Scale,
  Feather,
  ClipboardList,
  Share2,
  Image as ImageIcon,
  Upload,
  Download,
  BarChart3,
  Trash2,
  Loader2,
  Star,
  X,
  CheckCircle2
} from 'lucide-react';
import { 
  Bird, 
  HealthStatus, 
  SPECIES_OPTIONS, 
  HEALTH_QUESTIONS, 
  Severity,
  HealthLog,
  Article,
  QuestionOption,
  AdvancedRecord
} from './types';
import BirdIcon from './birdIcon';

// --- Constants & Styles ---
const COLORS = {
  bg: 'bg-[#FFFDE7]', // Beige Light
  white: 'bg-white',
  green: 'bg-[#4CAF50]',
  yellow: 'bg-[#FFEB3B]',
  red: 'bg-[#F44336]',
  textGreen: 'text-[#4CAF50]',
  textYellow: 'text-[#FBC02D]', // Darker yellow for text readability
  textRed: 'text-[#F44336]',
};

// --- Mock Data ---
const ARTICLES_DATA: Article[] = [
  {
    id: '1',
    title: 'Sinais de Alerta na Saúde',
    category: 'Prevenção',
    preview: 'Saiba identificar quando seu pássaro precisa de ajuda veterinária imediata.',
    content: 'Observar seu pássaro diariamente é a melhor prevenção. Sinais como penas eriçadas constantemente, dormir no fundo da gaiola, respiração ofegante ou com cauda balançando, e mudanças nas fezes são indicativos sérios de doença. O sistema de semáforo deste app ajuda a categorizar esses sinais, mas a intuição do tutor é fundamental. Se notar apatia ou falta de apetite por mais de 24h, procure um especialista.'
  },
  {
    id: '2',
    title: 'Nutrição Balanceada',
    category: 'Alimentação',
    preview: 'Sementes não são tudo! Descubra como diversificar a dieta.',
    content: 'Muitos criadores oferecem apenas sementes, mas isso pode causar obesidade e deficiências vitamínicas. Uma dieta ideal inclui ração extrusada de boa qualidade (cerca de 60-70% da dieta), sementes limpas com moderação, e vegetais frescos como couve, jiló e milho verde. Evite abacate, chocolate e sementes de frutas, que são tóxicos.'
  },
  {
    id: '3',
    title: 'Higiene da Gaiola',
    category: 'Cuidados',
    preview: 'A limpeza correta evita ácaros e doenças respiratórias.',
    content: 'A gaiola deve ser limpa diariamente (troca de papel/fundo) e lavada completamente uma vez por semana. Bebedouros devem ser esfregados todos os dias para evitar limo e bactérias. Poleiros de madeira devem ser higienizados ou trocados regularmente. O acúmulo de fezes traz doenças como coccidiose.'
  },
  {
    id: '4',
    title: 'A Muda de Penas',
    category: 'Fisiologia',
    preview: 'O que esperar e como cuidar durante este período delicado.',
    content: 'A muda é um processo natural de renovação das penas que ocorre geralmente uma vez ao ano. O pássaro pode ficar mais quieto e parar de cantar. É essencial reforçar a alimentação com vitaminas e evitar correntes de ar. Não force o canto ou manuseio excessivo nesta fase.'
  },
  {
    id: '5',
    title: 'Enriquecimento Ambiental',
    category: 'Bem-estar',
    preview: 'Brinquedos e desafios mentais para um pássaro feliz.',
    content: 'Pássaros são animais inteligentes e precisam de estímulo. Gaiolas vazias geram estresse e bicagem de penas. Ofereça brinquedos de madeira, corda (segura), e desafios para buscar comida. Mude a disposição dos poleiros periodicamente para exercitar a musculatura.'
  }
];

// --- Utils ---
const generateId = () => Math.random().toString(36).substr(2, 9);

const calculateHealthStatus = (answers: Record<string, QuestionOption>): HealthStatus => {
  let mildCount = 0;
  let severeCount = 0;

  Object.values(answers).forEach((option) => {
    if (option.severity === Severity.MILD) mildCount++;
    if (option.severity === Severity.SEVERE) severeCount++;
  });

  if (severeCount > 0 || mildCount >= 3) return HealthStatus.RED;
  if (mildCount > 0) return HealthStatus.YELLOW;
  return HealthStatus.GREEN;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// --- Components ---

const Button = ({ onClick, children, variant = 'primary', className = '', disabled = false }: any) => {
  const baseStyle = "w-full py-3 rounded-2xl font-semibold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2";
  const variants: any = {
    primary: "bg-[#4CAF50] text-white hover:bg-[#43A047]",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
    danger: "bg-[#F44336] text-white hover:bg-[#D32F2F]",
    outline: "border-2 border-[#4CAF50] text-[#4CAF50] bg-transparent"
  };
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      type={onClick ? "button" : "submit"}
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const AdBanner = () => (
  <div className="w-full bg-gray-200 h-14 mt-4 flex items-center justify-center text-gray-500 text-xs rounded-lg border border-gray-300">
    <span className="mr-2 px-1 border border-gray-400 rounded text-[10px]">AD</span>
    Melhores Rações para seu Pássaro - Compre Agora
  </div>
);

// New Simplistic Feature Flag Toast Modal
const ComingSoonModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000); // Auto close after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 w-max max-w-[90%] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gray-900/95 backdrop-blur-md text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-gray-700/50">
        <Star className="text-yellow-400 w-5 h-5 fill-yellow-400 shrink-0" />
        <span className="font-medium text-sm text-center">✨ Função Premium — disponível em breve!</span>
      </div>
    </div>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-red-500 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 text-sm">{message}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} className="flex-1">
            Excluir
          </Button>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status, size = 'md' }: { status: HealthStatus, size?: 'sm'|'md'|'lg'|'xl' }) => {
  const colorMap = {
    [HealthStatus.GREEN]: COLORS.green,
    [HealthStatus.YELLOW]: COLORS.yellow,
    [HealthStatus.RED]: COLORS.red,
  };
  
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-8 h-8", 
    lg: "w-12 h-12",
    xl: "w-48 h-48",
  };

  return (
    <div className={`rounded-full shadow-inner border-2 border-white/20 ${colorMap[status]} ${sizeClasses[size]} transition-colors duration-500 flex items-center justify-center relative`}>
      {size === 'xl' && (
        <Heart className="w-20 h-20 text-white/90 animate-pulse" fill="currentColor" />
      )}
      {size === 'md' && (
        <Heart 
          className={`w-4 h-4 text-white ${status === HealthStatus.GREEN ? 'animate-pulse' : ''}`} 
          fill="currentColor" 
        />
      )}
    </div>
  );
};

// Optimized List Item for Home Screen
const BirdListItem = React.memo(({ bird, onNavigate, onEdit, onDelete }: { bird: Bird, onNavigate: (path: string) => void, onEdit: (id: string) => void, onDelete: (id: string) => void }) => {
  return (
    <div 
      onClick={() => onNavigate(`/bird/${bird.id}`)}
      className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between active:scale-98 transition-transform cursor-pointer relative group animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-100">
          {bird.photo ? (
            <img src={bird.photo} alt={bird.name} className="w-full h-full object-cover" />
          ) : (
            <BirdIcon className="text-gray-400" size={24} />
          )}
        </div>
        <div>
          <h3 className="font-bold text-gray-800">{bird.name}</h3>
          <p className="text-xs text-gray-500">{bird.species}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <StatusBadge status={bird.status} />
        <div className="flex gap-1">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(`/bird/${bird.id}`);
            }}
            className="p-2 text-blue-500 hover:text-blue-700 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(bird.id);
            }}
            className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Pencil size={16} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(bird.id);
            }}
            className="p-2 text-red-400 hover:text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
});

// --- Screens ---

const Onboarding = () => {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      title: "Cuide do seu amigo de penas",
      desc: "Monitoramento simples e eficiente para garantir a saúde do seu pássaro.",
      icon: <Heart className="w-24 h-24 text-[#4CAF50]" />
    },
    {
      title: "Sistema Semáforo",
      desc: "Verde, Amarelo ou Vermelho. Saiba exatamente quando agir.",
      icon: <Activity className="w-24 h-24 text-[#FFEB3B]" />
    }
  ];

  return (
    <div className={`min-h-screen ${COLORS.bg} flex flex-col justify-between p-6`}>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="mb-8 p-8 bg-white rounded-full shadow-lg">
          {slides[slide].icon}
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{slides[slide].title}</h1>
        <p className="text-gray-600 max-w-xs">{slides[slide].desc}</p>
      </div>
      
      <div className="w-full">
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${i === slide ? 'w-8 bg-[#4CAF50]' : 'w-2 bg-gray-300'}`} />
          ))}
        </div>
        
        {slide < slides.length - 1 ? (
          <Button onClick={() => setSlide(slide + 1)}>Próximo</Button>
        ) : (
          <Button onClick={() => {
            localStorage.setItem('onboarded', 'true');
            navigate('/home');
          }}>Começar</Button>
        )}
      </div>
    </div>
  );
};

const Home = ({ birds, onDelete, isPremium, toggleModal }: any) => {
  const navigate = useNavigate();
  
  // Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState(5);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [birdToDelete, setBirdToDelete] = useState<string | null>(null);

  const visibleBirds = birds.slice(0, visibleCount);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting && visibleCount < birds.length) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setVisibleCount(prev => prev + 5);
          setIsLoadingMore(false);
        }, 300); // Reduced latency for snappier feel
      }
    }, {
      root: null,
      rootMargin: "50px", // Trigger slightly before reaching bottom
      threshold: 0.1
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [birds.length, visibleCount]);

  const handleAddBird = () => {
    // Lock: Max 1 bird for free users
    if (!isPremium && birds.length >= 1) {
      toggleModal();
    } else {
      navigate('/add-bird');
    }
  };

  const confirmDelete = () => {
    if (birdToDelete) {
      onDelete(birdToDelete);
      setBirdToDelete(null);
    }
  };

  // Memoized handlers to prevent re-renders of BirdListItem
  const handleNavigate = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const handleEdit = useCallback((id: string) => {
    navigate(`/edit-bird/${id}`);
  }, [navigate]);

  const handleDeleteRequest = useCallback((id: string) => {
    setBirdToDelete(id);
  }, []);

  return (
    <div className={`min-h-screen ${COLORS.bg} pb-20`}>
      <header className="bg-white p-6 rounded-b-3xl shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Meus Pássaros</h1>
            <p className="text-sm text-gray-500">Olá, Passarinheiro!</p>
          </div>
          <div className="w-10 h-10 bg-[#FFFDE7] rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-[#4CAF50]" fill="#4CAF50"/>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-4">
        {birds.length === 0 ? (
          <div className="text-center py-10 opacity-60">
            <p>Nenhum pássaro cadastrado.</p>
            <p className="text-sm">Clique no + para começar.</p>
          </div>
        ) : (
          <>
            {visibleBirds.map((bird: Bird) => (
              <BirdListItem 
                key={bird.id}
                bird={bird}
                onNavigate={handleNavigate}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
              />
            ))}
            
            {visibleCount < birds.length && (
              <div ref={loaderRef} className="py-4 flex justify-center w-full">
                {isLoadingMore ? (
                  <Loader2 className="animate-spin text-[#4CAF50]" />
                ) : (
                  <span className="text-xs text-gray-400">Carregando mais...</span>
                )}
              </div>
            )}
          </>
        )}

        {/* Library Card */}
        <div 
          onClick={() => navigate('/library')}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-md text-white flex items-center justify-between cursor-pointer mt-6 active:scale-95 transition-transform"
        >
          <div>
            <h3 className="font-bold flex items-center gap-2">
              <BookOpen size={18} /> Biblioteca de Saúde
            </h3>
            <p className="text-xs opacity-90">Guias e artigos exclusivos</p>
          </div>
          {isPremium ? <ChevronRight /> : <Lock size={18} />}
        </div>
      </div>

      {!isPremium && (
        <div className="px-6">
          <AdBanner />
        </div>
      )}

      <button 
        onClick={handleAddBird}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#4CAF50] rounded-full shadow-lg flex items-center justify-center text-white hover:bg-[#43A047] active:scale-90 transition-all z-10"
      >
        <Plus size={28} />
      </button>

      <ConfirmationModal 
        isOpen={!!birdToDelete}
        onClose={() => setBirdToDelete(null)}
        onConfirm={confirmDelete}
        title="Excluir Pássaro?"
        message="Esta ação não pode ser desfeita. Todo o histórico de saúde será perdido."
      />
    </div>
  );
};

const AddBird = ({ onAdd }: any) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ name: '', species: '', age: '', acquireDate: '', photo: '' });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setForm({ ...form, photo: base64 });
      } catch (err) {
        alert("Erro ao carregar imagem");
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    
    const speciesValue = form.species || 'Outro';

    const newBird: Bird = {
      id: generateId(),
      ...form,
      species: speciesValue,
      status: HealthStatus.GREEN,
      lastUpdate: new Date().toISOString()
    };
    onAdd(newBird);
    navigate('/home');
  };

  return (
    <div className={`min-h-screen bg-white`}>
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="mb-6 text-gray-500">
          <ArrowLeft />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Novo Pássaro</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative group cursor-pointer" onClick={triggerFileInput}>
              <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${form.photo ? 'border-[#4CAF50]' : 'border-gray-100'} flex items-center justify-center bg-gray-50 transition-all duration-300 shadow-sm`}>
                {form.photo ? (
                  <img src={form.photo} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <ImageIcon size={32} strokeWidth={1.5} />
                  </div>
                )}
              </div>
              
              {form.photo ? (
                <div className="absolute top-1 right-1 bg-[#4CAF50] text-white p-1.5 rounded-full shadow-md animate-in zoom-in duration-200">
                  <Check size={14} strokeWidth={3} />
                </div>
              ) : (
                <div className="absolute bottom-0 right-0 bg-[#4CAF50] text-white p-2 rounded-full shadow-md">
                  <Plus size={16} />
                </div>
              )}
            </div>

            <button 
              type="button"
              onClick={triggerFileInput}
              className="mt-4 flex items-center gap-2 text-[#4CAF50] font-semibold text-sm bg-green-50 px-4 py-2 rounded-full hover:bg-green-100 transition-colors"
            >
              <Upload size={16} />
              {form.photo ? "Alterar Foto" : "Escolher Foto"}
            </button>
            
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handlePhotoUpload} 
              className="hidden"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input 
              type="text" 
              required
              className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#4CAF50]"
              placeholder="Ex: Piu-Piu"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Espécie</label>
            <input 
              list="species-list"
              className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#4CAF50]"
              value={form.species}
              onChange={e => setForm({...form, species: e.target.value})}
              placeholder="Digite ou selecione..."
            />
            <datalist id="species-list">
              {SPECIES_OPTIONS.map(opt => <option key={opt} value={opt} />)}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
            <input 
              type="text" 
              className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#4CAF50]"
              placeholder="Ex: 2 anos"
              value={form.age}
              onChange={e => setForm({...form, age: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Aquisição</label>
            <input 
              type="date" 
              className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#4CAF50]"
              value={form.acquireDate}
              onChange={e => setForm({...form, acquireDate: e.target.value})}
            />
          </div>

          <div className="pt-4">
            <Button>Salvar Pássaro</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditBird = ({ birds, onEdit, onDelete }: any) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const birdToEdit = birds.find((b: Bird) => b.id === id);
  
  const [form, setForm] = useState({ name: '', species: '', age: '', acquireDate: '', photo: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!birdToEdit) {
      navigate('/home', { replace: true });
    }
  }, [birdToEdit, navigate]);

  useEffect(() => {
    if (birdToEdit) {
      setForm({
        name: birdToEdit.name,
        species: birdToEdit.species,
        age: birdToEdit.age,
        acquireDate: birdToEdit.acquireDate,
        photo: birdToEdit.photo || ''
      });
    }
  }, [birdToEdit]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setForm({ ...form, photo: base64 });
      } catch (err) {
        alert("Erro ao carregar imagem");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !birdToEdit) return;
    
    onEdit(birdToEdit.id, form);
    navigate('/home');
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (birdToEdit) {
      onDelete(birdToEdit.id);
      // Navigation handled by the useEffect that checks for bird existence
    }
  };

  if (!birdToEdit) return null;

  return (
    <div className={`min-h-screen bg-white`}>
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="mb-6 text-gray-500">
          <ArrowLeft />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Pássaro</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                {form.photo ? (
                  <img src={form.photo} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="text-gray-400" />
                )}
              </div>
              <div className="absolute bottom-0 right-0 bg-[#4CAF50] text-white p-1 rounded-full text-xs">
                <Pencil size={12}/>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input 
              type="text" 
              required
              className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#4CAF50]"
              placeholder="Ex: Piu-Piu"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Espécie</label>
            <input 
              list="species-list-edit"
              className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#4CAF50]"
              value={form.species}
              onChange={e => setForm({...form, species: e.target.value})}
              placeholder="Digite ou selecione..."
            />
            <datalist id="species-list-edit">
              {SPECIES_OPTIONS.map(opt => <option key={opt} value={opt} />)}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
            <input 
              type="text" 
              className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#4CAF50]"
              placeholder="Ex: 2 anos"
              value={form.age}
              onChange={e => setForm({...form, age: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Aquisição</label>
            <input 
              type="date" 
              className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#4CAF50]"
              value={form.acquireDate}
              onChange={e => setForm({...form, acquireDate: e.target.value})}
            />
          </div>

          <div className="pt-4 space-y-4">
            <Button>Salvar Alterações</Button>
            <Button 
              variant="danger" 
              onClick={handleDelete}
              type="button"
            >
              Excluir Pássaro
            </Button>
          </div>
        </form>
      </div>

      <ConfirmationModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Excluir Pássaro?"
        message="Esta ação não pode ser desfeita. Todo o histórico de saúde será perdido."
      />
    </div>
  );
};

const ReminderSettings = ({ isPremium, toggleModal }: any) => {
  const navigate = useNavigate();
  const [time, setTime] = useState(localStorage.getItem('reminderTime') || '08:00');
  const [enabled, setEnabled] = useState(localStorage.getItem('reminderEnabled') === 'true');

  const handleSave = () => {
    // Lock: Custom Alerts are Premium
    if (!isPremium) {
      toggleModal();
      return;
    }

    if (enabled) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          localStorage.setItem('reminderTime', time);
          localStorage.setItem('reminderEnabled', 'true');
          alert(`Lembrete definido para ${time}`);
          navigate(-1);
        } else {
          alert("Precisamos de permissão para enviar notificações.");
        }
      });
    } else {
      localStorage.setItem('reminderEnabled', 'false');
      navigate(-1);
    }
  };

  return (
    <div className={`min-h-screen ${COLORS.bg} p-6`}>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="text-gray-600">
          <ArrowLeft />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Lembretes Diários</h1>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Ativar Lembretes</span>
          <button 
            onClick={() => setEnabled(!enabled)}
            className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-[#4CAF50]' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${enabled ? 'left-6.5' : 'left-0.5'}`} style={{left: enabled ? '26px' : '2px'}} />
          </button>
        </div>

        {enabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Horário do Check-up</label>
            <input 
              type="time" 
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-xl text-lg text-center font-bold text-gray-800 focus:ring-2 focus:ring-[#4CAF50]"
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Você receberá uma notificação neste horário.
            </p>
          </div>
        )}

        <Button onClick={handleSave} className="mt-4">
          Salvar Configuração { !isPremium && <Lock size={16} className="ml-2"/> }
        </Button>
      </div>
    </div>
  );
};

const AdvancedRecordsScreen = ({ birds, onAddRecord, isPremium, toggleModal }: any) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const bird = birds.find((b: Bird) => b.id === id);
  const [form, setForm] = useState({ weight: '', isMolting: false, event: '' });

  // Redirect if not premium (though entry should be blocked)
  useEffect(() => {
    if(!isPremium) {
       toggleModal();
       navigate(-1);
    }
  }, [isPremium, navigate, toggleModal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bird) return;
    
    const record: AdvancedRecord = {
      id: generateId(),
      birdId: bird.id,
      date: new Date().toISOString(),
      weight: form.weight,
      isMolting: form.isMolting,
      event: form.event
    };
    
    onAddRecord(record);
    navigate(`/bird/${bird.id}`);
  };

  if (!isPremium || !bird) return null;

  return (
    <div className={`min-h-screen bg-white p-6`}>
      <button onClick={() => navigate(-1)} className="mb-6 text-gray-500">
        <ArrowLeft />
      </button>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
         <ClipboardList className="text-[#4CAF50]"/> Registros Avançados
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Peso (gramas)</label>
          <div className="relative">
             <input 
               type="number" 
               className="w-full p-3 pl-10 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#4CAF50]"
               placeholder="Ex: 25"
               value={form.weight}
               onChange={e => setForm({...form, weight: e.target.value})}
             />
             <Scale className="absolute left-3 top-3.5 text-gray-400" size={18}/>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
             <Feather className="text-gray-500"/>
             <span className="font-medium text-gray-700">Muda de Penas</span>
          </div>
          <button 
            type="button"
            onClick={() => setForm({...form, isMolting: !form.isMolting})}
            className={`w-12 h-6 rounded-full transition-colors relative ${form.isMolting ? 'bg-blue-500' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${form.isMolting ? 'left-6.5' : 'left-0.5'}`} style={{left: form.isMolting ? '26px' : '2px'}} />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Evento Especial</label>
          <input 
            type="text" 
            className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#4CAF50]"
            placeholder="Ex: Postura do primeiro ovo"
            value={form.event}
            onChange={e => setForm({...form, event: e.target.value})}
          />
        </div>

        <Button className="mt-6">Salvar Registro</Button>
      </form>
    </div>
  );
};

const BirdStatusScreen = ({ birds, isPremium, toggleModal }: any) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const bird = birds.find((b: Bird) => b.id === id);

  if (!bird) return <div>Pássaro não encontrado</div>;

  const getStatusText = (status: HealthStatus) => {
    switch (status) {
      case HealthStatus.GREEN: return "Saudável";
      case HealthStatus.YELLOW: return "Atenção";
      case HealthStatus.RED: return "Crítico";
    }
  };

  const getStatusMessage = (status: HealthStatus) => {
    switch (status) {
      case HealthStatus.GREEN: return "Seu amigo está ótimo! Continue assim.";
      case HealthStatus.YELLOW: return "Observe de perto. Algo não está 100%.";
      case HealthStatus.RED: return "Consulte um veterinário imediatamente.";
    }
  };

  const statusColorText = bird.status === HealthStatus.GREEN ? COLORS.textGreen : bird.status === HealthStatus.YELLOW ? COLORS.textYellow : COLORS.textRed;

  const handleHistoryClick = () => {
     navigate(`/history/${bird.id}`);
  };

  const handleAdvancedClick = () => {
    // Lock: Advanced Records
    if (isPremium) {
      navigate(`/advanced/${bird.id}`);
    } else {
      toggleModal();
    }
  };

  const handleShare = async () => {
    const text = `Status do ${bird.name}: ${getStatusText(bird.status)}. ${getStatusMessage(bird.status)} - via App Pássaro OK 🐦`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Status de ${bird.name}`,
          text: text,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("Status copiado para a área de transferência!");
      } catch (err) {
        alert("Não foi possível compartilhar.");
      }
    }
  };

  return (
    <div className={`min-h-screen ${COLORS.bg} flex flex-col`}>
      {/* Header - Fixed */}
      <div className="p-6 flex-none">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/home')} className="text-gray-600 bg-white p-2 rounded-full shadow-sm">
            <ArrowLeft />
          </button>
          <span className="font-semibold text-gray-700">{bird.name}</span>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="text-gray-600 bg-white p-2 rounded-full shadow-sm">
              <Share2 size={20}/>
            </button>
            <button onClick={() => navigate('/reminders')} className="text-gray-600 bg-white p-2 rounded-full shadow-sm">
              <Bell size={20}/>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto p-6 -mt-8">
          <div className="relative mb-6 transform transition-transform hover:scale-105 duration-500">
             <StatusBadge status={bird.status} size="xl" />
             {bird.photo && (
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <img src={bird.photo} alt={bird.name} className="w-44 h-44 rounded-full object-cover border-4 border-white/20 shadow-sm" />
               </div>
             )}
          </div>
          
          <h2 className={`text-4xl font-bold text-center mb-2 tracking-tight ${statusColorText}`}>
            {getStatusText(bird.status)}
          </h2>
          <p className="text-gray-600 text-center text-sm leading-relaxed max-w-[280px]">
            {getStatusMessage(bird.status)}
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 border border-white/40 shadow-sm backdrop-blur-sm">
            <Calendar size={12} className="text-gray-400"/>
            <p className="text-xs text-gray-500 font-medium">
              {new Date(bird.lastUpdate).toLocaleDateString()}
            </p>
          </div>
      </div>

      {/* Footer Actions - Fixed Bottom */}
      <div className="p-6 pt-0 flex-none space-y-4">
          <Button onClick={() => navigate(`/check/${bird.id}`)}>
            Atualizar Saúde Hoje
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
             <Button 
               variant="secondary" 
               onClick={handleHistoryClick}
               className="text-sm px-2"
             >
               <span className="flex items-center gap-1">Histórico</span>
             </Button>

             <Button 
               variant="outline" 
               onClick={handleAdvancedClick}
               className="text-sm px-2 bg-white"
             >
               <span className="flex items-center gap-1">Reg. Avançados {!isPremium && <Lock size={12}/>}</span>
             </Button>
          </div>
      </div>
      
      {!isPremium && (
        <div className="p-6 pt-0 flex-none">
          <AdBanner />
        </div>
      )}
    </div>
  );
};

const HealthCheck = ({ birds, onUpdate, onAddLog }: any) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const bird = birds.find((b: Bird) => b.id === id);
  
  const [answers, setAnswers] = useState<Record<string, QuestionOption>>({});
  const [notes, setNotes] = useState('');

  if (!bird) return null;

  const handleOptionSelect = (category: string, option: QuestionOption) => {
    setAnswers((prev: any) => ({
      ...prev,
      [category]: option
    }));
  };

  const isFormComplete = Object.keys(HEALTH_QUESTIONS).every(k => answers[k] !== undefined);

  const handleSave = () => {
    const status = calculateHealthStatus(answers);
    
    const newLog: HealthLog = {
      id: generateId(),
      birdId: bird.id,
      date: new Date().toISOString(),
      appetite: answers['appetite'].label,
      activity: answers['activity'].label,
      droppings: answers['droppings'].label,
      singing: answers['singing'].label,
      resultStatus: status,
      notes: notes
    };

    onAddLog(newLog);
    onUpdate(bird.id, status);
    navigate(`/bird/${bird.id}`);
  };

  const renderQuestion = (key: string, label: string) => (
    <div className="mb-6 bg-white p-4 rounded-xl shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-3 capitalize">{label}</h3>
      <div className="grid grid-cols-2 gap-2">
        {/* @ts-ignore */}
        {HEALTH_QUESTIONS[key].map((opt: QuestionOption) => {
           const isSelected = answers[key]?.value === opt.value;
           return (
            <button
              key={opt.value}
              onClick={() => handleOptionSelect(key, opt)}
              className={`p-3 rounded-lg text-sm transition-all border ${
                isSelected 
                  ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium ring-1 ring-blue-500' 
                  : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {opt.label}
            </button>
           );
        })}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${COLORS.bg} flex flex-col`}>
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-4">
        <button onClick={() => navigate(-1)}><ArrowLeft className="text-gray-600"/></button>
        <h1 className="font-bold text-lg">Check-up: {bird.name}</h1>
      </div>

      <div className="p-4 flex-1 overflow-y-auto pb-20">
        <div className="bg-blue-50 p-3 rounded-lg flex gap-3 mb-6 text-sm text-blue-800">
          <Info size={20} className="shrink-0" />
          <p>Responda com honestidade para garantir a precisão do diagnóstico.</p>
        </div>

        {renderQuestion('appetite', 'Apetite')}
        {renderQuestion('activity', 'Disposição / Atividade')}
        {renderQuestion('droppings', 'Fezes')}
        {renderQuestion('singing', 'Canto')}

        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">Anotações Extras</h3>
          <textarea
            className="w-full bg-gray-50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#4CAF50] border-none"
            rows={3}
            placeholder="Observações adicionais..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="p-4 bg-white border-t border-gray-100 fixed bottom-0 left-0 right-0 max-w-md mx-auto">
        <Button onClick={handleSave} disabled={!isFormComplete}>
          Salvar Registro
        </Button>
      </div>
    </div>
  );
};

const HistoryScreen = ({ birds, logs, advancedRecords, isPremium, toggleModal }: any) => {
  const { birdId } = useParams();
  const navigate = useNavigate();
  const bird = birds.find((b: Bird) => b.id === birdId);
  const [view, setView] = useState<'health' | 'advanced'>('health');

  if (!bird) return <div>Pássaro não encontrado</div>;

  const allBirdLogs = logs
    .filter((log: HealthLog) => log.birdId === birdId)
    .sort((a: HealthLog, b: HealthLog) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Lock: Full history limited to 3
  const birdLogs = isPremium ? allBirdLogs : allBirdLogs.slice(0, 3);
  
  const advLogs = advancedRecords
    ? advancedRecords
        .filter((rec: AdvancedRecord) => rec.birdId === birdId)
        .sort((a: AdvancedRecord, b: AdvancedRecord) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  const handleRestrictedFeature = () => {
    // Lock: Advanced Charts/CSV/History expansion
    if (!isPremium) {
      toggleModal();
    }
  };

  return (
    <div className={`min-h-screen ${COLORS.bg} flex flex-col`}>
      <div className="bg-white p-6 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/bird/${birdId}`)} className="text-gray-600">
              <ArrowLeft />
            </button>
            <div>
              <h1 className="font-bold text-lg text-gray-800">Histórico de Saúde</h1>
              <p className="text-xs text-gray-500">{bird.name}</p>
            </div>
          </div>
          {/* Lock: CSV Export */}
          <button onClick={handleRestrictedFeature} className="p-2 text-gray-400 bg-gray-50 rounded-full hover:bg-gray-100">
            <Download size={20} />
          </button>
        </div>
        
        <div className="flex p-1 bg-gray-100 rounded-lg">
           <button 
             onClick={() => setView('health')}
             className={`flex-1 py-1 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${view === 'health' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
           >
             <FileText size={14}/> Diário
           </button>
           <button 
             onClick={() => {
                if(isPremium) setView('advanced');
                else handleRestrictedFeature();
             }}
             className={`flex-1 py-1 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${view === 'advanced' ? 'bg-white shadow text-gray-800' : 'text-gray-400'}`}
           >
             <BarChart3 size={14}/> Gráficos { !isPremium && <Lock size={10} />}
           </button>
        </div>
      </div>

      <div className="p-6 flex-1 space-y-4">
        {view === 'health' && (
          <>
            {birdLogs.length === 0 ? (
              <div className="text-center py-10 opacity-60 flex flex-col items-center">
                <Calendar size={48} className="mb-4 text-gray-300"/>
                <p className="text-gray-500">Nenhum registro encontrado.</p>
              </div>
            ) : (
              birdLogs.map((log: HealthLog) => (
                <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-500 text-sm font-medium">
                      {new Date(log.date).toLocaleDateString()} às {new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <StatusBadge status={log.resultStatus} size="sm" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-2 text-sm border-b border-gray-100 pb-3 mb-3">
                    <div><span className="text-gray-400 text-xs block">Apetite</span> {log.appetite}</div>
                    <div><span className="text-gray-400 text-xs block">Atividade</span> {log.activity}</div>
                    <div><span className="text-gray-400 text-xs block">Fezes</span> {log.droppings}</div>
                    <div><span className="text-gray-400 text-xs block">Canto</span> {log.singing}</div>
                  </div>
                  {log.notes && (
                    <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 italic">
                      "{log.notes}"
                    </div>
                  )}
                </div>
              ))
            )}
            
            {/* Lock: See Full History */}
            {!isPremium && allBirdLogs.length > 3 && (
              <div className="text-center pt-4">
                 <button onClick={handleRestrictedFeature} className="text-[#4CAF50] font-medium text-sm flex items-center justify-center gap-1 mx-auto">
                    Ver Histórico Completo <Lock size={12}/>
                 </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const HealthLibrary = ({ isPremium, toggleModal }: { isPremium: boolean, toggleModal: () => void }) => {
  const navigate = useNavigate();

  const handleArticleClick = (id: string) => {
    if (isPremium) {
      navigate(`/library/${id}`);
    } else {
      toggleModal();
    }
  };

  return (
    <div className={`min-h-screen ${COLORS.bg} flex flex-col`}>
      <div className="bg-white p-6 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/home')} className="text-gray-600">
            <ArrowLeft />
          </button>
          <h1 className="font-bold text-xl text-gray-800 flex items-center gap-2">
            <BookOpen className="text-blue-500" size={24} />
            Biblioteca de Saúde
          </h1>
        </div>
      </div>

      <div className="p-6 flex-1 space-y-4">
        {ARTICLES_DATA.map((article) => (
          <div 
            key={article.id}
            onClick={() => handleArticleClick(article.id)}
            className="bg-white p-4 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-shadow active:scale-98 flex items-start gap-4 group"
          >
            {/* Image Placeholder with Blur/Sharpen Effect */}
            <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden relative bg-gray-100">
               <div className={`w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center transition-all duration-700 ${isPremium ? '' : 'blur-[3px] group-hover:blur-0'}`}>
                  <BirdIcon className="text-blue-300/60 w-8 h-8" />
               </div>
               {!isPremium && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                    <Lock size={16} className="text-gray-500/80"/>
                 </div>
               )}
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {article.category}
                </span>
                {isPremium && <ChevronRight className="text-gray-300" size={16} />}
              </div>
              <h3 className="font-bold text-gray-800 text-sm mb-1 leading-tight">{article.title}</h3>
              <p className="text-gray-500 text-xs line-clamp-2">
                {article.preview}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ArticleDetail = ({ isPremium, toggleModal }: { isPremium: boolean, toggleModal: () => void }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = ARTICLES_DATA.find(a => a.id === id);

  useEffect(() => {
    if (!isPremium) {
      toggleModal();
      navigate('/home');
    }
  }, [isPremium, navigate, toggleModal]);

  if (!isPremium || !article) return null;

  return (
    <div className={`min-h-screen bg-white flex flex-col`}>
      <div className="p-6 sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <button onClick={() => navigate('/library')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Voltar para Biblioteca</span>
        </button>
      </div>

      <div className="p-6 flex-1 max-w-2xl mx-auto w-full">
        <span className="inline-block bg-blue-50 text-blue-600 font-semibold px-3 py-1 rounded-full text-xs mb-4">
          {article.category}
        </span>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">
          {article.title}
        </h1>

        <div className="prose prose-blue prose-lg text-gray-600 leading-relaxed space-y-4">
          <p className="font-medium text-gray-800 text-lg">{article.preview}</p>
          <div className="w-12 h-1 bg-blue-500 rounded-full my-6 opacity-20"></div>
          {article.content.split('\n').map((paragraph, idx) => (
             <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main App Container ---

const App = () => {
  // Persistence
  const [birds, setBirds] = useState<Bird[]>(() => {
    const saved = localStorage.getItem('birds');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>(() => {
    const saved = localStorage.getItem('healthLogs');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [advancedRecords, setAdvancedRecords] = useState<AdvancedRecord[]>(() => {
    const saved = localStorage.getItem('advancedRecords');
    return saved ? JSON.parse(saved) : [];
  });

  // Feature Flag: Premium Status (from "premium" key as requested)
  const isPremium = localStorage.getItem("premium") === "true";

  const [hasOnboarded, setHasOnboarded] = useState(() => {
    return localStorage.getItem('onboarded') === 'true';
  });

  // Global Modal State for "Coming Soon" toast
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal(true);

  useEffect(() => {
    localStorage.setItem('birds', JSON.stringify(birds));
  }, [birds]);

  useEffect(() => {
    localStorage.setItem('healthLogs', JSON.stringify(healthLogs));
  }, [healthLogs]);

  useEffect(() => {
    localStorage.setItem('advancedRecords', JSON.stringify(advancedRecords));
  }, [advancedRecords]);

  const addBird = (bird: Bird) => {
    setBirds([...birds, bird]);
  };

  const updateBirdStatus = (id: string, status: HealthStatus) => {
    setBirds(birds.map(b => b.id === id ? { ...b, status, lastUpdate: new Date().toISOString() } : b));
  };
  
  const editBird = (id: string, updatedData: Partial<Bird>) => {
    setBirds(birds.map(b => b.id === id ? { ...b, ...updatedData } : b));
  };

  const deleteBird = (id: string) => {
    // Removed window.confirm. Confirmation is handled in the UI components (Home/EditBird).
    setBirds(birds.filter(b => b.id !== id));
    setHealthLogs(healthLogs.filter(l => l.birdId !== id));
    setAdvancedRecords(advancedRecords.filter(r => r.birdId !== id));
  };

  const addHealthLog = (log: HealthLog) => {
    setHealthLogs([...healthLogs, log]);
  };
  
  const addAdvancedRecord = (record: AdvancedRecord) => {
    setAdvancedRecords([...advancedRecords, record]);
  };

  return (
    <HashRouter>
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl overflow-hidden relative font-['Poppins']">
        <Routes>
          <Route path="/" element={hasOnboarded ? <Home birds={birds} onDelete={deleteBird} isPremium={isPremium} toggleModal={toggleModal} /> : <Onboarding />} />
          <Route path="/home" element={<Home birds={birds} onDelete={deleteBird} isPremium={isPremium} toggleModal={toggleModal} />} />
          <Route path="/add-bird" element={<AddBird onAdd={addBird} />} />
          <Route path="/edit-bird/:id" element={<EditBird birds={birds} onEdit={editBird} onDelete={deleteBird} />} />
          <Route path="/bird/:id" element={<BirdStatusScreen birds={birds} isPremium={isPremium} toggleModal={toggleModal} />} />
          <Route path="/check/:id" element={<HealthCheck birds={birds} onUpdate={updateBirdStatus} onAddLog={addHealthLog} />} />
          <Route path="/history/:birdId" element={<HistoryScreen birds={birds} logs={healthLogs} advancedRecords={advancedRecords} isPremium={isPremium} toggleModal={toggleModal} />} />
          <Route path="/advanced/:id" element={<AdvancedRecordsScreen birds={birds} onAddRecord={addAdvancedRecord} isPremium={isPremium} toggleModal={toggleModal} />} />
          <Route path="/reminders" element={<ReminderSettings isPremium={isPremium} toggleModal={toggleModal} />} />
          {/* Library Routes */}
          <Route path="/library" element={<HealthLibrary isPremium={isPremium} toggleModal={toggleModal} />} />
          <Route path="/library/:id" element={<ArticleDetail isPremium={isPremium} toggleModal={toggleModal} />} />
        </Routes>
        
        {/* Global Modal Instance */}
        <ComingSoonModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </div>
    </HashRouter>
  );
};

export default App;

import React, { useState, useEffect, useRef } from 'react';
import { Search, Upload, User, Settings, BookOpen, Heart, Star, Filter, Grid, List, Download, Eye, Edit, Trash2, Plus, Moon, Sun, Menu, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Bookmark, MessageSquare, Share2, FileText, Image, Archive } from 'lucide-react';

// Simulação do Supabase - em produção, seria a integração real
const mockSupabase = {
  auth: {
    signIn: async (credentials) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (credentials.email === 'admin@biblioteca.com' && credentials.password === 'admin123') {
        return { user: { id: '1', email: credentials.email, role: 'admin' }, error: null };
      }
      if (credentials.email === 'user@biblioteca.com' && credentials.password === 'user123') {
        return { user: { id: '2', email: credentials.email, role: 'user' }, error: null };
      }
      return { user: null, error: 'Credenciais inválidas' };
    },
    signOut: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { error: null };
    }
  },
  storage: {
    upload: async (file) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { data: { path: `pdfs/${file.name}` }, error: null };
    }
  }
};

// Dados mock para demonstração
const mockBooks = [
  {
    id: '1',
    title: 'Dom Casmurro',
    author: 'Machado de Assis',
    category: 'Literatura Brasileira',
    tags: ['clássico', 'romance', 'realismo'],
    year: 1899,
    pages: 256,
    rating: 4.5,
    favorite: true,
    progress: 65,
    cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNiI+RG9tIENhc211cnJvPC90ZXh0Pgo8L3N2Zz4='
  },
  {
    id: '2',
    title: 'O Cortiço',
    author: 'Aluísio Azevedo',
    category: 'Literatura Brasileira',
    tags: ['naturalismo', 'crítica social'],
    year: 1890,
    pages: 320,
    rating: 4.2,
    favorite: false,
    progress: 0,
    cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjNjY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNiI+TyBDb3J0acOnbzwvdGV4dD4KPC9zdmc+'
  },
  {
    id: '3',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'Tecnologia',
    tags: ['programação', 'desenvolvimento', 'boas práticas'],
    year: 2008,
    pages: 464,
    rating: 4.8,
    favorite: true,
    progress: 30,
    cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMDA3YWNjIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNiI+Q2xlYW4gQ29kZTwvdGV4dD4KPC9zdmc+'
  }
];

const App = () => {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState('login');
  const [books, setBooks] = useState(mockBooks);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pdfZoom, setPdfZoom] = useState(100);
  const [pdfPage, setPdfPage] = useState(1);
  const [showConverters, setShowConverters] = useState(false);
  const fileInputRef = useRef(null);

  // Estados para formulários
  const [loginForm, setLoginForm] = useState({ email: '', password: '', remember: false });
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { user: authenticatedUser, error } = await mockSupabase.auth.signIn(loginForm);
    
    if (error) {
      alert(error);
      return;
    }
    
    setUser(authenticatedUser);
    setCurrentView('library');
  };

  const handleLogout = async () => {
    await mockSupabase.auth.signOut();
    setUser(null);
    setCurrentView('login');
    setLoginForm({ email: '', password: '', remember: false });
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    for (const file of files) {
      if (file.type !== 'application/pdf') {
        alert('Apenas arquivos PDF são permitidos');
        continue;
      }
      
      // Simular progresso de upload
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const { data, error } = await mockSupabase.storage.upload(file);
      
      if (!error) {
        const newBook = {
          id: Date.now().toString(),
          title: file.name.replace('.pdf', ''),
          author: 'Autor Desconhecido',
          category: 'Sem Categoria',
          tags: [],
          year: new Date().getFullYear(),
          pages: Math.floor(Math.random() * 500) + 50,
          rating: 0,
          favorite: false,
          progress: 0,
          cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjOTk5Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNiI+Tm92byBMaXZybzwvdGV4dD4KPC9zdmc+'
        };
        
        setBooks(prev => [...prev, newBook]);
      }
    }
    
    setIsUploading(false);
    setUploadProgress(0);
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === '' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(books.map(book => book.category))];

  const toggleFavorite = (bookId) => {
    setBooks(prev => prev.map(book => 
      book.id === bookId ? { ...book, favorite: !book.favorite } : book
    ));
  };

  const ConverterModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-96 max-w-[90vw]`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Conversores de PDF</h3>
          <button onClick={() => setShowConverters(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-3">
          <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3">
            <FileText className="w-5 h-5" />
            <div>
              <div className="font-medium">PDF para EPUB</div>
              <div className="text-sm text-gray-500">Para leitores digitais</div>
            </div>
          </button>
          
          <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3">
            <FileText className="w-5 h-5" />
            <div>
              <div className="font-medium">PDF para TXT</div>
              <div className="text-sm text-gray-500">Texto puro para busca</div>
            </div>
          </button>
          
          <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3">
            <Edit className="w-5 h-5" />
            <div>
              <div className="font-medium">PDF para DOCX</div>
              <div className="text-sm text-gray-500">Edição de texto</div>
            </div>
          </button>
          
          <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3">
            <Image className="w-5 h-5" />
            <div>
              <div className="font-medium">Extrair Imagens</div>
              <div className="text-sm text-gray-500">Extrair todas as imagens</div>
            </div>
          </button>
          
          <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3">
            <Archive className="w-5 h-5" />
            <div>
              <div className="font-medium">Comprimir PDF</div>
              <div className="text-sm text-gray-500">Reduzir tamanho do arquivo</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const PDFViewer = () => (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="bg-gray-900 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowPDFViewer(false)} className="text-white hover:bg-gray-700 p-2 rounded">
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-white font-medium">{selectedBook?.title}</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => setPdfZoom(Math.max(50, pdfZoom - 25))} className="text-white hover:bg-gray-700 p-2 rounded">
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-white text-sm">{pdfZoom}%</span>
          <button onClick={() => setPdfZoom(Math.min(200, pdfZoom + 25))} className="text-white hover:bg-gray-700 p-2 rounded">
            <ZoomIn className="w-5 h-5" />
          </button>
          <button className="text-white hover:bg-gray-700 p-2 rounded">
            <RotateCw className="w-5 h-5" />
          </button>
          <button className="text-white hover:bg-gray-700 p-2 rounded">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 bg-gray-200 flex items-center justify-center">
        <div className="bg-white shadow-lg" style={{ zoom: `${pdfZoom}%` }}>
          <div className="w-96 h-[500px] bg-white border p-8 text-gray-800">
            <h1 className="text-2xl font-bold mb-4">{selectedBook?.title}</h1>
            <p className="text-lg mb-4">Por {selectedBook?.author}</p>
            <div className="space-y-4 text-justify">
              <p>Este é um visualizador de PDF simulado. Em uma implementação real, aqui seria renderizado o conteúdo do PDF usando bibliotecas como PDF.js.</p>
              <p>O usuário poderia navegar pelas páginas, fazer anotações, destacar texto, buscar conteúdo e muito mais.</p>
              <p>Todas as funcionalidades de leitura estariam disponíveis, incluindo modo noturno, ajuste de zoom, rotação de páginas e bookmarks.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-900 p-4 flex items-center justify-center gap-4">
        <button onClick={() => setPdfPage(Math.max(1, pdfPage - 1))} className="text-white hover:bg-gray-700 p-2 rounded">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-white">Página {pdfPage} de {selectedBook?.pages || 1}</span>
        <button onClick={() => setPdfPage(Math.min(selectedBook?.pages || 1, pdfPage + 1))} className="text-white hover:bg-gray-700 p-2 rounded">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const AdminPanel = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Painel Administrativo</h2>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow`}>
          <h3 className="font-semibold mb-2">Total de Livros</h3>
          <p className="text-3xl font-bold text-blue-600">{books.length}</p>
        </div>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow`}>
          <h3 className="font-semibold mb-2">Usuários Ativos</h3>
          <p className="text-3xl font-bold text-green-600">1</p>
        </div>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow`}>
          <h3 className="font-semibold mb-2">Storage Usado</h3>
          <p className="text-3xl font-bold text-orange-600">2.3 GB</p>
        </div>
      </div>
      
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
        <div className="p-6 border-b">
          <h3 className="font-semibold">Gerenciar Usuários</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">admin@biblioteca.com</p>
                <p className="text-sm text-gray-500">Administrador</p>
              </div>
              <button className="text-red-600 hover:bg-red-50 p-2 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">user@biblioteca.com</p>
                <p className="text-sm text-gray-500">Usuário</p>
              </div>
              <button className="text-red-600 hover:bg-red-50 p-2 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Usuário
          </button>
        </div>
      </div>
    </div>
  );

  if (currentView === 'login') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
        <div className={`max-w-md w-full mx-4 p-8 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="text-center mb-8">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <h1 className="text-2xl font-bold">Biblioteca Virtual</h1>
            <p className="text-gray-500 mt-2">Acesse sua biblioteca pessoal</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                placeholder="seu@email.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Senha</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                placeholder="••••••••"
                required
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={loginForm.remember}
                  onChange={(e) => setLoginForm({...loginForm, remember: e.target.checked})}
                  className="mr-2"
                />
                Lembrar-me
              </label>
              <button type="button" className="text-sm text-blue-600 hover:underline">
                Esqueci a senha
              </button>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Entrar
            </button>
          </form>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">Contas de demonstração:</p>
            <p className="text-xs">Admin: admin@biblioteca.com / admin123</p>
            <p className="text-xs">Usuário: user@biblioteca.com / user123</p>
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="mt-4 w-full flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {darkMode ? 'Modo Claro' : 'Modo Escuro'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="w-5 h-5" />
              </button>
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold">Biblioteca Virtual</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar livros, autores, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 w-80 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
                />
              </div>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:block">{user?.email}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => setShowAdmin(!showAdmin)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Settings className="w-4 h-4 inline mr-2" />
                      Administração
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 fixed lg:static inset-y-0 left-0 z-30 w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r shadow-lg lg:shadow-none`}>
          <div className="p-4 space-y-2 mt-16 lg:mt-0">
            <button
              onClick={() => {
                setShowAdmin(false);
                setSidebarOpen(false);
              }}
              className={`w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${!showAdmin ? 'bg-blue-50 dark:bg-blue-900 text-blue-600' : ''}`}
            >
              <BookOpen className="w-5 h-5 inline mr-3" />
              Biblioteca
            </button>
            
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Categorias</h3>
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm ${selectedCategory === '' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                Todas
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm ${selectedCategory === category ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {showAdmin && user?.role === 'admin' ? (
            <AdminPanel />
          ) : (
            <div className="p-6">
              {/* Upload Area */}
              <div className={`mb-6 border-2 border-dashed rounded-lg p-8 text-center ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'}`}>
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">Adicionar novos livros</p>
                <p className="text-gray-500 mb-4">Arraste arquivos PDF aqui ou clique para selecionar</p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
                
                <div className="flex gap-2 justify-center flex-wrap">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Selecionar Arquivos
                  </button>
                  <button
                    onClick={() => setShowConverters(true)}
                    className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900"
                  >
                    Conversores PDF
                  </button>
                </div>
                
                {isUploading && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Enviando... {uploadProgress}%</p>
                  </div>
                )}
              </div>

              {/* Filters and View Controls */}
              <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Filter className="w-4 h-4" />
                    Filtros
                  </button>
                  
                  <div className="md:hidden relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-9 pr-4 py-2 w-48 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Books Grid/List */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredBooks.map(book => (
                    <div key={book.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow hover:shadow-lg transition-shadow group`}>
                      <div className="relative">
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="w-full h-64 object-cover rounded-t-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-t-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedBook(book);
                                setShowPDFViewer(true);
                                setPdfPage(1);
                              }}
                              className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleFavorite(book.id)}
                              className={`p-2 rounded-full ${book.favorite ? 'bg-red-500 text-white' : 'bg-white text-gray-800 hover:bg-gray-100'}`}
                            >
                              <Heart className="w-4 h-4" fill={book.favorite ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                        </div>
                        {book.favorite && (
                          <div className="absolute top-2 right-2">
                            <Heart className="w-5 h-5 text-red-500" fill="currentColor" />
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold truncate" title={book.title}>{book.title}</h3>
                        <p className="text-sm text-gray-500 truncate">{book.author}</p>
                        <p className="text-xs text-gray-400 mt-1">{book.category}</p>
                        
                        {book.progress > 0 && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progresso</span>
                              <span>{book.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className="bg-blue-600 h-1 rounded-full"
                                style={{ width: `${book.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                            <span className="text-sm">{book.rating}</span>
                          </div>
                          <span className="text-xs text-gray-500">{book.pages} páginas</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBooks.map(book => (
                    <div key={book.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4 flex items-center gap-4`}>
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{book.title}</h3>
                        <p className="text-gray-500">{book.author}</p>
                        <p className="text-sm text-gray-400">{book.category} • {book.pages} páginas</p>
                        <div className="flex items-center gap-2 mt-2">
                          {book.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedBook(book);
                            setShowPDFViewer(true);
                            setPdfPage(1);
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleFavorite(book.id)}
                          className={`p-2 rounded ${book.favorite ? 'text-red-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                          <Heart className="w-4 h-4" fill={book.favorite ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {filteredBooks.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-xl font-medium text-gray-500">Nenhum livro encontrado</p>
                  <p className="text-gray-400">Tente ajustar os filtros ou adicione novos livros</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showConverters && <ConverterModal />}
      {showPDFViewer && <PDFViewer />}
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
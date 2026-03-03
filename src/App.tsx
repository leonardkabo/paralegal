/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  Settings, 
  LogOut, 
  Play, 
  Pause, 
  Download, 
  Award, 
  MessageSquare, 
  ArrowLeft,
  Globe,
  Mic,
  Send,
  Camera,
  FileText,
  Search,
  Library,
  Sparkles,
  Volume2,
  X,
  HelpCircle,
  Clock,
  Plus,
  Trash2,
  Edit,
  FilePlus,
  Video,
  ExternalLink,
  Paperclip,
  Save,
  Image as ImageIcon
} from 'lucide-react';
import Markdown from 'react-markdown';
import { jsPDF } from 'jspdf';

import { GlossaryTerm, LegalDocument, CaseStudy, Language, Module, UserProgress, AppSettings, Attachment } from './types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

import { Button } from './components/Button';
import { Card } from './components/Card';
import { Input } from './components/Input';
import { Select } from './components/Select';
import { ProgressBar } from './components/ProgressBar';
import { useAppState } from './hooks/useAppState';
import { GoogleGenAI } from "@google/genai";
import { cn } from './lib/utils';

// --- Screens ---

const AuthScreen = ({ 
  onRegister, 
  onLogin, 
  isLoading, 
  error 
}: { 
  onRegister: (data: any) => void, 
  onLogin: (phone: string, pass: string) => void,
  isLoading: boolean,
  error: string | null
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    gender: '',
    birthDate: '',
    educationLevel: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        alert("Les mots de passe ne correspondent pas.");
        return;
      }
      onRegister(formData);
    } else {
      onLogin(formData.phone, formData.password);
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col max-w-md mx-auto py-12">
      <div className="mb-8 text-center shrink-0">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <UserIcon size={32} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          {mode === 'login' ? 'Connexion' : 'Inscription'}
        </h1>
        <p className="text-slate-500 mt-2">
          {mode === 'login' 
            ? 'Connectez-vous pour retrouver votre progression.' 
            : 'Inscrivez-vous pour commencer votre formation de parajuriste.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <Input 
            label="Nom complet" 
            placeholder="Ex: Jean Dupont" 
            required 
            value={formData.fullName}
            onChange={e => setFormData({...formData, fullName: e.target.value})}
          />
        )}
        <Input 
          label="Numéro de téléphone" 
          type="tel" 
          placeholder="Ex: +229 ..." 
          required 
          value={formData.phone}
          onChange={e => setFormData({...formData, phone: e.target.value})}
        />
        {mode === 'register' && (
          <>
            <Input 
              label="Commune / Quartier" 
              placeholder="Ex: Cotonou, Akpakpa" 
              required 
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select 
                label="Sexe" 
                options={[
                  { value: 'M', label: 'Masculin' },
                  { value: 'F', label: 'Féminin' }
                ]} 
                required
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value})}
              />
              <Input 
                label="Date de naissance" 
                type="date" 
                required 
                value={formData.birthDate}
                onChange={e => setFormData({...formData, birthDate: e.target.value})}
              />
            </div>
            <Select 
              label="Niveau d'instruction" 
              options={[
                { value: 'aucun', label: 'Aucun' },
                { value: 'primaire', label: 'Primaire' },
                { value: 'secondaire', label: 'Secondaire' },
                { value: 'superieur', label: 'Supérieur' }
              ]} 
              required
              value={formData.educationLevel}
              onChange={e => setFormData({...formData, educationLevel: e.target.value})}
            />
          </>
        )}
        <Input 
          label="Mot de passe" 
          type="password" 
          placeholder="••••••••" 
          required 
          value={formData.password}
          onChange={e => setFormData({...formData, password: e.target.value})}
        />

        {mode === 'register' && (
          <Input 
            label="Confirmer le mot de passe" 
            type="password" 
            placeholder="••••••••" 
            required 
            value={formData.confirmPassword}
            onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
          />
        )}
        
        {error && <p className="text-xs text-red-500 text-center font-medium">{error}</p>}
        
        <Button type="submit" className="w-full mt-4" isLoading={isLoading}>
          {mode === 'login' ? 'Se connecter' : "S'inscrire"}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <button 
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
        >
          {mode === 'login' 
            ? "Pas encore de compte ? S'inscrire" 
            : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    </div>
  );
};

const LanguageSelectionScreen = ({ onSelect }: { onSelect: (lang: Language) => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-6 flex flex-col max-w-2xl mx-auto text-center py-24"
    >
      <h2 className="text-2xl font-bold mb-8">Choisissez votre langue d'apprentissage</h2>
      <div className="grid gap-4">
        <Card onClick={() => onSelect('fr')} className="flex items-center gap-4 p-6">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Globe size={24} />
          </div>
          <div className="text-left">
            <h3 className="font-bold">Français</h3>
            <p className="text-xs text-slate-500">Texte + Quiz interactifs</p>
          </div>
          <ChevronRight className="ml-auto text-slate-300" />
        </Card>
        <Card onClick={() => onSelect('fon')} className="flex items-center gap-4 p-6">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
            <Mic size={24} />
          </div>
          <div className="text-left">
            <h3 className="font-bold">Fon</h3>
            <p className="text-xs text-slate-500">Audio uniquement</p>
          </div>
          <ChevronRight className="ml-auto text-slate-300" />
        </Card>
      </div>
    </motion.div>
  );
};

const GlossaryScreen = ({ onBack, glossary }: { onBack: () => void, glossary: GlossaryTerm[] }) => {
  const [search, setSearch] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

  const filtered = glossary.filter(t => 
    t.term.toLowerCase().includes(search.toLowerCase()) || 
    t.fonTranslation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full bg-slate-50 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-white shrink-0 z-10">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <h2 className="font-bold">Glossaire Juridique</h2>
      </div>

      <div className="p-4 bg-white border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Rechercher un terme..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {filtered.map(term => (
          <Card 
            key={term.id} 
            className="p-4 cursor-pointer hover:border-emerald-500 transition-colors"
            onClick={() => setSelectedTerm(term)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-emerald-700">{term.term}</h3>
                <p className="text-xs font-medium text-orange-600 mt-1 italic">{term.fonTranslation}</p>
              </div>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold uppercase">
                {term.category}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {selectedTerm && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed inset-0 z-[60] bg-black/40 flex items-end justify-center p-4"
            onClick={() => setSelectedTerm(null)}
          >
            <motion.div 
              className="bg-white w-full max-w-md rounded-t-3xl p-8 space-y-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedTerm.term}</h2>
                  <p className="text-lg font-semibold text-orange-600 italic">{selectedTerm.fonTranslation}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedTerm(null)}>
                  <X size={24} />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Définition (Français)</h4>
                  <p className="text-sm leading-relaxed text-slate-700">{selectedTerm.definition}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Définition (Fon)</h4>
                    <Volume2 size={16} className="text-orange-400" />
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700">{selectedTerm.fonDefinition}</p>
                </div>
              </div>

              <Button className="w-full py-6 rounded-2xl" onClick={() => setSelectedTerm(null)}>
                J'ai compris
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DocumentsScreen = ({ onBack, documents }: { onBack: () => void, documents: LegalDocument[] }) => {
  const [selectedDoc, setSelectedDoc] = useState<LegalDocument | null>(null);

  return (
    <div className="h-full bg-slate-50 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-white shrink-0 z-10">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <h2 className="font-bold">Bibliothèque de Modèles</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-24">
        {documents.map(doc => (
          <Card key={doc.id} className="p-5 flex items-start gap-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedDoc(doc)}>
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
              <FileText size={24} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-slate-900 leading-tight">{doc.title}</h3>
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">{doc.category}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">{doc.description}</p>
            </div>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {selectedDoc && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setSelectedDoc(null)}>
                  <ArrowLeft size={20} />
                </Button>
                <h2 className="font-bold truncate max-w-[200px]">{selectedDoc.title}</h2>
              </div>
              <Button size="sm" className="gap-2">
                <Download size={16} />
                PDF
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
              <div className="bg-white p-8 shadow-sm border border-slate-200 rounded-sm min-h-full font-serif text-sm whitespace-pre-wrap leading-relaxed">
                {selectedDoc.content}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AssistantScreen = ({ onBack }: { onBack: () => void }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([
    { role: 'assistant', text: "Bonjour ! Je suis votre tuteur juridique. Comment puis-je vous aider aujourd'hui ? Vous pouvez me poser des questions sur les cours ou sur une procédure juridique au Bénin." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
        config: {
          systemInstruction: "Tu es un tuteur juridique expert pour des parajuristes en formation au Bénin. Réponds de manière professionnelle, simple et pédagogique. Utilise des exemples concrets du droit béninois quand c'est possible. Si l'utilisateur pose une question hors du cadre juridique ou de la formation, redirige-le poliment vers le sujet."
        }
      });
      
      setMessages(prev => [...prev, { role: 'assistant', text: response.text || "Désolé, je n'ai pas pu générer de réponse." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Désolé, une erreur est survenue lors de la connexion à l'assistant." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-white shrink-0 z-10">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <h2 className="font-bold">Tuteur Juridique IA</h2>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 pb-24">
        {messages.map((msg, i) => (
          <div key={i} className={cn(
            "max-w-[85%] p-4 rounded-2xl text-sm",
            msg.role === 'user' 
              ? "bg-emerald-600 text-white ml-auto rounded-tr-none" 
              : "bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none"
          )}>
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="bg-white text-slate-400 p-4 rounded-2xl rounded-tl-none text-xs flex items-center gap-2 shadow-sm border border-slate-100 w-fit">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
            L'assistant réfléchit...
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100 fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl">
        <div className="flex gap-2">
          <input 
            type="text"
            placeholder="Posez votre question..."
            className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <Button size="icon" onClick={handleSend} disabled={isLoading}>
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

const CaseStudiesScreen = ({ 
  onBack, 
  progress, 
  caseStudies,
  onComplete 
}: { 
  onBack: () => void, 
  progress: UserProgress, 
  caseStudies: CaseStudy[],
  onComplete: (id: string) => void 
}) => {
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
  const [userChoice, setUserChoice] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleChoice = (optionId: string) => {
    setUserChoice(optionId);
    setShowFeedback(true);
    const option = selectedCase?.options.find(o => o.id === optionId);
    if (option?.isCorrect && selectedCase) {
      onComplete(selectedCase.id);
    }
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-white shrink-0 z-10">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <h2 className="font-bold">Études de Cas Interactives</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-24">
        {caseStudies.map(cs => {
          const isDone = progress.completedCaseStudies.includes(cs.id);
          return (
            <Card 
              key={cs.id} 
              className="p-5 flex items-start gap-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setSelectedCase(cs);
                setUserChoice(null);
                setShowFeedback(false);
              }}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                isDone ? "bg-emerald-100 text-emerald-600" : "bg-purple-100 text-purple-600"
              )}>
                {isDone ? <CheckCircle2 size={24} /> : <HelpCircle size={24} />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 leading-tight">{cs.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{cs.description}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedCase && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[60] bg-white flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-white shrink-0">
              <Button variant="ghost" size="icon" onClick={() => setSelectedCase(null)}>
                <ArrowLeft size={20} />
              </Button>
              <h2 className="font-bold truncate">{selectedCase.title}</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Scénario</h4>
                <p className="text-sm leading-relaxed text-slate-700">{selectedCase.scenario}</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Que conseillez-vous ?</h4>
                {selectedCase.options.map(opt => (
                  <button
                    key={opt.id}
                    disabled={showFeedback}
                    onClick={() => handleChoice(opt.id)}
                    className={cn(
                      "w-full p-4 rounded-2xl text-left text-sm transition-all border-2",
                      userChoice === opt.id 
                        ? (opt.isCorrect ? "border-emerald-500 bg-emerald-50" : "border-red-500 bg-red-50")
                        : "border-slate-100 bg-white hover:border-slate-200"
                    )}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>

              {showFeedback && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-6 rounded-3xl border",
                    selectedCase.options.find(o => o.id === userChoice)?.isCorrect 
                      ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                      : "bg-red-50 border-red-100 text-red-800"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {selectedCase.options.find(o => o.id === userChoice)?.isCorrect 
                      ? <CheckCircle2 size={20} /> 
                      : <X size={20} />}
                    <span className="font-bold">
                      {selectedCase.options.find(o => o.id === userChoice)?.isCorrect ? "Correct !" : "Pas tout à fait..."}
                    </span>
                  </div>
                  <p className="text-sm">{selectedCase.options.find(o => o.id === userChoice)?.feedback}</p>
                  
                  {selectedCase.options.find(o => o.id === userChoice)?.isCorrect && (
                    <Button className="w-full mt-6" onClick={() => setSelectedCase(null)}>
                      Continuer
                    </Button>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PerformanceScreen = ({ 
  progress, 
  modules,
  caseStudies,
  onBack 
}: { 
  progress: UserProgress, 
  modules: Module[],
  caseStudies: CaseStudy[],
  onBack: () => void 
}) => {
  const chartData = modules.map(m => ({
    name: `M${m.id}`,
    score: progress.quizScores[m.id] || 0
  }));

  const stats = [
    { label: 'Modules validés', value: progress.completedModules.length, total: modules.length, color: 'emerald' },
    { label: 'Études de cas', value: progress.completedCaseStudies.length, total: caseStudies.length, color: 'purple' },
    { label: 'Score moyen quiz', value: `${Math.round(Object.values(progress.quizScores).reduce((a: number, b: number) => a + b, 0) / (Object.keys(progress.quizScores).length || 1))}%`, color: 'blue' }
  ];

  return (
    <div className="h-full bg-slate-50 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-white shrink-0 z-10">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <h2 className="font-bold">Suivi de Performance</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
        <div className="grid grid-cols-1 gap-4">
          {stats.map((stat, i) => (
            <Card key={i} className="p-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className={cn("text-3xl font-bold", `text-${stat.color}-600`)}>{stat.value}</h3>
                {stat.total && <span className="text-slate-400 text-sm">/ {stat.total}</span>}
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <h4 className="text-sm font-bold mb-6">Progression des Quiz</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score >= 80 ? '#10b981' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {progress.finalExamScore !== undefined && (
          <Card className="p-6 bg-emerald-900 text-white border-none">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold">Examen Final</h4>
                <p className="text-emerald-300 text-xs">Validé le {new Date(progress.finalExamDate!).toLocaleDateString()}</p>
              </div>
              <Award className="text-yellow-400" size={32} />
            </div>
            <div className="text-5xl font-bold mb-2">{progress.finalExamScore}%</div>
            <p className="text-emerald-100 text-xs">Excellent travail ! Vous avez démontré une maîtrise complète du programme.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

const FinalExamScreen = ({ 
  onBack, 
  onComplete,
  modules
}: { 
  onBack: () => void, 
  onComplete: (score: number) => void,
  modules: Module[]
}) => {
  const [step, setStep] = useState<'intro' | 'exam' | 'result'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  // Generate 10 random questions from all modules
  const [examQuestions] = useState(() => {
    const allQuestions = modules.flatMap(m => m.quiz || []);
    return allQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);
  });

  useEffect(() => {
    let timer: any;
    if (step === 'exam' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && step === 'exam') {
      handleFinish();
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const handleAnswer = (index: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = index;
    setAnswers(newAnswers);

    if (currentQuestion < examQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleFinish = () => {
    let correct = 0;
    examQuestions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    const score = Math.round((correct / examQuestions.length) * 100);
    onComplete(score);
    setStep('result');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (step === 'intro') {
    return (
      <div className="h-full bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mb-6">
          <Award size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-4">Examen Final de Certification</h2>
        <p className="text-slate-500 mb-8 max-w-xs">
          Cet examen comporte 10 questions aléatoires couvrant l'ensemble de la formation. Vous avez 10 minutes pour terminer.
        </p>
        <div className="space-y-3 w-full max-w-xs">
          <Button className="w-full py-6 rounded-2xl" onClick={() => setStep('exam')}>
            Commencer l'examen
          </Button>
          <Button variant="ghost" className="w-full" onClick={onBack}>
            Plus tard
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'result') {
    const score = Math.round((answers.filter((a, i) => a === examQuestions[i].correctAnswer).length / examQuestions.length) * 100);
    return (
      <div className="h-full bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <div className={cn(
          "w-20 h-20 rounded-3xl flex items-center justify-center mb-6",
          score >= 80 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
        )}>
          {score >= 80 ? <Award size={40} /> : <X size={40} />}
        </div>
        <h2 className="text-3xl font-bold mb-2">{score}%</h2>
        <h3 className="text-xl font-bold mb-4">
          {score >= 80 ? "Félicitations !" : "Presque..."}
        </h3>
        <p className="text-slate-500 mb-8 max-w-xs">
          {score >= 80 
            ? "Vous avez réussi l'examen final. Votre attestation est maintenant disponible dans vos paramètres."
            : "Vous n'avez pas atteint le score minimum de 80%. Révisez les modules et réessayez plus tard."}
        </p>
        <Button className="w-full max-w-xs py-6 rounded-2xl" onClick={onBack}>
          Retour au tableau de bord
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-400">Question {currentQuestion + 1}/10</span>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold",
          timeLeft < 60 ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
        )}>
          <Clock size={14} />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="p-8 flex-1 overflow-y-auto space-y-8">
        <h3 className="text-xl font-bold leading-tight text-slate-900">
          {examQuestions[currentQuestion].question}
        </h3>

        <div className="space-y-3">
          {examQuestions[currentQuestion].options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className={cn(
                "w-full p-5 rounded-2xl text-left text-sm transition-all border-2",
                answers[currentQuestion] === i 
                  ? "border-emerald-500 bg-emerald-50 text-emerald-900" 
                  : "border-slate-100 bg-white hover:border-slate-200"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 border-t border-slate-100 flex justify-between items-center">
        <Button 
          variant="ghost" 
          disabled={currentQuestion === 0}
          onClick={() => setCurrentQuestion(prev => prev - 1)}
        >
          Précédent
        </Button>
        {currentQuestion === examQuestions.length - 1 ? (
          <Button onClick={handleFinish}>Terminer</Button>
        ) : (
          <Button variant="ghost" onClick={() => setCurrentQuestion(prev => prev + 1)}>Suivant</Button>
        )}
      </div>
    </div>
  );
};
const Dashboard = ({ 
  user, 
  progress, 
  modules,
  caseStudies,
  onSelectModule, 
  onOpenSettings,
  onOpenCases,
  onOpenPerformance,
  onOpenExam
}: { 
  user: any, 
  progress: any, 
  modules: Module[],
  caseStudies: CaseStudy[],
  onSelectModule: (m: Module) => void,
  onOpenSettings: () => void,
  onOpenCases: () => void,
  onOpenPerformance: () => void,
  onOpenExam: () => void
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const totalModules = modules.length;
  const completedCount = progress.completedModules.length;
  const percentage = totalModules > 0 ? (completedCount / totalModules) * 100 : 0;

  const filteredModules = modules.filter(module => {
    const query = searchQuery.toLowerCase();
    return (
      module.title.toLowerCase().includes(query) ||
      (module.introduction || '').toLowerCase().includes(query) ||
      module.keyNotions?.some(notion => notion.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-8 sticky top-0 z-10 border-b border-slate-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tableau de bord</p>
            <h1 className="text-2xl font-bold">Bonjour, {user.fullName.split(' ')[0]}</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={onOpenSettings}>
            <Settings size={20} />
          </Button>
        </div>
        
        <Card className="bg-emerald-600 text-white border-none p-6 overflow-hidden relative mb-6">
          <div className="relative z-10">
            <p className="text-emerald-100 text-xs font-medium mb-1">Votre progression globale</p>
            <div className="flex items-baseline gap-2 mb-4">
              <h2 className="text-4xl font-bold">{Math.round(percentage)}%</h2>
              <span className="text-emerald-200 text-xs font-medium">({completedCount}/{totalModules} modules)</span>
            </div>
            <div className="h-2.5 w-full bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-1000 ease-out" 
                style={{ width: `${percentage}%` }}
              />
            </div>
            {percentage === 100 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30 flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 shrink-0">
                  <Award size={18} />
                </div>
                <p className="text-[10px] font-bold leading-tight">
                  Félicitations ! Vous avez terminé tous les modules. Vous pouvez maintenant télécharger votre attestation.
                </p>
              </motion.div>
            )}
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Award size={120} />
          </div>
        </Card>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Rechercher un module ou un mot-clé..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Quick Actions / Performance */}
      <div className="px-6 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <Card 
            className="p-4 bg-purple-50 border-purple-100 cursor-pointer hover:bg-purple-100 transition-colors"
            onClick={onOpenCases}
          >
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-3">
              <HelpCircle size={20} />
            </div>
            <h4 className="font-bold text-sm text-purple-900">Études de Cas</h4>
            <p className="text-[10px] text-purple-600 mt-1">{progress.completedCaseStudies.length} terminées</p>
          </Card>
          
          <Card 
            className="p-4 bg-blue-50 border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={onOpenPerformance}
          >
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-3">
              <Sparkles size={20} />
            </div>
            <h4 className="font-bold text-sm text-blue-900">Performance</h4>
            <p className="text-[10px] text-blue-600 mt-1">Voir mes stats</p>
          </Card>
        </div>

        {percentage === 100 && progress.finalExamScore === undefined && (
          <Card 
            className="mt-4 p-4 bg-yellow-50 border-yellow-200 cursor-pointer hover:bg-yellow-100 transition-colors flex items-center gap-4"
            onClick={onOpenExam}
          >
            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center shrink-0">
              <Award size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-yellow-900">Passer l'Examen Final</h4>
              <p className="text-[10px] text-yellow-700 mt-0.5">Obtenez votre certification officielle</p>
            </div>
            <ChevronRight size={18} className="ml-auto text-yellow-400" />
          </Card>
        )}
      </div>

      {/* Modules List */}
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            {searchQuery ? `Résultats (${filteredModules.length})` : "Modules de formation"}
          </h3>
        </div>
        
        {filteredModules.length > 0 ? (
          filteredModules.map((module) => {
            const isCompleted = progress.completedModules.includes(module.id);
            return (
              <Card 
                key={module.id} 
                onClick={() => onSelectModule(module)}
                className="flex items-center gap-4"
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold",
                  isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
                )}>
                  {isCompleted ? <CheckCircle2 size={20} /> : module.id}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm leading-tight">{module.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {module.isReporting ? "Signalement" : user.preferredLanguage === 'fr' ? "Texte + Quiz" : "Audio"}
                  </p>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </Card>
            );
          })
        ) : (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search size={32} />
            </div>
            <p className="text-slate-500 font-medium">Aucun module trouvé</p>
            <p className="text-slate-400 text-xs mt-1">Essayez d'autres mots-clés</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ModuleDetail = ({ 
  module, 
  user, 
  progress, 
  onBack, 
  onComplete 
}: { 
  module: Module, 
  user: any, 
  progress: any, 
  onBack: () => void,
  onComplete: (score?: number) => void 
}) => {
  const [view, setView] = useState<'content' | 'quiz' | 'reporting'>('content');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reporting form state
  const [reportData, setReportData] = useState({
    type: '',
    description: '',
    location: '',
    date: '',
    anonymous: false
  });

  useEffect(() => {
    if (module.isReporting) setView('reporting');
  }, [module]);

  const handleQuizSubmit = () => {
    if (!module.quiz) return;
    let correct = 0;
    module.quiz.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswer) correct++;
    });
    const score = (correct / module.quiz.length) * 100;
    setQuizSubmitted(true);
    if (score >= 80) {
      onComplete(score);
    }
  };

  const downloadCourse = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(module.title, 20, 20);
    doc.setFontSize(12);
    doc.text(`Formation Parajuriste - Module ${module.id}`, 20, 30);
    
    let y = 50;
    if (module.introduction) {
      doc.setFontSize(14);
      doc.text('Introduction', 20, y);
      y += 10;
      doc.setFontSize(10);
      const splitIntro = doc.splitTextToSize(module.introduction, 170);
      doc.text(splitIntro, 20, y);
      y += splitIntro.length * 5 + 10;
    }

    if (module.content) {
      doc.setFontSize(14);
      doc.text('Contenu du cours', 20, y);
      y += 10;
      doc.setFontSize(10);
      const splitContent = doc.splitTextToSize(module.content, 170);
      doc.text(splitContent, 20, y);
    }

    doc.save(`Cours_Module_${module.id}.pdf`);
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setAudioPlaying(!audioPlaying);
    }
  };

  const handleAudioEnded = () => {
    setAudioPlaying(false);
    onComplete();
  };

  return (
    <div className="h-full bg-white flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-4 shrink-0 bg-white z-10">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <h2 className="font-bold text-sm truncate">{module.title}</h2>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={downloadCourse} title="Télécharger le cours">
            <Download size={18} />
          </Button>
          {progress.completedModules.includes(module.id) && (
            <div className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shrink-0">
              <CheckCircle2 size={12} /> Validé
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {view === 'content' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {user.preferredLanguage === 'fr' ? (
              <div className="space-y-6">
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                  <h3 className="text-emerald-800 font-bold text-sm mb-2">Objectifs pédagogiques</h3>
                  <ul className="space-y-1">
                    {module.objectives?.map((obj, i) => (
                      <li key={i} className="text-xs text-emerald-700 flex gap-2">
                        <span className="text-emerald-400">•</span> {obj}
                      </li>
                    ))}
                  </ul>
                </div>

                {module.videoUrl && (
                  <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-lg">
                    <video 
                      src={module.videoUrl} 
                      controls 
                      className="w-full h-full"
                    />
                  </div>
                )}
                
                <div className="markdown-body">
                  <Markdown>{module.content || ''}</Markdown>
                </div>

                {module.attachments && module.attachments.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Documents à télécharger</h4>
                    <div className="grid gap-2">
                      {module.attachments.map(att => (
                        <a 
                          key={att.id} 
                          href={att.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors shadow-sm">
                              <FileText size={20} />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{att.name}</span>
                          </div>
                          <Download size={18} className="text-slate-300 group-hover:text-emerald-500" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {module.quiz && module.quiz.length > 0 && (
                  <Button className="w-full" onClick={() => setView('quiz')}>
                    Passer au Quiz
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-8">
                <div className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center relative">
                  <div className={cn(
                    "absolute inset-0 bg-orange-200 rounded-full opacity-20",
                    audioPlaying && "animate-ping"
                  )} />
                  <Mic size={48} className="text-orange-500 relative z-10" />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-2">Écouter le module</h3>
                  <p className="text-slate-500 text-sm px-8">
                    Écoutez l'intégralité de l'audio pour valider ce module.
                  </p>
                </div>

                <audio 
                  ref={audioRef} 
                  src={module.audioUrl} 
                  onEnded={handleAudioEnded}
                  className="hidden"
                />

                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="w-16 h-16 rounded-2xl"
                    onClick={() => {}}
                  >
                    <Download size={24} />
                  </Button>
                  <Button 
                    className="w-24 h-24 rounded-3xl shadow-xl shadow-emerald-200"
                    onClick={toggleAudio}
                  >
                    {audioPlaying ? <Pause size={32} /> : <Play size={32} />}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {view === 'quiz' && module.quiz && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            {module.quiz.map((q, qIdx) => (
              <div key={q.id} className="space-y-4">
                <h3 className="font-bold text-lg">{qIdx + 1}. {q.question}</h3>
                <div className="grid gap-3">
                  {q.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      disabled={quizSubmitted}
                      onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: oIdx })}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all",
                        quizAnswers[q.id] === oIdx 
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-medium" 
                          : "border-slate-200 hover:border-slate-300",
                        quizSubmitted && oIdx === q.correctAnswer && "border-emerald-500 bg-emerald-50",
                        quizSubmitted && quizAnswers[q.id] === oIdx && oIdx !== q.correctAnswer && "border-red-500 bg-red-50"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            {!quizSubmitted ? (
              <Button 
                className="w-full" 
                onClick={handleQuizSubmit}
                disabled={Object.keys(quizAnswers).length < module.quiz.length}
              >
                Soumettre les réponses
              </Button>
            ) : (
              <div className="space-y-4">
                <div className={cn(
                   "p-4 rounded-2xl text-center font-bold",
                   (progress.quizScores[module.id] || 0) >= 80 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                )}>
                  Score: {Math.round(progress.quizScores[module.id] || 0)}%
                  {(progress.quizScores[module.id] || 0) < 80 && " - Échec (80% requis)"}
                </div>
                <Button variant="outline" className="w-full" onClick={() => {
                  setQuizSubmitted(false);
                  setQuizAnswers({});
                }}>
                  Réessayer
                </Button>
                <Button className="w-full" onClick={onBack}>
                  Retour au menu
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {view === 'reporting' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {user.preferredLanguage === 'fr' ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-500">Remplissez ce formulaire pour signaler un cas communautaire.</p>
                <Select 
                  label="Type de problème" 
                  options={[
                    { value: 'justice', label: 'Justice' },
                    { value: 'sante', label: 'Santé' },
                    { value: 'autre', label: 'Autre' }
                  ]}
                  value={reportData.type}
                  onChange={e => setReportData({...reportData, type: e.target.value})}
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Description du cas</label>
                  <textarea 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl min-h-[120px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Décrivez la situation..."
                    value={reportData.description}
                    onChange={e => setReportData({...reportData, description: e.target.value})}
                  />
                </div>
                <Input 
                  label="Localisation" 
                  placeholder="Lieu de l'incident" 
                  value={reportData.location}
                  onChange={e => setReportData({...reportData, location: e.target.value})}
                />
                <Input 
                  label="Date de l'incident" 
                  type="date" 
                  value={reportData.date}
                  onChange={e => setReportData({...reportData, date: e.target.value})}
                />
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <input 
                    type="checkbox" 
                    id="anon" 
                    className="w-5 h-5 accent-emerald-500"
                    checked={reportData.anonymous}
                    onChange={e => setReportData({...reportData, anonymous: e.target.checked})}
                  />
                  <label htmlFor="anon" className="text-sm font-medium text-slate-600">Soumettre anonymement</label>
                </div>
                <Button className="w-full" onClick={() => {
                  alert("Signalement envoyé avec succès !");
                  onComplete();
                }}>
                  Envoyer le signalement
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-8">
                <div className="w-32 h-32 bg-red-50 rounded-full flex items-center justify-center relative">
                  <Mic size={48} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Enregistrement vocal</h3>
                  <p className="text-slate-500 text-sm px-8">
                    Enregistrez votre message (max 3 min) pour signaler une situation.
                  </p>
                </div>
                <Button className="w-full max-w-xs h-16 rounded-2xl bg-red-500 hover:bg-red-600">
                  Démarrer l'enregistrement
                </Button>
                <p className="text-[10px] text-slate-400 italic">
                  En envoyant cet audio, vous consentez à sa transmission aux structures partenaires.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = ({ 
  onBack, 
  modules, 
  glossary,
  legalDocuments,
  caseStudies,
  settings,
  onSaveModule,
  onDeleteModule,
  onSaveGlossaryTerm,
  onDeleteGlossaryTerm,
  onSaveLegalDocument,
  onDeleteLegalDocument,
  onSaveCaseStudy,
  onDeleteCaseStudy,
  onDeleteUser,
  onSaveSettings,
  onUploadFile
}: { 
  onBack: () => void, 
  modules: Module[],
  glossary: GlossaryTerm[],
  legalDocuments: LegalDocument[],
  caseStudies: CaseStudy[],
  settings: AppSettings,
  onSaveModule: (m: Module) => Promise<boolean>,
  onDeleteModule: (id: number) => Promise<boolean>,
  onSaveGlossaryTerm: (t: GlossaryTerm) => Promise<boolean>,
  onDeleteGlossaryTerm: (id: string) => Promise<boolean>,
  onSaveLegalDocument: (d: LegalDocument) => Promise<boolean>,
  onDeleteLegalDocument: (id: string) => Promise<boolean>,
  onSaveCaseStudy: (c: CaseStudy) => Promise<boolean>,
  onDeleteCaseStudy: (id: string) => Promise<boolean>,
  onDeleteUser: (phone: string) => Promise<boolean>,
  onSaveSettings: (s: AppSettings) => Promise<boolean>,
  onUploadFile: (file: File) => Promise<{ url: string, name: string }>
}) => {
  const [view, setView] = useState<'users' | 'modules' | 'glossary' | 'documents' | 'cases' | 'settings'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingTerm, setEditingTerm] = useState<GlossaryTerm | null>(null);
  const [editingDoc, setEditingDoc] = useState<LegalDocument | null>(null);
  const [editingCase, setEditingCase] = useState<CaseStudy | null>(null);
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  useEffect(() => {
    if (view === 'users') {
      fetch('/api/admin/users').then(res => res.json()).then(setUsers);
    }
  }, [view]);

  const handleDeleteUser = async (phone: string) => {
    if (confirm("Supprimer cet utilisateur ?")) {
      const ok = await onDeleteUser(phone);
      if (ok) setUsers(users.filter(u => u.phone !== phone));
    }
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingModule) {
      const ok = await onSaveModule(editingModule);
      if (ok) {
        alert("Module enregistré !");
        setEditingModule(null);
      }
    }
  };

  const handleSaveTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTerm) {
      const ok = await onSaveGlossaryTerm(editingTerm);
      if (ok) {
        alert("Terme enregistré !");
        setEditingTerm(null);
      }
    }
  };

  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDoc) {
      const ok = await onSaveLegalDocument(editingDoc);
      if (ok) {
        alert("Document enregistré !");
        setEditingDoc(null);
      }
    }
  };

  const handleSaveCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCase) {
      const ok = await onSaveCaseStudy(editingCase);
      if (ok) {
        alert("Étude de cas enregistrée !");
        setEditingCase(null);
      }
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { url } = await onUploadFile(file);
        setLocalSettings({ ...localSettings, logoUrl: url });
      } catch (err) {
        alert("Erreur lors de l'upload");
      }
    }
  };

  const handleModuleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'video' | 'pdf') => {
    const file = e.target.files?.[0];
    if (file && editingModule) {
      try {
        const { url, name } = await onUploadFile(file);
        if (type === 'audio') {
          setEditingModule({ ...editingModule, audioUrl: url });
        } else if (type === 'video') {
          setEditingModule({ ...editingModule, videoUrl: url });
        } else {
          const newAttachment = { id: Date.now().toString(), name, url, type: 'pdf' as const };
          setEditingModule({ 
            ...editingModule, 
            attachments: [...(editingModule.attachments || []), newAttachment] 
          });
        }
      } catch (err) {
        alert("Erreur lors de l'upload");
      }
    }
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <h2 className="font-bold">Espace Administration</h2>
        </div>
        {view === 'settings' && (
          <Button size="sm" className="gap-2" onClick={() => onSaveSettings(localSettings)}>
            <Save size={16} /> Enregistrer
          </Button>
        )}
      </div>

      <div className="flex border-b border-slate-100 bg-white overflow-x-auto no-scrollbar">
        <button 
          className={cn("px-6 py-4 text-sm font-bold transition-colors whitespace-nowrap", view === 'users' ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-400")}
          onClick={() => setView('users')}
        >
          Utilisateurs
        </button>
        <button 
          className={cn("px-6 py-4 text-sm font-bold transition-colors whitespace-nowrap", view === 'modules' ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-400")}
          onClick={() => setView('modules')}
        >
          Modules
        </button>
        <button 
          className={cn("px-6 py-4 text-sm font-bold transition-colors whitespace-nowrap", view === 'glossary' ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-400")}
          onClick={() => setView('glossary')}
        >
          Glossaire
        </button>
        <button 
          className={cn("px-6 py-4 text-sm font-bold transition-colors whitespace-nowrap", view === 'documents' ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-400")}
          onClick={() => setView('documents')}
        >
          Documents
        </button>
        <button 
          className={cn("px-6 py-4 text-sm font-bold transition-colors whitespace-nowrap", view === 'cases' ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-400")}
          onClick={() => setView('cases')}
        >
          Cas
        </button>
        <button 
          className={cn("px-6 py-4 text-sm font-bold transition-colors whitespace-nowrap", view === 'settings' ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-400")}
          onClick={() => setView('settings')}
        >
          Paramètres
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {view === 'settings' && (
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Identité Visuelle</h3>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                  {localSettings.logoUrl ? (
                    <img src={localSettings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon size={32} className="text-slate-300" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-xs text-slate-500">Logo de l'organisation (utilisé pour les attestations)</p>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-xs" />
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Informations</h3>
              <Input 
                label="Nom de l'organisation" 
                value={localSettings.organizationName} 
                onChange={e => setLocalSettings({...localSettings, organizationName: e.target.value})} 
              />
              <Input 
                label="Email de contact" 
                value={localSettings.contactEmail} 
                onChange={e => setLocalSettings({...localSettings, contactEmail: e.target.value})} 
              />
            </Card>
          </div>
        )}

        {view === 'users' && (
          <div className="space-y-4">
            {users.map(u => (
              <Card key={u.phone} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">{u.fullName}</p>
                  <p className="text-xs text-slate-500">{u.phone} • {u.location}</p>
                </div>
                {!u.isAdmin && (
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteUser(u.phone)}>
                    <Trash2 size={18} />
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}

        {view === 'modules' && !editingModule && (
          <div className="space-y-4">
            <Button className="w-full gap-2 mb-4" onClick={() => setEditingModule({ id: modules.length + 1, title: 'Nouveau Module', quiz: [], objectives: [], keyNotions: [], attachments: [] })}>
              <Plus size={18} /> Ajouter un module
            </Button>
            {modules.map(m => (
              <Card key={m.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">Module {m.id}: {m.title}</p>
                  <p className="text-[10px] text-slate-400">{m.isReporting ? "Signalement" : "Cours"}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setEditingModule(m)}>
                    <Edit size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => onDeleteModule(m.id)}>
                    <Trash2 size={18} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {view === 'glossary' && !editingTerm && (
          <div className="space-y-4">
            <Button className="w-full gap-2 mb-4" onClick={() => setEditingTerm({ id: Date.now().toString(), term: '', definition: '', fonTranslation: '', fonDefinition: '', category: 'Général' })}>
              <Plus size={18} /> Ajouter un terme
            </Button>
            {glossary.map(t => (
              <Card key={t.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">{t.term}</p>
                  <p className="text-[10px] text-slate-400">{t.fonTranslation} • {t.category}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setEditingTerm(t)}>
                    <Edit size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => onDeleteGlossaryTerm(t.id)}>
                    <Trash2 size={18} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {view === 'documents' && !editingDoc && (
          <div className="space-y-4">
            <Button className="w-full gap-2 mb-4" onClick={() => setEditingDoc({ id: Date.now().toString(), title: '', description: '', category: 'Contrat', content: '' })}>
              <Plus size={18} /> Ajouter un document
            </Button>
            {legalDocuments.map(d => (
              <Card key={d.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">{d.title}</p>
                  <p className="text-[10px] text-slate-400">{d.category}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setEditingDoc(d)}>
                    <Edit size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => onDeleteLegalDocument(d.id)}>
                    <Trash2 size={18} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {view === 'cases' && !editingCase && (
          <div className="space-y-4">
            <Button className="w-full gap-2 mb-4" onClick={() => setEditingCase({ id: Date.now().toString(), title: '', description: '', scenario: '', options: [] })}>
              <Plus size={18} /> Ajouter une étude de cas
            </Button>
            {caseStudies.map(c => (
              <Card key={c.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">{c.title}</p>
                  <p className="text-[10px] text-slate-400">{c.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setEditingCase(c)}>
                    <Edit size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => onDeleteCaseStudy(c.id)}>
                    <Trash2 size={18} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {editingTerm && (
          <Card className="p-6">
            <form onSubmit={handleSaveTerm} className="space-y-4">
              <h3 className="font-bold mb-4">Édition Terme Glossaire</h3>
              <Input label="Terme (Français)" value={editingTerm.term} onChange={e => setEditingTerm({...editingTerm, term: e.target.value})} />
              <Input label="Traduction (Fon)" value={editingTerm.fonTranslation} onChange={e => setEditingTerm({...editingTerm, fonTranslation: e.target.value})} />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Définition (Français)</label>
                <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl min-h-[80px] text-sm" value={editingTerm.definition} onChange={e => setEditingTerm({...editingTerm, definition: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Définition (Fon)</label>
                <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl min-h-[80px] text-sm" value={editingTerm.fonDefinition} onChange={e => setEditingTerm({...editingTerm, fonDefinition: e.target.value})} />
              </div>
              <Select label="Catégorie" value={editingTerm.category} options={[{value:'Civil', label:'Civil'}, {value:'Pénal', label:'Pénal'}, {value:'Foncier', label:'Foncier'}, {value:'Procédure', label:'Procédure'}, {value:'Général', label:'Général'}]} onChange={e => setEditingTerm({...editingTerm, category: e.target.value as GlossaryTerm['category']})} />
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">Enregistrer</Button>
                <Button type="button" variant="ghost" className="flex-1" onClick={() => setEditingTerm(null)}>Annuler</Button>
              </div>
            </form>
          </Card>
        )}

        {editingDoc && (
          <Card className="p-6">
            <form onSubmit={handleSaveDoc} className="space-y-4">
              <h3 className="font-bold mb-4">Édition Document Modèle</h3>
              <Input label="Titre" value={editingDoc.title} onChange={e => setEditingDoc({...editingDoc, title: e.target.value})} />
              <Input label="Description" value={editingDoc.description} onChange={e => setEditingDoc({...editingDoc, description: e.target.value})} />
              <Select label="Catégorie" value={editingDoc.category} options={[{value:'Contrat', label:'Contrat'}, {value:'Lettre', label:'Lettre'}, {value:'Formulaire', label:'Formulaire'}, {value:'Procédure', label:'Procédure'}]} onChange={e => setEditingDoc({...editingDoc, category: e.target.value as LegalDocument['category']})} />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contenu du modèle</label>
                <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl min-h-[300px] text-sm font-serif" value={editingDoc.content} onChange={e => setEditingDoc({...editingDoc, content: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">Enregistrer</Button>
                <Button type="button" variant="ghost" className="flex-1" onClick={() => setEditingDoc(null)}>Annuler</Button>
              </div>
            </form>
          </Card>
        )}

        {editingCase && (
          <Card className="p-6">
            <form onSubmit={handleSaveCase} className="space-y-4">
              <h3 className="font-bold mb-4">Édition Étude de Cas</h3>
              <Input label="Titre" value={editingCase.title} onChange={e => setEditingCase({...editingCase, title: e.target.value})} />
              <Input label="Description courte" value={editingCase.description} onChange={e => setEditingCase({...editingCase, description: e.target.value})} />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scénario complet</label>
                <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl min-h-[120px] text-sm" value={editingCase.scenario} onChange={e => setEditingCase({...editingCase, scenario: e.target.value})} />
              </div>
              
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Options de réponse</h4>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setEditingCase({...editingCase, options: [...editingCase.options, { id: Date.now().toString(), text: '', isCorrect: false, feedback: '' }]})}>
                    <Plus size={14} className="mr-1" /> Ajouter
                  </Button>
                </div>
                {editingCase.options.map((opt, idx) => (
                  <div key={opt.id} className="p-4 bg-slate-50 rounded-xl space-y-3 relative">
                    <button type="button" onClick={() => setEditingCase({...editingCase, options: editingCase.options.filter(o => o.id !== opt.id)})} className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                    <Input label={`Option ${idx + 1}`} value={opt.text} onChange={e => {
                      const newOpts = [...editingCase.options];
                      newOpts[idx].text = e.target.value;
                      setEditingCase({...editingCase, options: newOpts});
                    }} />
                    <Input label="Feedback" value={opt.feedback} onChange={e => {
                      const newOpts = [...editingCase.options];
                      newOpts[idx].feedback = e.target.value;
                      setEditingCase({...editingCase, options: newOpts});
                    }} />
                    <div className="flex items-center gap-2">
                      <input type="radio" name="correctCase" checked={opt.isCorrect} onChange={() => {
                        const newOpts = editingCase.options.map((o, i) => ({...o, isCorrect: i === idx}));
                        setEditingCase({...editingCase, options: newOpts});
                      }} />
                      <span className="text-xs font-bold">Réponse correcte</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">Enregistrer</Button>
                <Button type="button" variant="ghost" className="flex-1" onClick={() => setEditingCase(null)}>Annuler</Button>
              </div>
            </form>
          </Card>
        )}

        {editingModule && (
          <div className="space-y-6">
            <Card className="p-6">
              <form onSubmit={handleSaveModule} className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">Édition Module {editingModule.id}</h3>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="isReporting" 
                      checked={editingModule.isReporting} 
                      onChange={e => setEditingModule({...editingModule, isReporting: e.target.checked})}
                    />
                    <label htmlFor="isReporting" className="text-xs font-bold">Signalement</label>
                  </div>
                </div>
                
                <Input 
                  label="Titre" 
                  value={editingModule.title} 
                  onChange={e => setEditingModule({...editingModule, title: e.target.value})} 
                />
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Introduction</label>
                  <textarea 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl min-h-[80px] text-sm"
                    value={editingModule.introduction}
                    onChange={e => setEditingModule({...editingModule, introduction: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contenu (Markdown)</label>
                  <textarea 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl min-h-[200px] text-sm font-mono"
                    value={editingModule.content}
                    onChange={e => setEditingModule({...editingModule, content: e.target.value})}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Médias & Fichiers</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500">Audio (Fon)</label>
                      <input type="file" accept="audio/*" onChange={e => handleModuleFileUpload(e, 'audio')} className="text-[10px] w-full" />
                      {editingModule.audioUrl && <p className="text-[10px] text-emerald-600 truncate">{editingModule.audioUrl}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500">Vidéo (Cours)</label>
                      <input type="file" accept="video/*" onChange={e => handleModuleFileUpload(e, 'video')} className="text-[10px] w-full" />
                      {editingModule.videoUrl && <p className="text-[10px] text-emerald-600 truncate">{editingModule.videoUrl}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500">Documents PDF</label>
                    <input type="file" accept=".pdf" onChange={e => handleModuleFileUpload(e, 'pdf')} className="text-[10px] w-full" />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editingModule.attachments?.map(att => (
                        <div key={att.id} className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded text-[10px]">
                          <Paperclip size={10} /> {att.name}
                          <button onClick={() => setEditingModule({...editingModule, attachments: editingModule.attachments?.filter(a => a.id !== att.id)})} className="text-red-500">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Quiz ({editingModule.quiz?.length || 0} questions)</h4>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEditingModule({...editingModule, quiz: [...(editingModule.quiz || []), { id: Date.now().toString(), question: 'Nouvelle question', options: ['Option 1', 'Option 2'], correctAnswer: 0 }]})}>
                      <Plus size={14} className="mr-1" /> Ajouter
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    {editingModule.quiz?.map((q, idx) => (
                      <div key={q.id} className="p-4 bg-slate-50 rounded-xl space-y-3 relative">
                        <button 
                          type="button"
                          className="absolute top-2 right-2 text-red-500"
                          onClick={() => setEditingModule({...editingModule, quiz: editingModule.quiz?.filter(item => item.id !== q.id)})}
                        >
                          <Trash2 size={14} />
                        </button>
                        <Input 
                          label={`Question ${idx + 1}`} 
                          value={q.question} 
                          onChange={e => {
                            const newQuiz = [...(editingModule.quiz || [])];
                            newQuiz[idx].question = e.target.value;
                            setEditingModule({...editingModule, quiz: newQuiz});
                          }}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                name={`correct-${q.id}`} 
                                checked={q.correctAnswer === oIdx}
                                onChange={() => {
                                  const newQuiz = [...(editingModule.quiz || [])];
                                  newQuiz[idx].correctAnswer = oIdx;
                                  setEditingModule({...editingModule, quiz: newQuiz});
                                }}
                              />
                              <input 
                                className="flex-1 text-xs p-2 border rounded"
                                value={opt}
                                onChange={e => {
                                  const newQuiz = [...(editingModule.quiz || [])];
                                  newQuiz[idx].options[oIdx] = e.target.value;
                                  setEditingModule({...editingModule, quiz: newQuiz});
                                }}
                              />
                            </div>
                          ))}
                          <button 
                            type="button"
                            className="text-[10px] text-emerald-600 font-bold"
                            onClick={() => {
                              const newQuiz = [...(editingModule.quiz || [])];
                              newQuiz[idx].options.push(`Option ${newQuiz[idx].options.length + 1}`);
                              setEditingModule({...editingModule, quiz: newQuiz});
                            }}
                          >
                            + Ajouter option
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-6">
                  <Button type="submit" className="flex-1">Enregistrer tout le module</Button>
                  <Button variant="ghost" className="flex-1" onClick={() => setEditingModule(null)}>Annuler</Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

const SettingsScreen = ({ 
  user, 
  progress,
  modules,
  settings,
  onUpdateLanguage, 
  onLogout, 
  onBack,
  onOpenAdmin
}: { 
  user: any, 
  progress: any,
  modules: Module[],
  settings: AppSettings,
  onUpdateLanguage: (l: Language) => void, 
  onLogout: () => void, 
  onBack: () => void,
  onOpenAdmin: () => void
}) => {
  const generateCertificate = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Background
    doc.setFillColor(245, 252, 250);
    doc.rect(0, 0, 297, 210, 'F');
    
    // Border
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);
    
    // Logo if exists
    if (settings.logoUrl) {
      try {
        doc.addImage(settings.logoUrl, 'PNG', 133.5, 20, 30, 30);
      } catch (e) {
        console.error("Could not add logo to PDF", e);
      }
    }

    // Content
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(40);
    doc.text('ATTESTATION DE RÉUSSITE', 148.5, 70, { align: 'center' });
    
    doc.setFontSize(20);
    doc.text('Décernée à', 148.5, 95, { align: 'center' });
    
    doc.setFontSize(32);
    doc.setTextColor(5, 150, 105);
    doc.text(user.fullName.toUpperCase(), 148.5, 120, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(71, 85, 105);
    doc.text('Pour avoir complété avec succès la formation de', 148.5, 140, { align: 'center' });
    doc.setFontSize(20);
    doc.text('PARAJURISTE COMMUNAUTAIRE', 148.5, 155, { align: 'center' });
    
    const date = new Date().toLocaleDateString('fr-FR');
    doc.setFontSize(12);
    doc.text(`Délivrée le : ${date}`, 40, 185);
    doc.text(`Code de vérification : PL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, 40, 192);
    
    doc.text(`Signature de ${settings.organizationName}`, 220, 185);
    doc.setDrawColor(71, 85, 105);
    doc.line(200, 195, 260, 195);

    doc.save(`Attestation_Paralegal_${user.fullName.replace(/\s/g, '_')}.pdf`);
  };

  const isFullyCompleted = progress.finalExamScore !== undefined && progress.finalExamScore >= 80;

  return (
    <div className="h-full bg-slate-50 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-white shrink-0 z-10">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <h2 className="font-bold">Paramètres & Profil</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
        <Card className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 overflow-hidden">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <UserIcon size={28} />
            )}
          </div>
          <div>
            <h3 className="font-bold">{user.fullName}</h3>
            <p className="text-xs text-slate-500">{user.phone} • {user.location}</p>
          </div>
        </Card>

        {user.isAdmin && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Administration</h4>
            <Card className="p-0 overflow-hidden">
              <button 
                onClick={onOpenAdmin}
                className="w-full p-5 flex items-center justify-between bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Settings size={20} className="text-emerald-600" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-emerald-900">Tableau de bord Admin</p>
                    <p className="text-[10px] text-emerald-600">Gérer les utilisateurs et le contenu</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-emerald-400" />
              </button>
            </Card>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Préférences</h4>
          <Card className="p-0 overflow-hidden">
            <button 
              onClick={() => onUpdateLanguage(user.preferredLanguage === 'fr' ? 'fon' : 'fr')}
              className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Globe size={20} className="text-slate-400" />
                <div className="text-left">
                  <p className="text-sm font-medium">Langue d'apprentissage</p>
                  <p className="text-xs text-emerald-600 font-bold">{user.preferredLanguage === 'fr' ? 'Français' : 'Fon'}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          </Card>
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Formation</h4>
          <Card className="p-6 space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-slate-500">Modules validés</p>
                <p className="text-2xl font-bold">{progress.completedModules.length} / {modules.length}</p>
              </div>
              <Award size={32} className={cn(isFullyCompleted ? "text-emerald-500" : "text-slate-200")} />
            </div>
            
            {user.preferredLanguage === 'fr' ? (
              isFullyCompleted ? (
                <Button className="w-full gap-2" onClick={generateCertificate}>
                  <Download size={18} /> Télécharger l'attestation
                </Button>
              ) : (
                <p className="text-[10px] text-slate-400 text-center italic">
                  L'attestation sera disponible une fois tous les modules validés.
                </p>
              )
            ) : (
              isFullyCompleted ? (
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center">
                  <p className="text-xs text-orange-800 font-medium mb-3">
                    Félicitations ! Vous avez écouté tous les modules.
                  </p>
                  <p className="text-[10px] text-orange-700 leading-relaxed mb-4">
                    Veuillez passer au siège de {settings.organizationName} pour l'examen final afin d'obtenir votre attestation physique.
                  </p>
                  <Button variant="outline" size="sm" className="w-full border-orange-200 text-orange-700">
                    Contacter HAI sur WhatsApp
                  </Button>
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 text-center italic">
                  Écoutez tous les modules pour être éligible à l'examen.
                </p>
              )
            )}
          </Card>
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Système</h4>
          <Card className="p-0 overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-3">
                <Download size={20} className="text-slate-400" />
                <div className="text-left">
                  <p className="text-sm font-medium">Mode Hors-Ligne</p>
                  <p className="text-[10px] text-slate-500">Contenu disponible sans internet</p>
                </div>
              </div>
              <div className="w-10 h-6 bg-emerald-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
            <button 
              onClick={() => alert("Cache vidé avec succès")}
              className="w-full p-5 flex items-center gap-3 hover:bg-slate-50 transition-colors"
            >
              <X size={20} className="text-slate-400" />
              <p className="text-sm font-medium">Vider le cache</p>
            </button>
          </Card>
        </div>

        <Button variant="outline" className="w-full text-red-500 border-red-100 hover:bg-red-50" onClick={onLogout}>
          <LogOut size={18} className="mr-2" /> Déconnexion
        </Button>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const { 
    user, 
    progress, 
    modules,
    glossary,
    legalDocuments,
    caseStudies,
    settings,
    isLoading,
    error,
    registerUser, 
    login,
    setLanguage, 
    completeModule, 
    markAudioListened,
    completeCaseStudy,
    setFinalExamScore,
    logout,
    deleteUser,
    saveModule,
    deleteModule,
    saveGlossaryTerm,
    deleteGlossaryTerm,
    saveLegalDocument,
    deleteLegalDocument,
    saveCaseStudy,
    deleteCaseStudy,
    saveSettings,
    uploadFile
  } = useAppState();

  const [currentScreen, setCurrentScreen] = useState<'main' | 'module' | 'settings' | 'glossary' | 'documents' | 'assistant' | 'cases' | 'performance' | 'exam' | 'admin'>('main');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    if (user && !localStorage.getItem('paralegal_intro_seen')) {
      setShowIntro(true);
    }
  }, [user]);

  const handleRegister = (data: any) => {
    registerUser(data);
  };

  const handleLogin = (phone: string, pass: string) => {
    login(phone, pass);
  };

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('paralegal_intro_seen', 'true');
    setShowIntro(false);
  };

  const handleModuleSelect = (m: Module) => {
    setSelectedModule(m);
    setCurrentScreen('module');
  };

  if (!user) {
    return (
      <AuthScreen 
        onRegister={handleRegister} 
        onLogin={handleLogin} 
        isLoading={isLoading} 
        error={error} 
      />
    );
  }

  if (showIntro) {
    return <LanguageSelectionScreen onSelect={handleLanguageSelect} />;
  }

  return (
    <div className="max-w-2xl mx-auto bg-slate-50 min-h-screen shadow-2xl shadow-slate-200 relative overflow-x-hidden">
      <AnimatePresence mode="wait">
        {currentScreen === 'main' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Dashboard 
              user={user} 
              progress={progress} 
              modules={modules}
              caseStudies={caseStudies}
              onSelectModule={handleModuleSelect}
              onOpenSettings={() => setCurrentScreen('settings')}
              onOpenCases={() => setCurrentScreen('cases')}
              onOpenPerformance={() => setCurrentScreen('performance')}
              onOpenExam={() => setCurrentScreen('exam')}
            />
          </motion.div>
        )}

        {currentScreen === 'module' && selectedModule && (
          <motion.div 
            key="module"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-white max-w-2xl mx-auto shadow-2xl"
          >
            <ModuleDetail 
              module={selectedModule}
              user={user}
              progress={progress}
              onBack={() => setCurrentScreen('main')}
              onComplete={(score) => {
                if (user.preferredLanguage === 'fr') {
                  completeModule(selectedModule.id, score);
                } else {
                  markAudioListened(selectedModule.id);
                }
              }}
            />
          </motion.div>
        )}

        {currentScreen === 'settings' && (
          <motion.div 
            key="settings"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-slate-50 max-w-2xl mx-auto shadow-2xl overflow-y-auto"
          >
            <SettingsScreen 
              user={user}
              progress={progress}
              modules={modules}
              settings={settings}
              onUpdateLanguage={setLanguage}
              onLogout={logout}
              onBack={() => setCurrentScreen('main')}
              onOpenAdmin={() => setCurrentScreen('admin')}
            />
          </motion.div>
        )}

        {currentScreen === 'glossary' && (
          <motion.div 
            key="glossary"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-slate-50 max-w-2xl mx-auto shadow-2xl overflow-y-auto"
          >
            <GlossaryScreen onBack={() => setCurrentScreen('main')} glossary={glossary} />
          </motion.div>
        )}

        {currentScreen === 'documents' && (
          <motion.div 
            key="documents"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-slate-50 max-w-2xl mx-auto shadow-2xl overflow-y-auto"
          >
            <DocumentsScreen onBack={() => setCurrentScreen('main')} documents={legalDocuments} />
          </motion.div>
        )}

        {currentScreen === 'assistant' && (
          <motion.div 
            key="assistant"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-slate-50 max-w-2xl mx-auto shadow-2xl overflow-y-auto"
          >
            <AssistantScreen onBack={() => setCurrentScreen('main')} />
          </motion.div>
        )}

        {currentScreen === 'cases' && (
          <motion.div 
            key="cases"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-slate-50 max-w-2xl mx-auto shadow-2xl overflow-y-auto"
          >
            <CaseStudiesScreen 
              onBack={() => setCurrentScreen('main')} 
              progress={progress}
              caseStudies={caseStudies}
              onComplete={completeCaseStudy}
            />
          </motion.div>
        )}

        {currentScreen === 'performance' && (
          <motion.div 
            key="performance"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-slate-50 max-w-2xl mx-auto shadow-2xl overflow-y-auto"
          >
            <PerformanceScreen 
              progress={progress}
              modules={modules}
              caseStudies={caseStudies}
              onBack={() => setCurrentScreen('main')}
            />
          </motion.div>
        )}

        {currentScreen === 'exam' && (
          <motion.div 
            key="exam"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white max-w-2xl mx-auto overflow-y-auto"
          >
            <FinalExamScreen 
              onBack={() => setCurrentScreen('main')}
              onComplete={setFinalExamScore}
              modules={modules}
            />
          </motion.div>
        )}

        {currentScreen === 'admin' && (
          <motion.div 
            key="admin"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 max-w-2xl mx-auto shadow-2xl"
          >
            <AdminDashboard 
              onBack={() => setCurrentScreen('settings')}
              modules={modules}
              glossary={glossary}
              legalDocuments={legalDocuments}
              caseStudies={caseStudies}
              settings={settings}
              onSaveModule={saveModule}
              onDeleteModule={deleteModule}
              onSaveGlossaryTerm={saveGlossaryTerm}
              onDeleteGlossaryTerm={deleteGlossaryTerm}
              onSaveLegalDocument={saveLegalDocument}
              onDeleteLegalDocument={deleteLegalDocument}
              onSaveCaseStudy={saveCaseStudy}
              onDeleteCaseStudy={deleteCaseStudy}
              onDeleteUser={deleteUser}
              onSaveSettings={saveSettings}
              onUploadFile={uploadFile}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation (Mini) */}
      {currentScreen === 'main' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-[calc(672px-3rem)] bg-slate-900 text-white rounded-2xl p-2 flex justify-around items-center shadow-xl z-20">
          <button className={cn("p-3 transition-colors", currentScreen === 'main' ? "text-emerald-400" : "text-slate-400 hover:text-white")} onClick={() => setCurrentScreen('main')}>
            <BookOpen size={24} />
          </button>
          <button className="p-3 text-slate-400 hover:text-white" onClick={() => setCurrentScreen('glossary')}>
            <Library size={24} />
          </button>
          <button className="p-3 text-slate-400 hover:text-white" onClick={() => setCurrentScreen('assistant')}>
            <Sparkles size={24} />
          </button>
          <button className="p-3 text-slate-400 hover:text-white" onClick={() => setCurrentScreen('documents')}>
            <FileText size={24} />
          </button>
          <button className="p-3 text-slate-400 hover:text-white" onClick={() => setCurrentScreen('settings')}>
            <UserIcon size={24} />
          </button>
        </div>
      )}
    </div>
  );
}

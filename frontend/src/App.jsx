import { useState, useEffect } from 'react'
import axios from 'axios'
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/sidebar"
import { DashboardContent } from "@/components/dashboard-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { 
  Plus, Search, Activity, Trash2, Edit, FileText, User, Menu, X, Lock, Unlock,
  Users, Calendar, TrendingUp, Clock, Printer, ChevronDown, Eye, Mail, LogOut,
  ChevronRight, Shield, ClipboardList, Heart
} from "lucide-react"

const API_URL = 'https://cardio-app-production.up.railway.app/api';

export default function App() {
  const [showLanding, setShowLanding] = useState(!localStorage.getItem('jwt_token'));
  const [token, setToken] = useState(localStorage.getItem('jwt_token')); 
  const [role, setRole] = useState(localStorage.getItem('user_role')); 
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  
  const [pacientes, setPacientes] = useState([])
  const [nuevoPaciente, setNuevoPaciente] = useState({ nombre: '', apellido: '', dni: '' })
  
  // Modals
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null)
  const [pacienteAEditar, setPacienteAEditar] = useState(null)
  const [mostrarModalHistoria, setMostrarModalHistoria] = useState(false)
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false)
  const [consultaParaImprimir, setConsultaParaImprimir] = useState(null)

  const [consultas, setConsultas] = useState([])
  
  // NUEVA CONSULTA (Valores por defecto fijos)
  const [nuevaConsulta, setNuevaConsulta] = useState({ 
      motivo: '', 
      diagnostico: '', 
      tratamiento: '', 
      observaciones: '',
      tipo: 'Consulta General', 
      estado: 'Completada',
      fecha: new Date().toISOString().split('T')[0]
  })
  
  const [listaMedicos, setListaMedicos] = useState([])
  const [nuevoMedicoData, setNuevoMedicoData] = useState({ username: '', password: '' });

  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [dashboardData, setDashboardData] = useState(null);
  
  // Search Advanced
  const [searchParams, setSearchParams] = useState({ 
    query: '', 
    desde: '', 
    hasta: '',
    filterType: 'todos'
  });
  const [resultadosBusqueda, setResultadosBusqueda] = useState(null);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  
  // Historias Clínicas (Todas las consultas)
  const [todasLasConsultas, setTodasLasConsultas] = useState([]);
  const [filtrosConsultas, setFiltrosConsultas] = useState({ estado: 'todas' });

  const getConfig = () => ({ headers: { Authorization: `Bearer ${token}` } });

  useEffect(() => {
    if (token && role === 'MEDICO') {
      cargarPacientes();
      cargarDashboard();
      cargarTodasLasConsultas();
      setActiveTab("dashboard");
    }
    if (token && role === 'ADMIN') {
      cargarMedicos();
      setActiveTab("admin_usuarios");
    }
  }, [token, role])

  // Sistema de cierre de sesión por inactividad (15 minutos)
  useEffect(() => {
    if (!token) return;
    
    let inactivityTimer;
    const INACTIVITY_TIME = 15 * 60 * 1000; // 15 minutos en milisegundos

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        alert("Sesión cerrada por inactividad");
        cerrarSesion();
      }, INACTIVITY_TIME);
    };

    // Eventos que resetean el timer de inactividad
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    resetTimer(); // Iniciar el timer

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [token])

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, loginData);
      setToken(res.data.token); setRole(res.data.role);
      localStorage.setItem('jwt_token', res.data.token); localStorage.setItem('user_role', res.data.role);
      setShowLanding(false);
    } catch (error) { alert("Error de credenciales") }
  }
  
  const cerrarSesion = () => {
    setToken(null); setRole(null);
    localStorage.removeItem('jwt_token'); localStorage.removeItem('user_role');
    setPacientes([]); setDashboardData(null);
    setShowLanding(true);
  }

  const cargarPacientes = async () => {
    try { 
      const res = await axios.get(`${API_URL}/pacientes`, getConfig()); 
      setPacientes(res.data || []); 
    } catch (error) {
      console.error("Error cargando pacientes:", error);
      setPacientes([]);
    }
  }

  const cargarDashboard = async () => {
    try {
        const res = await axios.get(`${API_URL}/dashboard`, getConfig());
        setDashboardData(res.data);
    } catch (error) { console.error("Error cargando dashboard", error); }
  }

  const cargarTodasLasConsultas = async () => {
    try {
        const res = await axios.get(`${API_URL}/consultas`, getConfig());
        setTodasLasConsultas(res.data || []);
    } catch (error) { console.error("Error cargando consultas", error); }
  }

  const guardarPaciente = async (e) => {
    e.preventDefault();
    try { 
        // Primero crear el paciente
        const resPaciente = await axios.post(`${API_URL}/pacientes`, nuevoPaciente, getConfig()); 
        const pacienteId = resPaciente.data.id;
        
        // Si hay datos de consulta, guardarla también
        if (nuevaConsulta.motivo || nuevaConsulta.diagnostico) {
          await axios.post(`${API_URL}/consultas/${pacienteId}`, nuevaConsulta, getConfig());
        }
        
        alert("Historia Clínica Guardada Exitosamente"); 
        setNuevoPaciente({nombre:'',apellido:'',dni:''}); 
        setNuevaConsulta({motivo:'',diagnostico:'',tratamiento:'', observaciones:'', tipo:'Consulta General', estado:'Completada', fecha: new Date().toISOString().split('T')[0]});
        cargarPacientes(); 
        cargarDashboard();
        cargarTodasLasConsultas();
        setActiveTab('dashboard'); // Redirigir al dashboard
    } catch (error) { 
      console.error("Error:", error);
      alert("Error al guardar: " + (error.response?.data?.message || error.message)) 
    }
  }

  const eliminarPaciente = async (id) => {
    if(!window.confirm("¿Está seguro de eliminar este paciente? Esta acción no se puede deshacer.")) return;
    try { 
      await axios.delete(`${API_URL}/pacientes/${id}`, getConfig()); 
      cargarPacientes(); 
      cargarDashboard();
      cargarTodasLasConsultas();
      alert("Paciente eliminado exitosamente");
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar: " + (error.response?.data?.message || "No se pudo eliminar el paciente"))
    }
  }

  const prepararEdicion = (paciente) => { setPacienteAEditar(paciente); setMostrarModalEditar(true); }
  const actualizarPaciente = async () => {
    try { 
      await axios.put(`${API_URL}/pacientes/${pacienteAEditar.id}`, pacienteAEditar, getConfig()); 
      setMostrarModalEditar(false); 
      cargarPacientes();
      cargarTodasLasConsultas();
      alert("Paciente actualizado exitosamente");
    } catch (error) {
      console.error("Error:", error);
      alert("Error al actualizar: " + (error.response?.data?.message || error.message))
    }
  }

  const handleBusqueda = async (termino) => {
    setSearchTerm(termino);
    if (termino.length === 0) { 
      cargarPacientes(); 
      return; 
    }
    if (termino.length < 2) return; // Esperar al menos 2 caracteres
    
    try { 
      const res = await axios.get(`${API_URL}/pacientes/buscar?query=${termino}`, getConfig()); 
      setPacientes(res.data || []); 
    } catch (error) { 
      console.error("Error en búsqueda:", error);
      // No mostrar alerta para no molestar al usuario mientras escribe
    }
  }

  const realizarBusquedaAvanzada = async () => {
    if (!searchParams.query && !searchParams.desde && !searchParams.hasta) {
      alert("Ingresa al menos un criterio de búsqueda");
      return;
    }
    
    try {
      const params = new URLSearchParams();
      if (searchParams.query) params.append('query', searchParams.query);
      if (searchParams.desde) params.append('desde', searchParams.desde);
      if (searchParams.hasta) params.append('hasta', searchParams.hasta);
      
      const res = await axios.get(`${API_URL}/consultas/buscar?${params.toString()}`, getConfig());
      setResultadosBusqueda(res.data || []);
      setBusquedaRealizada(true);
    } catch (error) {
      console.error("Error en búsqueda:", error);
      setResultadosBusqueda([]);
      setBusquedaRealizada(true);
      alert("Error al realizar búsqueda: " + (error.response?.data?.message || "Intenta nuevamente"));
    }
  }

  const abrirHistoria = async (paciente) => {
    setPacienteSeleccionado(paciente);
    try { 
      const res = await axios.get(`${API_URL}/consultas/paciente/${paciente.id}`, getConfig()); 
      setConsultas(res.data || []); 
      setMostrarModalHistoria(true); 
    } catch (error) {
      console.error("Error cargando historia:", error);
      setConsultas([]);
      setMostrarModalHistoria(true);
      // No mostrar alerta, permitir que se abra el modal vacío
    }
  }

  const guardarConsulta = async () => {
    if (!pacienteSeleccionado) return;
    try { 
        await axios.post(`${API_URL}/consultas/${pacienteSeleccionado.id}`, nuevaConsulta, getConfig()); 
        // Reset a valores por defecto
        setNuevaConsulta({motivo:'',diagnostico:'',tratamiento:'', observaciones:'', tipo:'Consulta General', estado:'Completada', fecha: new Date().toISOString().split('T')[0]}); 
        const res = await axios.get(`${API_URL}/consultas/paciente/${pacienteSeleccionado.id}`, getConfig()); 
        setConsultas(res.data); 
        cargarDashboard(); // Actualizar tabla dashboard
        cargarTodasLasConsultas(); // Actualizar lista de consultas
        alert("Guardado exitosamente");
    } catch (error) { alert("Error al guardar consulta") }
  }

  const handlePrint = () => window.print();

  // Admin
  const cargarMedicos = async () => { 
    try { 
      const res = await axios.get(`${API_URL}/admin/medicos`, getConfig()); 
      setListaMedicos(res.data || []); 
    } catch (error) { 
      console.error("Error cargando médicos:", error);
      setListaMedicos([]);
    } 
  }
  const crearMedicoAdmin = async () => { try { await axios.post(`${API_URL}/admin/medicos`, nuevoMedicoData, getConfig()); cargarMedicos(); alert("Creado"); } catch (error) {} }
  const toggleMedico = async (id) => { try { await axios.put(`${API_URL}/admin/medicos/${id}/toggle`, {}, getConfig()); cargarMedicos(); } catch (error) { } }
  const eliminarMedico = async (id) => { if(!window.confirm("¿Confirmar?")) return; try { await axios.delete(`${API_URL}/admin/medicos/${id}`, getConfig()); cargarMedicos() } catch (error) { } }


  // LANDING PAGE
  if (showLanding && !token) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Animated Background Elements - Sutiles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border shadow-sm animate-in fade-in slide-in-from-top duration-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center hover:scale-110 transition-transform duration-300">
                  <Activity className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-semibold text-foreground">MediRecord</span>
              </div>
              <nav className="hidden md:flex items-center gap-8">
                <a href="#caracteristicas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Características</a>
                <a href="#beneficios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Beneficios</a>
                <a href="#seguridad" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Seguridad</a>
              </nav>
              <Button onClick={() => setShowLanding(false)}>
                Acceder al Sistema<ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Heart className="w-4 h-4" />
                  Sistema de Gestión Médica
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Gestiona tus historias clínicas de forma{" "}
                  <span className="text-primary">
                    simple y segura
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                  MediRecord es tu plataforma integral para almacenar, organizar y acceder a historias clínicas de pacientes. Diseñado para profesionales de la salud que buscan eficiencia y seguridad.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8" onClick={() => setShowLanding(false)}>
                    Comenzar Ahora<ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8" onClick={() => document.getElementById('caracteristicas').scrollIntoView({behavior: 'smooth'})}>
                    Conocer más
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-6 sm:gap-8 pt-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">10k+</p>
                    <p className="text-sm text-muted-foreground">Historias Gestionadas</p>
                  </div>
                  <div className="w-px h-12 bg-border" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">500+</p>
                    <p className="text-sm text-muted-foreground">Profesionales</p>
                  </div>
                  <div className="w-px h-12 bg-border" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">99.9%</p>
                    <p className="text-sm text-muted-foreground">Disponibilidad</p>
                  </div>
                </div>
              </div>
              <div className="relative animate-in fade-in slide-in-from-right duration-1000 delay-300">
                <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-3xl"></div>
                <Card className="relative overflow-hidden border-2 hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="bg-sidebar p-4 flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      <span className="text-sm font-medium text-sidebar-foreground/80">MediRecord Dashboard</span>
                    </div>
                    <div className="p-6 space-y-4 bg-muted/10">
                      <div className="flex items-center gap-4 p-4 bg-muted rounded-xl hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center"><Users className="w-6 h-6 text-primary-foreground" /></div>
                        <div className="flex-1"><p className="font-semibold text-foreground">María García López</p><p className="text-sm text-muted-foreground">ID: PAC-2024-0156</p></div>
                        <div className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold border border-accent/20">Activo</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded-xl hover:shadow-md transition-shadow">
                          <p className="text-2xl font-bold text-primary">24</p>
                          <p className="text-sm text-muted-foreground">Consultas</p>
                        </div>
                        <div className="p-4 bg-muted rounded-xl hover:shadow-md transition-shadow">
                          <p className="text-2xl font-bold text-accent">3</p>
                          <p className="text-sm text-muted-foreground">Tratamientos</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg hover:shadow-md transition-shadow">
                          <span className="text-sm font-medium text-foreground">Última consulta</span>
                          <span className="text-sm text-muted-foreground">15 Ene 2026</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg hover:shadow-md transition-shadow border border-primary/20">
                          <span className="text-sm font-medium text-foreground">Próxima cita</span>
                          <span className="text-sm text-primary font-bold">22 Feb 2026</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="caracteristicas" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-muted/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-1000">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4 border border-primary/20">
                <FileText className="w-4 h-4" />
                Características Principales
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Todo lo que necesitas para gestionar historias clínicas</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Herramientas poderosas diseñadas específicamente para profesionales de la salud</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom duration-700 delay-100">
                <CardContent className="p-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    Crear Historias Clínicas
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Registra nuevas historias clínicas con formularios intuitivos que capturan toda la información médica relevante del paciente.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
                <CardContent className="p-6">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <ClipboardList className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
                    Gestión Centralizada
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Administra todas las historias clínicas desde un solo lugar. Edita, actualiza y organiza la información de manera eficiente.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
                <CardContent className="p-6">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Search className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-purple-600 transition-colors">
                    Búsqueda Avanzada
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Encuentra rápidamente cualquier historia clínica usando múltiples filtros: nombre, fecha, diagnóstico o número de expediente.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom duration-700 delay-400">
                <CardContent className="p-6">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-cyan-600 transition-colors">
                    Directorio de Pacientes
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Mantén un registro completo de todos tus pacientes con acceso rápido a su información de contacto e historial médico.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom duration-700 delay-500">
                <CardContent className="p-6">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-orange-600 transition-colors">
                    Historial Completo
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Accede al historial completo de cada paciente, incluyendo consultas previas, tratamientos y evolución médica.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom duration-700 delay-600">
                <CardContent className="p-6">
                  <div className="w-16 h-16 rounded-2xl bg-pink-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-pink-600 transition-colors">
                    Panel de Control
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Visualiza estadísticas y métricas importantes de tu práctica médica en un dashboard intuitivo y fácil de usar.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="beneficios" className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-semibold border border-accent/20">
                  <TrendingUp className="w-4 h-4" />
                  Ventajas Competitivas
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Beneficios que transformarán tu práctica médica</h2>
                <div className="space-y-5">
                  <div className="flex gap-4 group hover:translate-x-2 transition-transform duration-300">
                    <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div><h3 className="font-bold text-foreground mb-1 text-lg">Ahorra tiempo</h3><p className="text-muted-foreground">Reduce el tiempo de documentación hasta un 60% con formularios optimizados y autocompletado inteligente.</p></div>
                  </div>
                  <div className="flex gap-4 group hover:translate-x-2 transition-transform duration-300">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                    <div><h3 className="font-bold text-foreground mb-1 text-lg">Acceso inmediato</h3><p className="text-muted-foreground">Encuentra cualquier historia clínica en segundos con nuestro potente motor de búsqueda.</p></div>
                  </div>
                  <div className="flex gap-4 group hover:translate-x-2 transition-transform duration-300">
                    <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div><h3 className="font-bold text-foreground mb-1 text-lg">Cumplimiento normativo</h3><p className="text-muted-foreground">Cumple con las regulaciones de protección de datos médicos y mantén registros auditables.</p></div>
                  </div>
                  <div className="flex gap-4 group hover:translate-x-2 transition-transform duration-300">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div><h3 className="font-bold text-foreground mb-1 text-lg">Mejor atención al paciente</h3><p className="text-muted-foreground">Con información completa y accesible, brinda una atención más personalizada y efectiva.</p></div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5 animate-in fade-in slide-in-from-right duration-1000 delay-300">
                <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="text-5xl font-bold text-primary mb-3">60%</div>
                  <p className="text-sm font-medium text-muted-foreground">Menos tiempo en documentación</p>
                </Card>
                <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="text-5xl font-bold text-accent mb-3">100%</div>
                  <p className="text-sm font-medium text-muted-foreground">Digital y sin papel</p>
                </Card>
                <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="text-5xl font-bold text-chart-3 mb-3">24/7</div>
                  <p className="text-sm font-medium text-muted-foreground">Acceso disponible</p>
                </Card>
                <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="text-5xl font-bold text-primary mb-3">5s</div>
                  <p className="text-sm font-medium text-muted-foreground">Tiempo de búsqueda</p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="seguridad" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-sidebar via-sidebar to-sidebar/95 text-sidebar-foreground overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.05),transparent)] pointer-events-none"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent)] pointer-events-none"></div>
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-1000">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-sidebar-accent to-sidebar-accent/80 text-sidebar-foreground text-sm font-bold mb-6 shadow-lg border border-sidebar-foreground/10 hover:scale-105 transition-transform duration-300">
                <Lock className="w-4 h-4" />
                Seguridad de Nivel Hospitalario
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Tus datos protegidos con los más altos estándares</h2>
              <p className="text-lg text-sidebar-foreground/80 max-w-2xl mx-auto">La información médica de tus pacientes está protegida con encriptación de grado militar</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center group hover:-translate-y-2 transition-all duration-300">
                <div className="w-20 h-20 rounded-2xl bg-sidebar-primary flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Lock className="w-10 h-10 text-sidebar-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-sidebar-primary transition-colors">Encriptación AES-256</h3>
                <p className="text-sidebar-foreground/80 leading-relaxed">Todos los datos se encriptan en reposo y en tránsito con el estándar más seguro de la industria.</p>
              </div>
              <div className="text-center group hover:-translate-y-2 transition-all duration-300">
                <div className="w-20 h-20 rounded-2xl bg-sidebar-primary flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-10 h-10 text-sidebar-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-sidebar-primary transition-colors">Cumplimiento HIPAA</h3>
                <p className="text-sidebar-foreground/80 leading-relaxed">Diseñado para cumplir con las regulaciones internacionales de protección de datos médicos.</p>
              </div>
              <div className="text-center group hover:-translate-y-2 transition-all duration-300">
                <div className="w-20 h-20 rounded-2xl bg-sidebar-primary flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-10 h-10 text-sidebar-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-sidebar-primary transition-colors">Respaldos Automáticos</h3>
                <p className="text-sidebar-foreground/80 leading-relaxed">Copias de seguridad automáticas diarias para garantizar que nunca pierdas información crítica.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-primary/5">
          <div className="max-w-4xl mx-auto text-center relative animate-in fade-in slide-in-from-bottom duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20 hover:scale-105 transition-transform duration-300">
              <Activity className="w-4 h-4" />
              ¡Empieza Hoy Mismo!
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
              Comienza a gestionar tus <span className="text-primary">historias clínicas</span> hoy
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Únete a cientos de profesionales de la salud que ya confían en MediRecord para gestionar la información de sus pacientes de forma eficiente y segura.
            </p>
            <Button size="lg" className="text-base px-12 py-7 font-bold" onClick={() => setShowLanding(false)}>
              Acceder al Dashboard
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                Sin tarjeta de crédito
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                Configuración en 2 minutos
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                Soporte 24/7
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border bg-muted/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">MediRecord</span>
              </div>
              <p className="text-sm text-muted-foreground">© 2026 MediRecord. Sistema de Gestión de Historias Clínicas.</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // LOGIN PAGE
  if (!token) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Info Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">MediRecord</h1>
                <p className="text-sm text-gray-300">Sistema de Historias Clínicas</p>
              </div>
            </div>

            <div className="space-y-8 mt-16">
              <h2 className="text-4xl font-bold text-white leading-tight">
                Bienvenido de nuevo
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                Accede a tu cuenta para gestionar las historias clínicas de tus pacientes de forma segura y eficiente.
              </p>

              <div className="space-y-6 mt-12">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Máxima Seguridad</h3>
                    <p className="text-gray-400 text-sm">Encriptación de extremo a extremo para proteger la información de tus pacientes.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Acceso Inmediato</h3>
                    <p className="text-gray-400 text-sm">Consulta historiales médicos completos en segundos desde cualquier dispositivo.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Cumplimiento Normativo</h3>
                    <p className="text-gray-400 text-sm">Compatible con regulaciones HIPAA y estándares internacionales de salud.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-gray-400 text-sm">© 2026 MediRecord. Todos los derechos reservados.</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative">
          {/* Mobile Header */}
          <div className="absolute top-8 left-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">MediRecord</span>
            </div>
          </div>

          <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right duration-700">
            <div className="text-center lg:text-left">
              <button 
                onClick={() => setShowLanding(true)}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
              >
                ← Volver al inicio
              </button>
              <h2 className="text-3xl font-bold text-foreground mb-2">Iniciar Sesión</h2>
              <p className="text-muted-foreground">Ingresa tus credenciales para acceder al sistema</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    className="h-12 pl-10 bg-background border-2" 
                    placeholder="doctor@hospital.com" 
                    type="email"
                    onChange={(e) => setLoginData({...loginData, username: e.target.value})} 
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Contraseña</label>
                  <a href="#" className="text-sm text-primary hover:underline">¿Olvidaste tu contraseña?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    className="h-12 pl-10 bg-background border-2" 
                    type="password" 
                    placeholder="••••••••" 
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})} 
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()} 
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <label htmlFor="remember" className="text-sm text-muted-foreground">Mantener sesión iniciada</label>
              </div>

              <Button 
                className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
                onClick={handleLogin}
              >
                Ingresar al Sistema
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">o continúa con</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-12">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="h-12">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  Apple
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                ¿No tienes una cuenta?{' '}
                <a href="#" className="text-primary hover:underline font-medium">Solicita acceso</a>
              </p>

              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Conexión Segura</h4>
                    <p className="text-xs text-muted-foreground">Tus datos están protegidos con encriptación SSL de 256 bits</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <div className={cn("fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 print:hidden", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
        <Sidebar activeSection={activeTab} onSectionChange={(tab) => { setActiveTab(tab); setSidebarOpen(false); }} role={role} cerrarSesion={cerrarSesion} />
      </div>
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden print:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 h-screen overflow-y-auto print:overflow-visible print:h-auto">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b px-4 sm:px-6 h-16 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0"><Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></Button><h2 className="text-sm sm:text-lg font-semibold text-gray-800 truncate">{activeTab === 'pacientes' && 'Listado de Pacientes'}{activeTab === 'nuevo_paciente' && 'Nueva Historia Clínica'}{activeTab === 'admin_usuarios' && 'Panel de Administración'}{activeTab === 'dashboard' && 'Panel de Control'}{activeTab === 'historias_clinicas' && 'Historias Clínicas'}{activeTab === 'search' && 'Búsqueda Avanzada'}</h2></div>
          {activeTab === 'pacientes' && (<div className="hidden md:flex relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Buscar paciente..." className="pl-9 h-9 rounded-full" onChange={(e) => handleBusqueda(e.target.value)} /></div>)}
        </header>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6 print:p-0 print:m-0 print:max-w-none">
          
          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in zoom-in-95 duration-500 print:hidden">
              <DashboardContent 
                dashboardData={dashboardData} 
                onConsultaClick={(consulta) => setConsultaParaImprimir(consulta)}
              />
            </div>
          )}

          {/* HISTORIAS CLÍNICAS */}
          {activeTab === 'historias_clinicas' && (
            <div className="space-y-6 print:hidden">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Historias Clínicas</h2>
                  <p className="text-gray-500 mt-1">Gestione y consulte todas las historias clínicas registradas</p>
                </div>
              </div>

              <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input 
                      placeholder="Buscar por paciente, ID o diagnóstico..." 
                      className="pl-10 h-11 rounded-lg" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2 mb-6">
                    <Button 
                      variant={filtrosConsultas.estado === 'todas' ? 'default' : 'outline'}
                      onClick={() => setFiltrosConsultas({...filtrosConsultas, estado: 'todas'})}
                      className="rounded-full"
                    >
                      Todas
                    </Button>
                    <Button 
                      variant={filtrosConsultas.estado === 'Completada' ? 'default' : 'outline'}
                      onClick={() => setFiltrosConsultas({...filtrosConsultas, estado: 'Completada'})}
                      className="rounded-full"
                    >
                      Completadas
                    </Button>
                    <Button 
                      variant={filtrosConsultas.estado === 'En proceso' ? 'default' : 'outline'}
                      onClick={() => setFiltrosConsultas({...filtrosConsultas, estado: 'En proceso'})}
                      className="rounded-full"
                    >
                      En Proceso
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(filtrosConsultas.estado === 'todas' 
                      ? todasLasConsultas 
                      : todasLasConsultas.filter(c => c.estado === filtrosConsultas.estado)
                    ).filter(consulta => {
                      if (!searchTerm) return true;
                      const busqueda = searchTerm.toLowerCase();
                      const pacienteNombre = consulta.paciente ? `${consulta.paciente.nombre} ${consulta.paciente.apellido}`.toLowerCase() : '';
                      const id = consulta.id.toString();
                      const diagnostico = (consulta.diagnostico || '').toLowerCase();
                      return pacienteNombre.includes(busqueda) || id.includes(busqueda) || diagnostico.includes(busqueda);
                    }).map((consulta) => (
                      <Card key={consulta.id} className="border-none shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-14 h-14 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center text-lg font-bold">
                              {consulta.paciente ? `${consulta.paciente.nombre.charAt(0)}${consulta.paciente.apellido.charAt(0)}` : 'SD'}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900">
                                {consulta.paciente ? `${consulta.paciente.nombre} ${consulta.paciente.apellido}` : 'Sin datos del paciente'}
                              </h3>
                              <p className="text-sm text-cyan-600 font-semibold">HC-{consulta.id.toString().padStart(4, '0')}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3 border-t pt-4">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">DIAGNÓSTICO</p>
                              <p className="text-sm font-medium text-gray-800 mt-1">{consulta.diagnostico || 'Sin diagnóstico'}</p>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>{consulta.fecha || 'Sin fecha'}</span>
                              <span className={cn(
                                "font-medium",
                                consulta.estado === 'Completada' ? "text-emerald-600" : 
                                consulta.estado === 'En proceso' ? "text-blue-600" : "text-amber-600"
                              )}>
                                {consulta.estado || 'Pendiente'}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-4 pt-4 border-t">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="flex-1"
                              onClick={() => setConsultaParaImprimir(consulta)}
                            >
                              <Eye className="w-4 h-4 mr-2" /> Ver
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => consulta.paciente && abrirHistoria(consulta.paciente)}
                              disabled={!consulta.paciente}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-red-500 hover:text-red-700"
                              onClick={() => {/* TODO: Implementar eliminar consulta */}}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {(filtrosConsultas.estado === 'todas' ? todasLasConsultas : todasLasConsultas.filter(c => c.estado === filtrosConsultas.estado)).length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay historias clínicas</h3>
                      <p className="text-gray-500">Comienza creando una nueva historia clínica</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* OTRAS VISTAS */}
          {activeTab === 'pacientes' && (
            <div className="space-y-6 print:hidden">
              <div className="md:hidden relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar paciente..." className="pl-9" onChange={(e) => handleBusqueda(e.target.value)}/>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pacientes.map((p) => (
                  <Card key={p.id} className="border-none shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center text-lg font-bold">
                          {p.nombre.charAt(0)}{p.apellido.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{p.nombre} {p.apellido}</h3>
                          <p className="text-sm text-gray-500">45 años • {p.dni}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 border-t pt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>+34 612 345 678</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-cyan-600">{p.nombre.toLowerCase()}.{p.apellido.toLowerCase()}@email.com</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="text-xs">DNI: {p.dni}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Button 
                          className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-primary hover:text-white shadow-sm" 
                          size="sm" 
                          onClick={() => abrirHistoria(p)}
                        >
                          <FileText className="w-4 h-4 mr-2" /> Historia
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => prepararEdicion(p)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => eliminarPaciente(p.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'nuevo_paciente' && (
            <Card className="max-w-4xl mx-auto border-none shadow-md bg-white print:hidden">
              <CardHeader className="border-b bg-gray-50/50 px-8 py-6">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary"/>
                  Nueva Historia Clínica
                </CardTitle>
                <p className="text-sm text-gray-500 mt-2">Complete los datos del paciente y la información de la consulta</p>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={guardarPaciente} className="space-y-8">
                  {/* Sección Datos del Paciente */}
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <User className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-lg text-gray-900">Datos del Paciente</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Nombre</label>
                        <Input 
                          className="h-10 bg-gray-50" 
                          placeholder="Ej: María"
                          value={nuevoPaciente.nombre} 
                          onChange={(e) => setNuevoPaciente({...nuevoPaciente, nombre: e.target.value})} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Apellido</label>
                        <Input 
                          className="h-10 bg-gray-50" 
                          placeholder="Ej: García López"
                          value={nuevoPaciente.apellido} 
                          onChange={(e) => setNuevoPaciente({...nuevoPaciente, apellido: e.target.value})} 
                          required 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Documento de Identidad</label>
                        <Input 
                          className="h-10 bg-gray-50" 
                          placeholder="Ej: 12345678A"
                          value={nuevoPaciente.dni} 
                          onChange={(e) => setNuevoPaciente({...nuevoPaciente, dni: e.target.value})} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Edad</label>
                        <Input 
                          className="h-10 bg-gray-50" 
                          placeholder="Ej: 45"
                          type="number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sección Información de la Consulta */}
                  <div className="border-t pt-8">
                    <div className="flex items-center gap-2 mb-6">
                      <FileText className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-lg text-gray-900">Información de la Consulta</h3>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Fecha de Consulta</label>
                        <Input 
                          type="date" 
                          className="h-10 bg-gray-50"
                          value={nuevaConsulta.fecha}
                          onChange={(e) => setNuevaConsulta({...nuevaConsulta, fecha: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Síntomas / Motivo de Consulta</label>
                        <textarea 
                          className="flex w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-ring" 
                          rows={4}
                          placeholder="Describa los síntomas o motivo de la consulta..."
                          value={nuevaConsulta.motivo}
                          onChange={(e) => setNuevaConsulta({...nuevaConsulta, motivo: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Diagnóstico</label>
                        <textarea 
                          className="flex w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-ring" 
                          rows={3}
                          placeholder="Ingrese el diagnóstico..."
                          value={nuevaConsulta.diagnostico}
                          onChange={(e) => setNuevaConsulta({...nuevaConsulta, diagnostico: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Tratamiento Indicado</label>
                        <textarea 
                          className="flex w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-ring" 
                          rows={4}
                          placeholder="Describa el tratamiento indicado..."
                          value={nuevaConsulta.tratamiento}
                          onChange={(e) => setNuevaConsulta({...nuevaConsulta, tratamiento: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Observaciones Adicionales</label>
                        <textarea 
                          className="flex w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-ring" 
                          rows={3}
                          placeholder="Notas adicionales..."
                          value={nuevaConsulta.observaciones}
                          onChange={(e) => setNuevaConsulta({...nuevaConsulta, observaciones: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-4 border-t">
                    <Button type="button" variant="outline" size="lg">Cancelar</Button>
                    <Button type="submit" size="lg" className="px-12 shadow-lg shadow-primary/20">
                      <FileText className="w-4 h-4 mr-2" />
                      Guardar Historia Clínica
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'search' && (
            <div className="space-y-6 print:hidden max-w-4xl mx-auto">
              <Card className="border-none shadow-md bg-white">
                <CardHeader className="border-b bg-gray-50/50 px-8 py-6">
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-primary"/>
                    Criterios de Búsqueda
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        placeholder="Buscar por nombre, diagnóstico o palabras clave..." 
                        className="pl-9 h-11" 
                        value={searchParams.query}
                        onChange={(e) => setSearchParams({...searchParams, query: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Desde</label>
                        <Input 
                          type="date" 
                          className="h-10"
                          value={searchParams.desde}
                          onChange={(e) => setSearchParams({...searchParams, desde: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Hasta</label>
                        <Input 
                          type="date" 
                          className="h-10"
                          value={searchParams.hasta}
                          onChange={(e) => setSearchParams({...searchParams, hasta: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button onClick={realizarBusquedaAvanzada} size="lg" className="px-12 shadow-lg shadow-primary/20">
                        <Search className="w-4 h-4 mr-2" />
                        Buscar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {busquedaRealizada && (
                <Card className="border-none shadow-md bg-white">
                  <CardHeader className="border-b bg-gray-50/50 px-8 py-6">
                    <CardTitle>
                      Resultados de Búsqueda ({resultadosBusqueda?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {resultadosBusqueda && resultadosBusqueda.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                              <th className="px-6 py-4 text-xs font-semibold uppercase">ID</th>
                              <th className="px-6 py-4 text-xs font-semibold uppercase">PACIENTE</th>
                              <th className="px-6 py-4 text-xs font-semibold uppercase">FECHA</th>
                              <th className="px-6 py-4 text-xs font-semibold uppercase">DIAGNÓSTICO</th>
                              <th className="px-6 py-4 text-xs font-semibold uppercase">ESTADO</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {resultadosBusqueda.map((consulta) => (
                              <tr 
                                key={consulta.id} 
                                className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                                onClick={() => setConsultaParaImprimir(consulta)}
                              >
                                <td className="px-6 py-4 font-mono text-xs text-cyan-600 font-semibold">
                                  #{consulta.id.toString().padStart(6, '0')}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-800">
                                  {consulta.paciente ? `${consulta.paciente.nombre} ${consulta.paciente.apellido}` : "Sin datos"}
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                  {consulta.fecha}
                                </td>
                                <td className="px-6 py-4 text-gray-700">
                                  {consulta.diagnostico}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={cn(
                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                                    consulta.estado === "Completada"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                      : consulta.estado === "En proceso"
                                        ? "bg-blue-50 text-blue-700 border-blue-100"
                                        : "bg-amber-50 text-amber-700 border-amber-100"
                                  )}>
                                    {consulta.estado}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-12 text-center">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">No se encontraron resultados</h3>
                        <p className="text-gray-500">Intenta con otros criterios de búsqueda</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'admin_usuarios' && (
            <div className="space-y-6 print:hidden">
              <Card className="border-none shadow-sm bg-white"><CardHeader><CardTitle>Dar de alta Médico</CardTitle></CardHeader><CardContent className="flex flex-col md:flex-row gap-4"><Input placeholder="Email" value={nuevoMedicoData.username} onChange={(e) => setNuevoMedicoData({...nuevoMedicoData, username: e.target.value})} /><Input type="password" placeholder="Password" value={nuevoMedicoData.password} onChange={(e) => setNuevoMedicoData({...nuevoMedicoData, password: e.target.value})} /><Button onClick={crearMedicoAdmin}>Crear Cuenta</Button></CardContent></Card>
              <Card className="border-none shadow-sm overflow-hidden bg-white"><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-gray-100/50 text-gray-600 uppercase"><tr><th className="px-6 py-4">Usuario</th><th className="px-6 py-4">Acciones</th></tr></thead><tbody className="divide-y divide-gray-100">{listaMedicos.map((m) => (<tr key={m.id} className="hover:bg-gray-50"><td className="px-6 py-4 font-medium">{m.username}</td><td className="px-6 py-4 flex gap-2"><Button size="sm" variant="outline" onClick={() => toggleMedico(m.id)}>{m.enabled ? <Lock className="w-4 h-4"/> : <Unlock className="w-4 h-4"/>}</Button><Button size="sm" variant="outline" className="text-red-600" onClick={() => eliminarMedico(m.id)}><Trash2 className="w-4 h-4" /></Button></td></tr>))}</tbody></table></div></Card>
            </div>
          )}
        </div>
      </main>

      {/* ================= MODAL IMPRESIÓN PDF (ARREGLADO: SCROLL Y TAMAÑO) ================= */}
      {consultaParaImprimir && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:p-0 print:bg-white print:static print:block">
          {/* Contenedor con scroll para pantallas pequeñas */}
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] print:max-h-none print:shadow-none print:rounded-none print:w-full print:h-auto print:overflow-visible print:mx-auto print:m-0">
            
            <div className="p-3 sm:p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-2 bg-gray-50 print:hidden shrink-0">
              <h3 className="font-bold text-base sm:text-lg text-gray-900">Vista Previa</h3>
              <div className="flex gap-2 w-full sm:w-auto"><Button variant="outline" onClick={handlePrint} className="gap-2 flex-1 sm:flex-initial"><Printer className="w-4 h-4"/> Imprimir</Button><Button variant="ghost" size="icon" onClick={() => setConsultaParaImprimir(null)}><X className="w-5 h-5"/></Button></div>
            </div>

            <div className="p-4 sm:p-10 overflow-y-auto print:p-0 print:overflow-visible text-gray-800 font-sans w-full" id="documento-impresion">
              <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-gray-800 pb-6 mb-8 gap-4 print:flex-row print:gap-0 print:w-full">
                <div className="flex items-center gap-4"><div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary text-white rounded-lg flex items-center justify-center print:border print:border-gray-300 print:text-black print:w-16 print:h-16"><Activity className="w-8 h-8 sm:w-10 sm:h-10 print:w-10 print:h-10" /></div><div><h1 className="text-xl sm:text-2xl font-bold tracking-tight">MediRecord</h1><p className="text-xs sm:text-sm text-gray-500">Informe Médico Oficial</p></div></div>
                <div className="text-left sm:text-right"><p className="font-mono text-base sm:text-lg font-bold">#{consultaParaImprimir.id.toString().padStart(6, '0')}</p><p className="text-xs sm:text-sm text-gray-500">{consultaParaImprimir.fecha}</p></div>
              </div>
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-100 mb-8 print:bg-white print:border-gray-300 print:p-6 print:w-full">
                 <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Información del Paciente</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 print:grid-cols-2 print:gap-8">
                    <div><p className="text-xs sm:text-sm text-gray-500 mb-1">Nombre Completo</p><p className="font-semibold text-base sm:text-lg print:text-base">{consultaParaImprimir.paciente ? `${consultaParaImprimir.paciente.nombre} ${consultaParaImprimir.paciente.apellido}` : 'No registrado'}</p></div>
                    <div><p className="text-xs sm:text-sm text-gray-500 mb-1">Documento (DNI)</p><p className="font-semibold text-base sm:text-lg print:text-base">{consultaParaImprimir.paciente?.dni || '---'}</p></div>
                 </div>
              </div>
              <div className="space-y-6 sm:space-y-8 print:space-y-6 print:w-full">
                 <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 print:gap-4"><div><h4 className="text-xs font-bold text-gray-400 uppercase">Tipo</h4><p className="font-medium text-sm sm:text-base print:text-sm">{consultaParaImprimir.tipo || 'No especificado'}</p></div><div><h4 className="text-xs font-bold text-gray-400 uppercase">Estado</h4><p className="font-medium text-sm sm:text-base print:text-sm">{consultaParaImprimir.estado || 'Pendiente'}</p></div></div><hr className="border-gray-100 print:border-gray-300"/>
                 <div><h4 className="text-sm font-bold text-primary border-b border-primary/20 pb-2 mb-3 print:text-black print:border-black/20">Motivo de Consulta</h4><p className="leading-relaxed text-gray-700 text-sm sm:text-base print:text-sm">{consultaParaImprimir.motivo || 'No especificado'}</p></div>
                 <div><h4 className="text-sm font-bold text-primary border-b border-primary/20 pb-2 mb-3 print:text-black print:border-black/20">Diagnóstico</h4><p className="leading-relaxed text-gray-700 font-medium text-sm sm:text-base print:text-sm">{consultaParaImprimir.diagnostico || 'No especificado'}</p></div>
                 <div><h4 className="text-sm font-bold text-primary border-b border-primary/20 pb-2 mb-3 print:text-black print:border-black/20">Tratamiento Indicado</h4><div className="bg-blue-50/50 p-3 sm:p-4 rounded-lg border border-blue-100 print:bg-white print:border-gray-300 print:p-4"><p className="leading-relaxed text-gray-700 whitespace-pre-wrap text-sm sm:text-base print:text-sm">{consultaParaImprimir.tratamiento || 'No especificado'}</p></div></div>
                 {consultaParaImprimir.observaciones && (
                   <div><h4 className="text-sm font-bold text-primary border-b border-primary/20 pb-2 mb-3 print:text-black print:border-black/20">Observaciones Adicionales</h4><div className="bg-amber-50/30 p-3 sm:p-4 rounded-lg border border-amber-100 print:bg-white print:border-gray-300 print:p-4"><p className="leading-relaxed text-gray-700 whitespace-pre-wrap italic text-sm sm:text-base print:text-sm">{consultaParaImprimir.observaciones}</p></div></div>
                 )}
              </div>
              <div className="mt-12 sm:mt-20 pt-6 sm:pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 print:mt-24 print:flex-row print:items-end print:gap-0 print:w-full">
                 <div className="text-xs text-gray-400"><p>Generado por MediRecord System</p><p>{new Date().toLocaleString()}</p></div>
                 <div className="text-center w-full sm:w-auto"><div className="w-32 sm:w-48 h-px bg-gray-800 mb-2 mx-auto sm:mx-0 print:w-48"></div><p className="text-xs sm:text-sm font-semibold">Firma del Médico</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL NUEVA EVOLUCIÓN (CON SELECTS) --- */}
      {mostrarModalHistoria && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div><h3 className="font-bold text-lg text-gray-900">Historia Clínica</h3><p className="text-sm text-gray-500">{pacienteSeleccionado?.apellido}, {pacienteSeleccionado?.nombre}</p></div>
              <Button variant="ghost" size="icon" onClick={() => setMostrarModalHistoria(false)}><X className="w-4 h-4"/></Button>
            </div>
            
            <div className="flex-1 overflow-auto p-6 space-y-8 bg-white">
              <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 shadow-sm">
                <h4 className="font-semibold text-blue-900 flex items-center gap-2 mb-4"><Plus className="w-4 h-4"/> Nueva Evolución</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-xs font-semibold text-blue-800 ml-1">Tipo de Consulta</label>
                        <div className="relative">
                            <select className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-ring appearance-none" value={nuevaConsulta.tipo} onChange={(e)=>setNuevaConsulta({...nuevaConsulta, tipo: e.target.value})}>
                                <option value="Consulta General">Consulta General</option><option value="Control">Control</option><option value="Urgencia">Urgencia</option><option value="Seguimiento">Seguimiento</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none"/>
                        </div>
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-semibold text-blue-800 ml-1">Estado</label>
                        <div className="relative">
                            <select className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-ring appearance-none" value={nuevaConsulta.estado} onChange={(e)=>setNuevaConsulta({...nuevaConsulta, estado: e.target.value})}>
                                <option value="Completada">Completada</option><option value="En proceso">En proceso</option><option value="Pendiente">Pendiente</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none"/>
                        </div>
                     </div>
                  </div>
                  <Input placeholder="Motivo" className="bg-white" value={nuevaConsulta.motivo} onChange={(e)=>setNuevaConsulta({...nuevaConsulta, motivo: e.target.value})} />
                  <Input placeholder="Diagnóstico" className="bg-white" value={nuevaConsulta.diagnostico} onChange={(e)=>setNuevaConsulta({...nuevaConsulta, diagnostico: e.target.value})} />
                  <textarea className="flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-ring" rows={3} placeholder="Tratamiento..." value={nuevaConsulta.tratamiento} onChange={(e)=>setNuevaConsulta({...nuevaConsulta, tratamiento: e.target.value})} />
                  <textarea className="flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-ring" rows={2} placeholder="Observaciones adicionales..." value={nuevaConsulta.observaciones} onChange={(e)=>setNuevaConsulta({...nuevaConsulta, observaciones: e.target.value})} />
                  <Button className="w-full shadow-md" onClick={guardarConsulta}>Guardar Evolución</Button>
                </div>
              </div>
              <div className="space-y-6"><h4 className="font-semibold text-gray-900 border-b pb-2">Historial</h4>{consultas.map((c) => (<div key={c.id} className="relative pl-6 border-l-2 border-gray-200 pb-6 last:pb-0"><div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-200 border-2 border-white"></div><div className="p-4 rounded-xl border bg-gray-50/50 hover:bg-blue-50/30 hover:border-blue-200 transition-all cursor-pointer group" onClick={() => setConsultaParaImprimir(c)}><div className="flex justify-between items-start mb-2"><div className="flex-1"><span className="font-bold text-gray-800 block">{c.motivo}</span><span className="text-xs text-blue-600 font-medium">{c.tipo} • {c.estado}</span></div><div className="flex items-center gap-2"><span className="text-xs font-mono bg-white px-2 py-1 rounded border text-gray-500">{c.fecha}</span><Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" /></div></div><p className="text-sm text-gray-600 mb-2"><span className="font-medium text-primary">Dx:</span> {c.diagnostico}</p>{c.tratamiento && <div className="text-sm text-gray-500 bg-white p-3 rounded-lg border mb-2 line-clamp-2">{c.tratamiento}</div>}{c.observaciones && <div className="text-sm text-gray-500 bg-amber-50/30 p-2 rounded-lg border border-amber-100 italic line-clamp-1">{c.observaciones}</div>}<p className="text-xs text-blue-600 mt-2 group-hover:underline">Clic para ver detalles completos</p></div></div>))}</div>
            </div>
          </div>
        </div>
      )}

      {mostrarModalEditar && (<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 print:hidden"><Card className="w-full max-w-md bg-white shadow-2xl animate-in fade-in zoom-in-95"><CardHeader className="flex flex-row items-center justify-between border-b pb-4"><CardTitle>Editar</CardTitle><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMostrarModalEditar(false)}><X className="w-4 h-4"/></Button></CardHeader><CardContent className="space-y-4 pt-6"><div className="space-y-2"><label>Nombre</label><Input value={pacienteAEditar.nombre} onChange={(e) => setPacienteAEditar({...pacienteAEditar, nombre: e.target.value})} /></div><div className="space-y-2"><label>Apellido</label><Input value={pacienteAEditar.apellido} onChange={(e) => setPacienteAEditar({...pacienteAEditar, apellido: e.target.value})} /></div><div className="space-y-2"><label>DNI</label><Input value={pacienteAEditar.dni} onChange={(e) => setPacienteAEditar({...pacienteAEditar, dni: e.target.value})} /></div><div className="flex justify-end gap-2 pt-4"><Button variant="outline" onClick={() => setMostrarModalEditar(false)}>Cancelar</Button><Button onClick={actualizarPaciente}>Guardar</Button></div></CardContent></Card></div>)}
    </div>
  )
}
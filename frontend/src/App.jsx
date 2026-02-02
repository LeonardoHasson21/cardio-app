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
  Users, Calendar, TrendingUp, Clock, Printer, ChevronDown, Eye, Mail
} from "lucide-react"

const API_URL = 'https://cardio-app-production.up.railway.app/api';

export default function App() {
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

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, loginData);
      setToken(res.data.token); setRole(res.data.role);
      localStorage.setItem('jwt_token', res.data.token); localStorage.setItem('user_role', res.data.role);
    } catch (error) { alert("Error de credenciales") }
  }
  
  const cerrarSesion = () => {
    setToken(null); setRole(null);
    localStorage.removeItem('jwt_token'); localStorage.removeItem('user_role');
    setPacientes([]); setDashboardData(null);
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


  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary bg-white">
          <CardHeader className="text-center space-y-4 pb-8"><div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shadow-sm"><Activity className="w-8 h-8 text-primary" /></div><div><CardTitle className="text-2xl font-bold text-gray-900">MediRecord</CardTitle><p className="text-sm text-muted-foreground mt-2">Acceso al Sistema de Gestión</p></div></CardHeader>
          <CardContent className="space-y-5 px-8 pb-8"><div className="space-y-2"><label className="text-sm font-medium text-gray-700">Email</label><Input className="h-11" placeholder="usuario@ejemplo.com" onChange={(e) => setLoginData({...loginData, username: e.target.value})} /></div><div className="space-y-2"><label className="text-sm font-medium text-gray-700">Contraseña</label><Input className="h-11" type="password" placeholder="••••••" onChange={(e) => setLoginData({...loginData, password: e.target.value})} /></div><Button className="w-full h-11 text-md font-medium shadow-lg shadow-primary/20" onClick={handleLogin}>Ingresar al Sistema</Button></CardContent>
        </Card>
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
          <div className="flex items-center gap-2">
            {activeTab === 'pacientes' && (<div className="hidden md:flex relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Buscar paciente..." className="pl-9 h-9 rounded-full" onChange={(e) => handleBusqueda(e.target.value)} /></div>)}
            <Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={cerrarSesion} title="Cerrar sesión"><LogOut className="w-5 h-5" /></Button>
          </div>
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
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] print:max-h-none print:shadow-none print:rounded-none print:max-w-none print:h-auto print:overflow-visible print:mx-auto print:my-0">
            
            <div className="p-3 sm:p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-2 bg-gray-50 print:hidden shrink-0">
              <h3 className="font-bold text-base sm:text-lg text-gray-900">Vista Previa</h3>
              <div className="flex gap-2 w-full sm:w-auto"><Button variant="outline" onClick={handlePrint} className="gap-2 flex-1 sm:flex-initial"><Printer className="w-4 h-4"/> Imprimir</Button><Button variant="ghost" size="icon" onClick={() => setConsultaParaImprimir(null)}><X className="w-5 h-5"/></Button></div>
            </div>

            <div className="p-4 sm:p-10 overflow-y-auto print:p-8 print:overflow-visible text-gray-800 font-sans" id="documento-impresion">
              <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-gray-800 pb-6 mb-8 gap-4 print:flex-row print:gap-0">
                <div className="flex items-center gap-4"><div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary text-white rounded-lg flex items-center justify-center print:border print:border-gray-300 print:text-black print:w-16 print:h-16"><Activity className="w-8 h-8 sm:w-10 sm:h-10 print:w-10 print:h-10" /></div><div><h1 className="text-xl sm:text-2xl font-bold tracking-tight">MediRecord</h1><p className="text-xs sm:text-sm text-gray-500">Informe Médico Oficial</p></div></div>
                <div className="text-left sm:text-right"><p className="font-mono text-base sm:text-lg font-bold">#{consultaParaImprimir.id.toString().padStart(6, '0')}</p><p className="text-xs sm:text-sm text-gray-500">{consultaParaImprimir.fecha}</p></div>
              </div>
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-100 mb-8 print:bg-white print:border-gray-300 print:p-6">
                 <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Información del Paciente</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 print:grid-cols-2 print:gap-8">
                    <div><p className="text-xs sm:text-sm text-gray-500 mb-1">Nombre Completo</p><p className="font-semibold text-base sm:text-lg print:text-base">{consultaParaImprimir.paciente ? `${consultaParaImprimir.paciente.nombre} ${consultaParaImprimir.paciente.apellido}` : 'No registrado'}</p></div>
                    <div><p className="text-xs sm:text-sm text-gray-500 mb-1">Documento (DNI)</p><p className="font-semibold text-base sm:text-lg print:text-base">{consultaParaImprimir.paciente?.dni || '---'}</p></div>
                 </div>
              </div>
              <div className="space-y-6 sm:space-y-8 print:space-y-6">
                 <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 print:gap-4"><div><h4 className="text-xs font-bold text-gray-400 uppercase">Tipo</h4><p className="font-medium text-sm sm:text-base print:text-sm">{consultaParaImprimir.tipo}</p></div><div><h4 className="text-xs font-bold text-gray-400 uppercase">Estado</h4><p className="font-medium text-sm sm:text-base print:text-sm">{consultaParaImprimir.estado}</p></div></div><hr className="border-gray-100 print:border-gray-300"/>
                 {consultaParaImprimir.motivo && <div><h4 className="text-sm font-bold text-primary border-b border-primary/20 pb-2 mb-3 print:text-black print:border-black/20">Motivo de Consulta</h4><p className="leading-relaxed text-gray-700 text-sm sm:text-base print:text-sm">{consultaParaImprimir.motivo}</p></div>}
                 {consultaParaImprimir.diagnostico && <div><h4 className="text-sm font-bold text-primary border-b border-primary/20 pb-2 mb-3 print:text-black print:border-black/20">Diagnóstico</h4><p className="leading-relaxed text-gray-700 font-medium text-sm sm:text-base print:text-sm">{consultaParaImprimir.diagnostico}</p></div>}
                 {consultaParaImprimir.tratamiento && <div><h4 className="text-sm font-bold text-primary border-b border-primary/20 pb-2 mb-3 print:text-black print:border-black/20">Tratamiento Indicado</h4><div className="bg-blue-50/50 p-3 sm:p-4 rounded-lg border border-blue-100 print:bg-white print:border-gray-300 print:p-4"><p className="leading-relaxed text-gray-700 whitespace-pre-wrap text-sm sm:text-base print:text-sm">{consultaParaImprimir.tratamiento}</p></div></div>}
                 {consultaParaImprimir.observaciones && (
                   <div><h4 className="text-sm font-bold text-primary border-b border-primary/20 pb-2 mb-3 print:text-black print:border-black/20">Observaciones Adicionales</h4><div className="bg-amber-50/30 p-3 sm:p-4 rounded-lg border border-amber-100 print:bg-white print:border-gray-300 print:p-4"><p className="leading-relaxed text-gray-700 whitespace-pre-wrap italic text-sm sm:text-base print:text-sm">{consultaParaImprimir.observaciones}</p></div></div>
                 )}
              </div>
              <div className="mt-12 sm:mt-20 pt-6 sm:pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 print:mt-24 print:flex-row print:items-end print:gap-0">
                 <div className="text-xs text-gray-400"><p>Generado por MediRecord System</p><p>{new Date().toLocaleString()}</p></div>
                 <div className="text-center"><div className="w-32 sm:w-48 h-px bg-gray-800 mb-2 print:w-48"></div><p className="text-xs sm:text-sm font-semibold">Firma del Médico</p></div>
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
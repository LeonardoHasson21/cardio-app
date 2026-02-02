import { useState, useEffect } from 'react'
import axios from 'axios'
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { 
  Plus, Search, Activity, Trash2, Edit, FileText, User, Menu, X, Lock, Unlock,
  Users, Calendar, TrendingUp, Clock, Printer, ChevronDown, Eye, Mail, LogOut
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
  
  // NUEVA CONSULTA
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
    try { const res = await axios.get(`${API_URL}/pacientes`, getConfig()); setPacientes(res.data || []); } 
    catch (error) { console.error("Error cargando pacientes:", error); setPacientes([]); }
  }

  const cargarDashboard = async () => {
    try { const res = await axios.get(`${API_URL}/dashboard`, getConfig()); setDashboardData(res.data); } 
    catch (error) { console.error("Error cargando dashboard", error); }
  }

  const cargarTodasLasConsultas = async () => {
    try { const res = await axios.get(`${API_URL}/consultas`, getConfig()); setTodasLasConsultas(res.data || []); } 
    catch (error) { console.error("Error cargando consultas", error); }
  }

  const guardarPaciente = async (e) => {
    e.preventDefault();
    try { 
        const resPaciente = await axios.post(`${API_URL}/pacientes`, nuevoPaciente, getConfig()); 
        alert("Paciente Guardado Exitosamente"); 
        setNuevoPaciente({nombre:'',apellido:'',dni:''}); 
        cargarPacientes(); 
        cargarDashboard();
        cargarTodasLasConsultas();
        setActiveTab('pacientes');
    } catch (error) { alert("Error al guardar: " + (error.response?.data?.message || error.message)) }
  }

  const eliminarPaciente = async (id) => {
    if(!window.confirm("¿Está seguro de eliminar este paciente?")) return;
    try { await axios.delete(`${API_URL}/pacientes/${id}`, getConfig()); cargarPacientes(); cargarDashboard(); cargarTodasLasConsultas(); alert("Paciente eliminado"); } 
    catch (error) { alert("Error al eliminar") }
  }

  const prepararEdicion = (paciente) => { setPacienteAEditar(paciente); setMostrarModalEditar(true); }
  const actualizarPaciente = async () => {
    try { await axios.put(`${API_URL}/pacientes/${pacienteAEditar.id}`, pacienteAEditar, getConfig()); setMostrarModalEditar(false); cargarPacientes(); cargarTodasLasConsultas(); alert("Actualizado"); } 
    catch (error) { alert("Error al actualizar") }
  }

  const handleBusqueda = async (termino) => {
    setSearchTerm(termino);
    if (termino.length === 0) { cargarPacientes(); return; }
    if (termino.length < 2) return;
    try { const res = await axios.get(`${API_URL}/pacientes/buscar?query=${termino}`, getConfig()); setPacientes(res.data || []); } catch (error) { }
  }

  const abrirHistoria = async (paciente) => {
    setPacienteSeleccionado(paciente);
    try { const res = await axios.get(`${API_URL}/consultas/paciente/${paciente.id}`, getConfig()); setConsultas(res.data || []); setMostrarModalHistoria(true); } 
    catch (error) { setConsultas([]); setMostrarModalHistoria(true); }
  }

  const guardarConsulta = async () => {
    if (!pacienteSeleccionado) return;
    try { 
        await axios.post(`${API_URL}/consultas/${pacienteSeleccionado.id}`, nuevaConsulta, getConfig()); 
        setNuevaConsulta({motivo:'',diagnostico:'',tratamiento:'', observaciones:'', tipo:'Consulta General', estado:'Completada', fecha: new Date().toISOString().split('T')[0]}); 
        const res = await axios.get(`${API_URL}/consultas/paciente/${pacienteSeleccionado.id}`, getConfig()); 
        setConsultas(res.data); 
        cargarDashboard(); 
        cargarTodasLasConsultas();
        alert("Guardado exitosamente");
    } catch (error) { alert("Error al guardar consulta") }
  }

  const handlePrint = () => window.print();

  // Admin
  const cargarMedicos = async () => { try { const res = await axios.get(`${API_URL}/admin/medicos`, getConfig()); setListaMedicos(res.data || []); } catch (error) { setListaMedicos([]); } }
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
    <div className="flex min-h-screen bg-muted/30 print:bg-white print:block">
      
      {/* SIDEBAR - Oculto al imprimir */}
      <div className={cn(
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 print:hidden", 
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar activeSection={activeTab} onSectionChange={(tab) => { setActiveTab(tab); setSidebarOpen(false); }} role={role} cerrarSesion={cerrarSesion} />
        
        {/* Botón cerrar sidebar móvil */}
        {sidebarOpen && (
            <button 
                onClick={() => setSidebarOpen(false)} 
                className="absolute top-4 right-4 text-white lg:hidden bg-white/20 p-2 rounded-full hover:bg-white/30"
            >
                <X className="w-6 h-6" />
            </button>
        )}
      </div>

      {/* Overlay Móvil */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden print:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* MAIN CONTENT */}
      <main className="flex-1 h-screen overflow-y-auto print:overflow-visible print:h-auto print:w-full print:m-0 print:p-0">
        
        {/* Header - Oculto al imprimir */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b px-4 sm:px-6 h-16 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></Button>
              <h2 className="text-sm sm:text-lg font-semibold text-gray-800 truncate">
                  {activeTab === 'pacientes' && 'Listado de Pacientes'}
                  {activeTab === 'nuevo_paciente' && 'Nueva Historia Clínica'}
                  {activeTab === 'admin_usuarios' && 'Panel de Administración'}
                  {activeTab === 'dashboard' && 'Panel de Control'}
                  {activeTab === 'historias_clinicas' && 'Historias Clínicas'}
              </h2>
          </div>
          {activeTab === 'pacientes' && (<div className="hidden md:flex relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Buscar paciente..." className="pl-9 h-9 rounded-full" onChange={(e) => handleBusqueda(e.target.value)} /></div>)}
        </header>

        <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-6 print:p-0 print:m-0 print:max-w-none print:w-full">
          
          {/* VISTAS (Dashboard, Pacientes, etc.) - Ocultas si hay un modal de impresión activo */}
          {!consultaParaImprimir && (
            <>
                {/* DASHBOARD */}
                {activeTab === 'dashboard' && (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                    <div><h2 className="text-2xl font-bold text-gray-800">Panel de Control</h2><p className="text-muted-foreground">Resumen de actividad</p></div>
                    {!dashboardData ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">{[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200/50 rounded-xl animate-pulse"></div>)}</div>
                    ) : (
                        <div className="mt-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card className="border-none shadow-sm"><CardContent className="p-6 flex justify-between"><div><p className="text-sm font-medium text-gray-500">Pacientes</p><h3 className="text-3xl font-bold text-gray-800 mt-2">{dashboardData.totalPacientes}</h3></div><div className="p-2 rounded-lg bg-cyan-50 text-cyan-600"><Users className="w-5 h-5"/></div></CardContent></Card>
                                <Card className="border-none shadow-sm"><CardContent className="p-6 flex justify-between"><div><p className="text-sm font-medium text-gray-500">Consultas</p><h3 className="text-3xl font-bold text-gray-800 mt-2">{dashboardData.totalConsultas}</h3></div><div className="p-2 rounded-lg bg-blue-50 text-blue-600"><FileText className="w-5 h-5"/></div></CardContent></Card>
                                <Card className="border-none shadow-sm"><CardContent className="p-6 flex justify-between"><div><p className="text-sm font-medium text-gray-500">Hoy</p><h3 className="text-3xl font-bold text-gray-800 mt-2">{dashboardData.consultasHoy}</h3></div><div className="p-2 rounded-lg bg-purple-50 text-purple-600"><Calendar className="w-5 h-5"/></div></CardContent></Card>
                                <Card className="border-none shadow-sm"><CardContent className="p-6 flex justify-between"><div><p className="text-sm font-medium text-gray-500">Mes</p><h3 className="text-3xl font-bold text-gray-800 mt-2">{dashboardData.consultasMes}</h3></div><div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><TrendingUp className="w-5 h-5"/></div></CardContent></Card>
                            </div>
                            <Card className="border-none shadow-sm overflow-hidden bg-white">
                                <CardHeader className="bg-white border-b border-gray-100 px-6 py-5"><CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2"><Clock className="w-5 h-5 text-gray-400"/> Últimas Consultas</CardTitle></CardHeader>
                                <CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100"><tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">PACIENTE</th><th className="px-6 py-4">FECHA</th><th className="px-6 py-4">TIPO</th><th className="px-6 py-4">ESTADO</th></tr></thead><tbody className="divide-y divide-gray-100 bg-white">
                                    {dashboardData.ultimasConsultas?.map((c) => (
                                    <tr key={c.id} className="hover:bg-blue-50/50 transition-colors cursor-pointer group" onClick={() => setConsultaParaImprimir(c)}>
                                        <td className="px-6 py-4 font-mono text-xs text-primary font-semibold">#{c.id.toString().padStart(6, '0')}</td>
                                        <td className="px-6 py-4 font-medium text-gray-800">{c.paciente ? `${c.paciente.nombre} ${c.paciente.apellido}` : <span className="text-red-400 italic">Sin datos</span>}</td>
                                        <td className="px-6 py-4 text-gray-500">{c.fecha}</td>
                                        <td className="px-6 py-4 text-gray-700">{c.tipo}</td>
                                        <td className="px-6 py-4"><span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", c.estado === 'En proceso' ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-emerald-50 text-emerald-700 border-emerald-100")}>{c.estado}</span></td>
                                    </tr>
                                    ))}</tbody></table></div></CardContent>
                            </Card>
                        </div>
                    )}
                    </div>
                )}

                {/* HISTORIAS CLÍNICAS */}
                {activeTab === 'historias_clinicas' && (
                    <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div><h2 className="text-2xl font-bold text-gray-800">Historias Clínicas</h2><p className="text-gray-500 mt-1">Gestión completa</p></div>
                    </div>
                    <Card className="border-none shadow-sm bg-white">
                        <CardContent className="p-6">
                        <div className="relative mb-6"><Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" /><Input placeholder="Buscar..." className="pl-10 h-11 rounded-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                            <Button variant={filtrosConsultas.estado === 'todas' ? 'default' : 'outline'} onClick={() => setFiltrosConsultas({...filtrosConsultas, estado: 'todas'})} className="rounded-full whitespace-nowrap">Todas</Button>
                            <Button variant={filtrosConsultas.estado === 'Completada' ? 'default' : 'outline'} onClick={() => setFiltrosConsultas({...filtrosConsultas, estado: 'Completada'})} className="rounded-full whitespace-nowrap">Completadas</Button>
                            <Button variant={filtrosConsultas.estado === 'En proceso' ? 'default' : 'outline'} onClick={() => setFiltrosConsultas({...filtrosConsultas, estado: 'En proceso'})} className="rounded-full whitespace-nowrap">En Proceso</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(filtrosConsultas.estado === 'todas' ? todasLasConsultas : todasLasConsultas.filter(c => c.estado === filtrosConsultas.estado))
                            .filter(c => {
                                if (!searchTerm) return true;
                                const term = searchTerm.toLowerCase();
                                return (c.paciente?.nombre?.toLowerCase() || '').includes(term) || (c.paciente?.apellido?.toLowerCase() || '').includes(term) || c.id.toString().includes(term);
                            }).map((consulta) => (
                            <Card key={consulta.id} className="border-none shadow-sm hover:shadow-lg transition-all duration-200 bg-white cursor-pointer" onClick={() => setConsultaParaImprimir(consulta)}>
                                <CardContent className="p-6">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center text-lg font-bold">{consulta.paciente ? `${consulta.paciente.nombre.charAt(0)}${consulta.paciente.apellido.charAt(0)}` : 'SD'}</div>
                                    <div className="flex-1"><h3 className="font-bold text-gray-900">{consulta.paciente ? `${consulta.paciente.nombre} ${consulta.paciente.apellido}` : 'Sin datos'}</h3><p className="text-sm text-cyan-600 font-semibold">HC-{consulta.id.toString().padStart(4, '0')}</p></div>
                                </div>
                                <div className="space-y-3 border-t pt-4">
                                    <div><p className="text-xs text-gray-500 uppercase tracking-wide">DIAGNÓSTICO</p><p className="text-sm font-medium text-gray-800 mt-1 line-clamp-2">{consulta.diagnostico || 'Sin diagnóstico'}</p></div>
                                    <div className="flex justify-between text-xs text-gray-500"><span>{consulta.fecha || 'Sin fecha'}</span><span className="font-medium text-emerald-600">{consulta.estado || 'Pendiente'}</span></div>
                                </div>
                                </CardContent>
                            </Card>
                            ))}
                        </div>
                        </CardContent>
                    </Card>
                    </div>
                )}

                {/* PACIENTES */}
                {activeTab === 'pacientes' && (
                    <div className="space-y-6">
                        <div className="md:hidden relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Buscar..." className="pl-9" onChange={(e) => handleBusqueda(e.target.value)}/></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pacientes.map((p) => (
                            <Card key={p.id} className="border-none shadow-sm hover:shadow-lg transition-all duration-200 bg-white">
                                <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center text-lg font-bold">{p.nombre.charAt(0)}{p.apellido.charAt(0)}</div>
                                    <div className="flex-1"><h3 className="font-bold text-gray-900">{p.nombre} {p.apellido}</h3><p className="text-sm text-gray-500">DNI: {p.dni}</p></div>
                                </div>
                                <div className="flex gap-2 mt-4 pt-4 border-t">
                                    <Button className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-primary hover:text-white shadow-sm" size="sm" onClick={() => abrirHistoria(p)}><FileText className="w-4 h-4 mr-2" /> Historia</Button>
                                    <Button size="sm" variant="ghost" onClick={() => prepararEdicion(p)}><Edit className="w-4 h-4" /></Button>
                                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => eliminarPaciente(p.id)}><Trash2 className="w-4 h-4" /></Button>
                                </div>
                                </CardContent>
                            </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* NUEVO PACIENTE */}
                {activeTab === 'nuevo_paciente' && (
                    <Card className="max-w-4xl mx-auto border-none shadow-md bg-white">
                        <CardHeader className="border-b bg-gray-50/50 px-8 py-6"><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary"/>Nueva Historia Clínica</CardTitle></CardHeader>
                        <CardContent className="p-8">
                        <form onSubmit={guardarPaciente} className="space-y-8">
                            <div><h3 className="font-semibold text-lg text-gray-900 mb-4">Datos del Paciente</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-2"><label className="text-sm font-medium">Nombre</label><Input className="h-10 bg-gray-50" value={nuevoPaciente.nombre} onChange={(e) => setNuevoPaciente({...nuevoPaciente, nombre: e.target.value})} required /></div><div className="space-y-2"><label className="text-sm font-medium">Apellido</label><Input className="h-10 bg-gray-50" value={nuevoPaciente.apellido} onChange={(e) => setNuevoPaciente({...nuevoPaciente, apellido: e.target.value})} required /></div><div className="space-y-2"><label className="text-sm font-medium">DNI</label><Input className="h-10 bg-gray-50" value={nuevoPaciente.dni} onChange={(e) => setNuevoPaciente({...nuevoPaciente, dni: e.target.value})} required /></div></div></div>
                            <div className="border-t pt-8"><h3 className="font-semibold text-lg text-gray-900 mb-4">Información de la Consulta</h3><div className="space-y-6"><div className="space-y-2"><label className="text-sm font-medium">Motivo</label><textarea className="flex w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm shadow-sm" rows={4} value={nuevaConsulta.motivo} onChange={(e) => setNuevaConsulta({...nuevaConsulta, motivo: e.target.value})} /></div><div className="space-y-2"><label className="text-sm font-medium">Diagnóstico</label><textarea className="flex w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm shadow-sm" rows={3} value={nuevaConsulta.diagnostico} onChange={(e) => setNuevaConsulta({...nuevaConsulta, diagnostico: e.target.value})} /></div><div className="space-y-2"><label className="text-sm font-medium">Tratamiento</label><textarea className="flex w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm shadow-sm" rows={4} value={nuevaConsulta.tratamiento} onChange={(e) => setNuevaConsulta({...nuevaConsulta, tratamiento: e.target.value})} /></div></div></div>
                            <div className="pt-4 flex justify-end gap-4 border-t"><Button type="button" variant="outline" size="lg">Cancelar</Button><Button type="submit" size="lg" className="px-12 shadow-lg shadow-primary/20">Guardar</Button></div>
                        </form>
                        </CardContent>
                    </Card>
                )}

                {/* ADMIN USERS */}
                {activeTab === 'admin_usuarios' && (
                    <div className="space-y-6">
                        <Card className="border-none shadow-sm bg-white"><CardHeader><CardTitle>Dar de alta Médico</CardTitle></CardHeader><CardContent className="flex flex-col md:flex-row gap-4"><Input placeholder="Email" value={nuevoMedicoData.username} onChange={(e) => setNuevoMedicoData({...nuevoMedicoData, username: e.target.value})} /><Input type="password" placeholder="Password" value={nuevoMedicoData.password} onChange={(e) => setNuevoMedicoData({...nuevoMedicoData, password: e.target.value})} /><Button onClick={crearMedicoAdmin}>Crear Cuenta</Button></CardContent></Card>
                    </div>
                )}
            </>
          )}
        </div>
      </main>

      {/* ================= MODAL IMPRESIÓN PDF (CORREGIDO PARA RESPONSIVE Y PRINT) ================= */}
      {consultaParaImprimir && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:p-0 print:bg-white print:static print:block">
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
                 {consultaParaImprimir.observaciones && (<div><h4 className="text-sm font-bold text-primary border-b border-primary/20 pb-2 mb-3 print:text-black print:border-black/20">Observaciones</h4><p className="text-gray-700 italic text-sm sm:text-base">{consultaParaImprimir.observaciones}</p></div>)}
              </div>

              <div className="mt-12 sm:mt-20 pt-6 sm:pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 print:mt-24 print:flex-row print:items-end print:gap-0 print:w-full">
                 <div className="text-xs text-gray-400"><p>Generado por MediRecord System</p><p>{new Date().toLocaleString()}</p></div>
                 <div className="text-center w-full sm:w-auto"><div className="w-32 sm:w-48 h-px bg-gray-800 mb-2 mx-auto sm:mx-0 print:w-48"></div><p className="text-xs sm:text-sm font-semibold">Firma del Médico</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL HISTORIA --- */}
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
                     <div className="space-y-1"><label className="text-xs font-semibold text-blue-800 ml-1">Tipo</label><div className="relative"><select className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm appearance-none" value={nuevaConsulta.tipo} onChange={(e)=>setNuevaConsulta({...nuevaConsulta, tipo: e.target.value})}><option value="Consulta General">Consulta General</option><option value="Control">Control</option><option value="Urgencia">Urgencia</option></select><ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none"/></div></div>
                     <div className="space-y-1"><label className="text-xs font-semibold text-blue-800 ml-1">Estado</label><div className="relative"><select className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm appearance-none" value={nuevaConsulta.estado} onChange={(e)=>setNuevaConsulta({...nuevaConsulta, estado: e.target.value})}><option value="Completada">Completada</option><option value="En proceso">En proceso</option></select><ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none"/></div></div>
                  </div>
                  <Input placeholder="Motivo" className="bg-white" value={nuevaConsulta.motivo} onChange={(e)=>setNuevaConsulta({...nuevaConsulta, motivo: e.target.value})} />
                  <Input placeholder="Diagnóstico" className="bg-white" value={nuevaConsulta.diagnostico} onChange={(e)=>setNuevaConsulta({...nuevaConsulta, diagnostico: e.target.value})} />
                  <textarea className="flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm" rows={3} placeholder="Tratamiento..." value={nuevaConsulta.tratamiento} onChange={(e)=>setNuevaConsulta({...nuevaConsulta, tratamiento: e.target.value})} />
                  <Button className="w-full shadow-md" onClick={guardarConsulta}>Guardar Evolución</Button>
                </div>
              </div>
              <div className="space-y-6"><h4 className="font-semibold text-gray-900 border-b pb-2">Historial</h4>{consultas.map((c) => (<div key={c.id} className="relative pl-6 border-l-2 border-gray-200 pb-6 last:pb-0"><div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-200 border-2 border-white"></div><div className="p-4 rounded-xl border bg-gray-50/50"><div className="flex justify-between items-start mb-2"><div><span className="font-bold text-gray-800 block">{c.motivo}</span><span className="text-xs text-blue-600 font-medium">{c.tipo} • {c.estado}</span></div><span className="text-xs font-mono bg-white px-2 py-1 rounded border text-gray-500">{c.fecha}</span></div><p className="text-sm text-gray-600 mb-2"><span className="font-medium text-primary">Dx:</span> {c.diagnostico}</p>{c.tratamiento && <div className="text-sm text-gray-500 bg-white p-3 rounded-lg border italic">{c.tratamiento}</div>}</div></div>))}</div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {mostrarModalEditar && (<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 print:hidden"><Card className="w-full max-w-md bg-white shadow-2xl animate-in fade-in zoom-in-95"><CardHeader className="flex flex-row items-center justify-between border-b pb-4"><CardTitle>Editar</CardTitle><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMostrarModalEditar(false)}><X className="w-4 h-4"/></Button></CardHeader><CardContent className="space-y-4 pt-6"><div className="space-y-2"><label>Nombre</label><Input value={pacienteAEditar.nombre} onChange={(e) => setPacienteAEditar({...pacienteAEditar, nombre: e.target.value})} /></div><div className="space-y-2"><label>Apellido</label><Input value={pacienteAEditar.apellido} onChange={(e) => setPacienteAEditar({...pacienteAEditar, apellido: e.target.value})} /></div><div className="space-y-2"><label>DNI</label><Input value={pacienteAEditar.dni} onChange={(e) => setPacienteAEditar({...pacienteAEditar, dni: e.target.value})} /></div><div className="flex justify-end gap-2 pt-4"><Button variant="outline" onClick={() => setMostrarModalEditar(false)}>Cancelar</Button><Button onClick={actualizarPaciente}>Guardar</Button></div></CardContent></Card></div>)}
    </div>
  )
}
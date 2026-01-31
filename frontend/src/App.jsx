import { useState, useEffect } from 'react'
import axios from 'axios'
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/Sidebar" 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Iconos Lucide
import { 
  Plus, 
  Search, 
  Activity, 
  Trash2, 
  Edit, 
  FileText,
  User,
  Menu,
  X,
  Lock,
  Unlock
} from "lucide-react"

const API_URL = 'https://cardio-app-production.up.railway.app/api';

export default function App() {
  // --- TUS ESTADOS (LÓGICA) ---
  const [token, setToken] = useState(localStorage.getItem('jwt_token')); 
  const [role, setRole] = useState(localStorage.getItem('user_role')); 
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  
  const [pacientes, setPacientes] = useState([])
  const [nuevoPaciente, setNuevoPaciente] = useState({ nombre: '', apellido: '', dni: '' })
  
  // Modals / Edición / Historia
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null)
  const [pacienteAEditar, setPacienteAEditar] = useState(null)
  const [mostrarModalHistoria, setMostrarModalHistoria] = useState(false)
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false)

  const [consultas, setConsultas] = useState([])
  const [nuevaConsulta, setNuevaConsulta] = useState({ motivo: '', diagnostico: '', tratamiento: '' })
  
  // Admin
  const [listaMedicos, setListaMedicos] = useState([])
  const [nuevoMedicoData, setNuevoMedicoData] = useState({ username: '', password: '' });

  // UI
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false) // Para móvil
  const [searchTerm, setSearchTerm] = useState("")

  const getConfig = () => ({ headers: { Authorization: `Bearer ${token}` } });

  // --- EFECTOS ---
  useEffect(() => {
    if (token && role === 'MEDICO') {
      cargarPacientes();
      setActiveTab("pacientes");
    }
    if (token && role === 'ADMIN') {
      cargarMedicos();
      setActiveTab("admin_usuarios");
    }
  }, [token, role])

  // --- TUS FUNCIONES (SIN CAMBIOS) ---
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
  }
  const cargarPacientes = async () => {
    try { const res = await axios.get(`${API_URL}/pacientes`, getConfig()); setPacientes(res.data) } catch (error) {}
  }
  const guardarPaciente = async (e) => {
    e.preventDefault();
    try { await axios.post(`${API_URL}/pacientes`, nuevoPaciente, getConfig()); alert("Paciente Guardado"); setNuevoPaciente({nombre:'',apellido:'',dni:''}); cargarPacientes(); } catch (error) {alert("Error")}
  }
  const eliminarPaciente = async (id) => {
    if(!window.confirm("¿Seguro?")) return;
    try { await axios.delete(`${API_URL}/pacientes/${id}`, getConfig()); cargarPacientes(); } catch (error) {alert("Error")}
  }
  const prepararEdicion = (paciente) => { setPacienteAEditar(paciente); setMostrarModalEditar(true); }
  const actualizarPaciente = async () => {
    try { await axios.put(`${API_URL}/pacientes/${pacienteAEditar.id}`, pacienteAEditar, getConfig()); setMostrarModalEditar(false); cargarPacientes(); } catch (error) {alert("Error")}
  }
  const handleBusqueda = async (termino) => {
    setSearchTerm(termino);
    if (termino.length === 0) { cargarPacientes(); return; }
    try { const res = await axios.get(`${API_URL}/pacientes/buscar?query=${termino}`, getConfig()); setPacientes(res.data); } catch (error) { }
  }
  const abrirHistoria = async (paciente) => {
    setPacienteSeleccionado(paciente);
    try { const res = await axios.get(`${API_URL}/consultas/paciente/${paciente.id}`, getConfig()); setConsultas(res.data); setMostrarModalHistoria(true); } catch (error) {}
  }
  const guardarConsulta = async () => {
    if (!pacienteSeleccionado) return;
    try { await axios.post(`${API_URL}/consultas/${pacienteSeleccionado.id}`, nuevaConsulta, getConfig()); setNuevaConsulta({motivo:'',diagnostico:'',tratamiento:''}); 
    const res = await axios.get(`${API_URL}/consultas/paciente/${pacienteSeleccionado.id}`, getConfig()); setConsultas(res.data); } catch (error) { alert("Error") }
  }
  const cargarMedicos = async () => { try { const res = await axios.get(`${API_URL}/admin/medicos`, getConfig()); setListaMedicos(res.data) } catch (error) { } }
  const crearMedicoAdmin = async () => { try { await axios.post(`${API_URL}/admin/medicos`, nuevoMedicoData, getConfig()); cargarMedicos(); alert("Creado"); } catch (error) {} }
  const toggleMedico = async (id) => { try { await axios.put(`${API_URL}/admin/medicos/${id}/toggle`, {}, getConfig()); cargarMedicos(); } catch (error) { } }
  const eliminarMedico = async (id) => { if(!window.confirm("¿Confirmar?")) return; try { await axios.delete(`${API_URL}/admin/medicos/${id}`, getConfig()); cargarMedicos() } catch (error) { } }


  // ==================== VISTA LOGIN (Centrado y Limpio) ====================
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary bg-white">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shadow-sm">
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">MediRecord</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">Acceso al Sistema de Gestión</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 px-8 pb-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input 
                className="h-11 bg-gray-50 focus:bg-white"
                placeholder="usuario@ejemplo.com" 
                onChange={(e) => setLoginData({...loginData, username: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Contraseña</label>
              <Input 
                className="h-11 bg-gray-50 focus:bg-white"
                type="password" 
                placeholder="••••••" 
                onChange={(e) => setLoginData({...loginData, password: e.target.value})} 
              />
            </div>
            <Button className="w-full h-11 text-md font-medium shadow-lg shadow-primary/20" onClick={handleLogin}>Ingresar al Sistema</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==================== VISTA PRINCIPAL (Layout Pro) ====================
  return (
    <div className="flex min-h-screen bg-muted/30"> {/* Fondo general gris muy suave */}
      
      {/* 1. SIDEBAR OSCURO */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar 
          activeSection={activeTab} 
          onSectionChange={(tab) => { setActiveTab(tab); setSidebarOpen(false); }}
          role={role}
          cerrarSesion={cerrarSesion}
        />
      </div>

      {/* Overlay Móvil */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* 2. CONTENIDO PRINCIPAL */}
      <main className="flex-1 h-screen overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
               <Menu className="w-5 h-5" />
             </Button>
             <h2 className="text-lg font-semibold text-gray-800">
               {activeTab === 'pacientes' && 'Listado de Pacientes'}
               {activeTab === 'nuevo_paciente' && 'Nueva Historia Clínica'}
               {activeTab === 'admin_usuarios' && 'Panel de Administración'}
               {activeTab === 'dashboard' && 'Panel de Control'}
             </h2>
          </div>
          
          {/* Search bar en Header si estamos en pacientes */}
          {activeTab === 'pacientes' && (
             <div className="hidden md:flex relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar paciente..." 
                  className="pl-9 h-9 bg-gray-100/50 border-none focus:bg-white focus:ring-1 transition-all rounded-full"
                  onChange={(e) => handleBusqueda(e.target.value)}
                />
             </div>
          )}
        </header>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
          
          {/* --- VISTA PACIENTES --- */}
          {activeTab === 'pacientes' && (
            <>
              {/* Buscador Móvil */}
              <div className="md:hidden relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar..." className="pl-9" onChange={(e) => handleBusqueda(e.target.value)}/>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {pacientes.map((p) => (
                  <Card key={p.id} className="border-none shadow-sm hover:shadow-lg transition-all duration-200 group">
                    <CardHeader className="flex flex-row items-center gap-4 pb-4">
                       <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                         {p.nombre.charAt(0)}{p.apellido.charAt(0)}
                       </div>
                       <div>
                         <CardTitle className="text-base font-bold text-gray-800">{p.nombre} {p.apellido}</CardTitle>
                         <p className="text-xs font-mono text-muted-foreground bg-gray-100 px-2 py-0.5 rounded w-fit mt-1">
                           ID: {p.dni}
                         </p>
                       </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-6">
                          <User className="w-4 h-4 text-gray-400"/>
                          <span className="text-sm text-gray-600">Paciente registrado</span>
                      </div>
                      <div className="flex gap-2 pt-2 border-t">
                        <Button className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-primary hover:text-white hover:border-primary shadow-sm" size="sm" onClick={() => abrirHistoria(p)}>
                          <FileText className="w-4 h-4 mr-2" /> Historia
                        </Button>
                        <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-full hover:bg-gray-100 text-gray-500" onClick={() => prepararEdicion(p)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500" onClick={() => eliminarPaciente(p.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {pacientes.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                   <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4"><Search className="w-8 h-8 text-gray-300"/></div>
                   <p className="text-gray-500">No se encontraron pacientes.</p>
                </div>
              )}
            </>
          )}

          {/* --- VISTA NUEVO PACIENTE --- */}
          {activeTab === 'nuevo_paciente' && (
            <Card className="max-w-3xl mx-auto border-none shadow-md">
              <CardHeader className="border-b bg-gray-50/50 px-8 py-6">
                <CardTitle className="flex items-center gap-2">
                   <div className="p-2 bg-primary/10 rounded-lg"><User className="w-5 h-5 text-primary"/></div>
                   Información del Paciente
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={guardarPaciente} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Nombre</label>
                      <Input placeholder="Ej: María" className="h-10" value={nuevoPaciente.nombre} onChange={(e) => setNuevoPaciente({...nuevoPaciente, nombre: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Apellido</label>
                      <Input placeholder="Ej: López" className="h-10" value={nuevoPaciente.apellido} onChange={(e) => setNuevoPaciente({...nuevoPaciente, apellido: e.target.value})} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">DNI / Documento</label>
                    <Input placeholder="12345678" className="h-10" value={nuevoPaciente.dni} onChange={(e) => setNuevoPaciente({...nuevoPaciente, dni: e.target.value})} required />
                  </div>
                  <div className="pt-4 flex justify-end">
                    <Button type="submit" size="lg" className="px-8 shadow-lg shadow-primary/20">Registrar Paciente</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* --- VISTA ADMIN --- */}
          {activeTab === 'admin_usuarios' && (
            <div className="space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle>Dar de alta Médico</CardTitle></CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4">
                  <Input placeholder="Email del médico" value={nuevoMedicoData.username} onChange={(e) => setNuevoMedicoData({...nuevoMedicoData, username: e.target.value})} />
                  <Input type="password" placeholder="Contraseña" value={nuevoMedicoData.password} onChange={(e) => setNuevoMedicoData({...nuevoMedicoData, password: e.target.value})} />
                  <Button onClick={crearMedicoAdmin} className="md:w-auto w-full">Crear Cuenta</Button>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100/50 text-gray-600 uppercase text-xs font-semibold tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4">Usuario</th>
                        <th className="px-6 py-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {listaMedicos.map((m) => (
                        <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className={cn("px-3 py-1 rounded-full text-xs font-bold shadow-sm", m.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                              {m.enabled ? "ACTIVO" : "BLOQUEADO"}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-800">{m.username}</td>
                          <td className="px-6 py-4 flex gap-2">
                            <Button size="sm" variant="outline" className={m.enabled ? "text-orange-600 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"} onClick={() => toggleMedico(m.id)}>
                              {m.enabled ? <Lock className="w-4 h-4"/> : <Unlock className="w-4 h-4"/>}
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:border-red-200" onClick={() => eliminarMedico(m.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

        </div>
      </main>

      {/* --- MODALES --- */}
      
      {/* Modal Editar */}
      {mostrarModalEditar && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-white shadow-2xl animate-in fade-in zoom-in-95">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle>Editar Paciente</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMostrarModalEditar(false)}><X className="w-4 h-4"/></Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2"><label className="text-sm font-medium">Nombre</label><Input value={pacienteAEditar.nombre} onChange={(e) => setPacienteAEditar({...pacienteAEditar, nombre: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Apellido</label><Input value={pacienteAEditar.apellido} onChange={(e) => setPacienteAEditar({...pacienteAEditar, apellido: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">DNI</label><Input value={pacienteAEditar.dni} onChange={(e) => setPacienteAEditar({...pacienteAEditar, dni: e.target.value})} /></div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setMostrarModalEditar(false)}>Cancelar</Button>
                <Button onClick={actualizarPaciente}>Guardar Cambios</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Historia */}
      {mostrarModalHistoria && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Historia Clínica</h3>
                <p className="text-sm text-gray-500">{pacienteSeleccionado?.apellido}, {pacienteSeleccionado?.nombre}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMostrarModalHistoria(false)}><X className="w-4 h-4"/></Button>
            </div>
            
            <div className="flex-1 overflow-auto p-6 space-y-8 bg-white">
              <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 shadow-sm">
                <h4 className="font-semibold text-blue-900 flex items-center gap-2 mb-4"><Plus className="w-4 h-4"/> Nueva Evolución</h4>
                <div className="space-y-3">
                  <Input placeholder="Motivo" className="bg-white" value={nuevaConsulta.motivo} onChange={(e)=>setNuevaConsulta({...nuevaConsulta, motivo: e.target.value})} />
                  <Input placeholder="Diagnóstico" className="bg-white" value={nuevaConsulta.diagnostico} onChange={(e)=>setNuevaConsulta({...nuevaConsulta, diagnostico: e.target.value})} />
                  <textarea 
                    className="flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    rows={3}
                    placeholder="Tratamiento..."
                    value={nuevaConsulta.tratamiento} 
                    onChange={(e)=>setNuevaConsulta({...nuevaConsulta, tratamiento: e.target.value})}
                  />
                  <Button className="w-full shadow-md" onClick={guardarConsulta}>Guardar Evolución</Button>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Historial de Visitas</h4>
                {consultas.map((c) => (
                  <div key={c.id} className="relative pl-6 border-l-2 border-gray-200 hover:border-primary transition-colors pb-6 last:pb-0 group">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-200 group-hover:bg-primary transition-colors border-2 border-white"></div>
                    <div className="p-4 rounded-xl border bg-gray-50/50 hover:bg-white hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-gray-800">{c.motivo}</span>
                        <span className="text-xs font-mono bg-white px-2 py-1 rounded border text-gray-500">{c.fecha}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2"><span className="font-medium text-primary">Dx:</span> {c.diagnostico}</p>
                      {c.tratamiento && <div className="text-sm text-gray-500 bg-white p-3 rounded-lg border italic">{c.tratamiento}</div>}
                    </div>
                  </div>
                ))}
                {consultas.length === 0 && <p className="text-center text-sm text-gray-400 italic">Sin registros previos.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
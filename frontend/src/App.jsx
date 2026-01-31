import { useState, useEffect } from 'react'
import axios from 'axios'
import { cn } from "@/lib/utils" // Asegúrate de tener este archivo creado
import { Button } from "@/components/ui/button" // Asegúrate de tener este componente
import { Input } from "@/components/ui/input"   // Asegúrate de tener este componente
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // Asegúrate de tener este componente

// Iconos
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  LogOut, 
  Plus, 
  Search, 
  Activity, 
  Trash2, 
  Edit, 
  ShieldCheck,
  Lock,
  Unlock,
  Menu,
  X
} from "lucide-react"

const API_URL = 'https://cardio-app-production.up.railway.app/api';

export default function App() {
  // --- ESTADOS DE LOGICA (TUS ESTADOS ORIGINALES) ---
  const [token, setToken] = useState(localStorage.getItem('jwt_token')); 
  const [role, setRole] = useState(localStorage.getItem('user_role')); 
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  
  const [pacientes, setPacientes] = useState([])
  const [nuevoPaciente, setNuevoPaciente] = useState({ nombre: '', apellido: '', dni: '' })
  
  // Estados para Modals/Edición
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null) // Para Historia
  const [pacienteAEditar, setPacienteAEditar] = useState(null) // Para Editar
  const [mostrarModalHistoria, setMostrarModalHistoria] = useState(false)
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false)

  const [consultas, setConsultas] = useState([])
  const [nuevaConsulta, setNuevaConsulta] = useState({ motivo: '', diagnostico: '', tratamiento: '' })
  
  // Admin
  const [listaMedicos, setListaMedicos] = useState([])
  const [nuevoMedicoData, setNuevoMedicoData] = useState({ username: '', password: '' });

  // --- ESTADOS DE UI (NUEVO DISEÑO) ---
  const [activeTab, setActiveTab] = useState("dashboard") // Para navegar en el sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false) // Para móvil
  const [searchTerm, setSearchTerm] = useState("")

  // Configuración de Headers
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

  // ================= FUNCIONES DE NEGOCIO (TU LÓGICA) =================
  
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, loginData);
      setToken(res.data.token);
      setRole(res.data.role);
      localStorage.setItem('jwt_token', res.data.token);
      localStorage.setItem('user_role', res.data.role);
    } catch (error) { alert("Error de credenciales") }
  }

  const cerrarSesion = () => {
    setToken(null); setRole(null);
    localStorage.removeItem('jwt_token'); localStorage.removeItem('user_role');
    setPacientes([]); setListaMedicos([]);
  }

  // --- PACIENTES ---
  const cargarPacientes = async () => {
    try { const res = await axios.get(`${API_URL}/pacientes`, getConfig()); setPacientes(res.data) } 
    catch (error) { if(error.response?.status === 403) cerrarSesion() }
  }

  const guardarPaciente = async (e) => {
    e.preventDefault();
    try { 
      await axios.post(`${API_URL}/pacientes`, nuevoPaciente, getConfig()); 
      alert("Paciente guardado");
      setNuevoPaciente({ nombre: '', apellido: '', dni: '' }); 
      cargarPacientes();
    } catch (error) { alert("Error al guardar") }
  }

  const eliminarPaciente = async (id) => {
    if(!window.confirm("¿Seguro que deseas eliminar este paciente?")) return;
    try { await axios.delete(`${API_URL}/pacientes/${id}`, getConfig()); cargarPacientes(); } 
    catch (error) { alert("Error al eliminar") }
  }

  const prepararEdicion = (paciente) => {
    setPacienteAEditar(paciente);
    setMostrarModalEditar(true);
  }

  const actualizarPaciente = async () => {
    try { 
      await axios.put(`${API_URL}/pacientes/${pacienteAEditar.id}`, pacienteAEditar, getConfig()); 
      setMostrarModalEditar(false);
      cargarPacientes();
    } catch (error) { alert("Error al actualizar") }
  }

  const handleBusqueda = async (termino) => {
    setSearchTerm(termino);
    if (termino.length === 0) { cargarPacientes(); return; }
    try { const res = await axios.get(`${API_URL}/pacientes/buscar?query=${termino}`, getConfig()); setPacientes(res.data); } catch (error) { }
  }

  // --- HISTORIA CLÍNICA ---
  const abrirHistoria = async (paciente) => {
    setPacienteSeleccionado(paciente);
    try { 
      const res = await axios.get(`${API_URL}/consultas/paciente/${paciente.id}`, getConfig()); 
      setConsultas(res.data); 
      setMostrarModalHistoria(true);
    } catch (error) {}
  }

  const guardarConsulta = async () => {
    if (!pacienteSeleccionado) return;
    try { 
      await axios.post(`${API_URL}/consultas/${pacienteSeleccionado.id}`, nuevaConsulta, getConfig()); 
      setNuevaConsulta({ motivo: '', diagnostico: '', tratamiento: '' }); 
      const res = await axios.get(`${API_URL}/consultas/paciente/${pacienteSeleccionado.id}`, getConfig()); 
      setConsultas(res.data); 
    } catch (error) { alert("Error al guardar consulta") }
  }

  // --- ADMIN ---
  const cargarMedicos = async () => { try { const res = await axios.get(`${API_URL}/admin/medicos`, getConfig()); setListaMedicos(res.data) } catch (error) { } }
  
  const crearMedicoAdmin = async () => { try { await axios.post(`${API_URL}/admin/medicos`, nuevoMedicoData, getConfig()); setNuevoMedicoData({ username: '', password: '' }); cargarMedicos(); alert("Médico Creado"); } catch (error) { alert("Error al crear") } }
  
  const toggleMedico = async (id) => { try { await axios.put(`${API_URL}/admin/medicos/${id}/toggle`, {}, getConfig()); cargarMedicos(); } catch (error) { } }
  
  const eliminarMedico = async (id) => { if(!window.confirm("Se borrarán sus datos. ¿Confirmar?")) return; try { await axios.delete(`${API_URL}/admin/medicos/${id}`, getConfig()); cargarMedicos() } catch (error) { } }


  // ==================== VISTA: LOGIN (Diseño Moderno) ====================
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">MediRecord</CardTitle>
            <p className="text-sm text-muted-foreground">Acceso al Sistema de Gestión</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                placeholder="usuario@ejemplo.com" 
                onChange={(e) => setLoginData({...loginData, username: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contraseña</label>
              <Input 
                type="password" 
                placeholder="••••••" 
                onChange={(e) => setLoginData({...loginData, password: e.target.value})} 
              />
            </div>
            <Button className="w-full" onClick={handleLogin}>Ingresar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==================== VISTA: LAYOUT PRINCIPAL (Sidebar + Contenido) ====================
  
  // Definimos el menú según el rol
  const menuItems = role === 'ADMIN' 
    ? [ { id: "admin_usuarios", label: "Gestión Médicos", icon: Users } ]
    : [ { id: "pacientes", label: "Mis Pacientes", icon: Users }, { id: "nuevo_paciente", label: "Nuevo Paciente", icon: Plus } ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* 1. SIDEBAR (Barra Lateral) */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-6 border-b">
          <Activity className="w-6 h-6 text-primary mr-2" />
          <span className="font-bold text-lg">MediRecord</span>
        </div>

        <div className="p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                activeTab === item.id ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
              {role === 'ADMIN' ? 'AD' : 'DR'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">Usuario Activo</p>
              <p className="text-xs text-muted-foreground">{role}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={cerrarSesion}>
            <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Overlay para móvil */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* 2. ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-auto h-screen">
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1 px-4">
             {/* Barra de título dinámica */}
             <h1 className="text-xl font-semibold text-gray-800">
               {activeTab === 'pacientes' && 'Listado de Pacientes'}
               {activeTab === 'nuevo_paciente' && 'Registrar Nuevo Paciente'}
               {activeTab === 'admin_usuarios' && 'Panel de Administración'}
             </h1>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          
          {/* VISTA: LISTA DE PACIENTES (MÉDICO) */}
          {activeTab === 'pacientes' && (
            <div className="space-y-6">
              {/* Buscador */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Buscar por apellido..." 
                  className="pl-10" 
                  onChange={(e) => handleBusqueda(e.target.value)}
                />
              </div>

              {/* Grid de Tarjetas */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {pacientes.map((p) => (
                  <Card key={p.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                           {p.nombre.charAt(0)}{p.apellido.charAt(0)}
                         </div>
                         <div>
                           <CardTitle className="text-base">{p.apellido}, {p.nombre}</CardTitle>
                           <p className="text-xs text-muted-foreground">DNI: {p.dni}</p>
                         </div>
                       </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" className="flex-1 bg-primary/90" onClick={() => abrirHistoria(p)}>
                          <FileText className="w-4 h-4 mr-2" /> Historia
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => prepararEdicion(p)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => eliminarPaciente(p.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {pacientes.length === 0 && <p className="text-center text-gray-500 mt-10">No se encontraron pacientes.</p>}
            </div>
          )}

          {/* VISTA: NUEVO PACIENTE (MÉDICO) */}
          {activeTab === 'nuevo_paciente' && (
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Datos Personales</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={guardarPaciente} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nombre</label>
                        <Input value={nuevoPaciente.nombre} onChange={(e) => setNuevoPaciente({...nuevoPaciente, nombre: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Apellido</label>
                        <Input value={nuevoPaciente.apellido} onChange={(e) => setNuevoPaciente({...nuevoPaciente, apellido: e.target.value})} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">DNI / Documento</label>
                      <Input value={nuevoPaciente.dni} onChange={(e) => setNuevoPaciente({...nuevoPaciente, dni: e.target.value})} required />
                    </div>
                    <div className="pt-4 flex justify-end">
                      <Button type="submit">Guardar Paciente</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* VISTA: ADMIN PANEL */}
          {activeTab === 'admin_usuarios' && (
            <div className="space-y-6">
              {/* Crear Médico */}
              <Card>
                <CardHeader><CardTitle>Dar de alta Médico</CardTitle></CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4">
                  <Input placeholder="Email del médico" value={nuevoMedicoData.username} onChange={(e) => setNuevoMedicoData({...nuevoMedicoData, username: e.target.value})} />
                  <Input type="password" placeholder="Contraseña" value={nuevoMedicoData.password} onChange={(e) => setNuevoMedicoData({...nuevoMedicoData, password: e.target.value})} />
                  <Button onClick={crearMedicoAdmin}>Crear</Button>
                </CardContent>
              </Card>

              {/* Lista Médicos */}
              <Card>
                <CardHeader><CardTitle>Médicos Registrados</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-600 uppercase">
                        <tr>
                          <th className="px-4 py-3">Estado</th>
                          <th className="px-4 py-3">Usuario</th>
                          <th className="px-4 py-3">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {listaMedicos.map((m) => (
                          <tr key={m.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <span className={cn("px-2 py-1 rounded-full text-xs font-medium", m.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                                {m.enabled ? "ACTIVO" : "BLOQUEADO"}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium">{m.username}</td>
                            <td className="px-4 py-3 flex gap-2">
                              <Button size="sm" variant="outline" className={m.enabled ? "text-orange-600" : "text-green-600"} onClick={() => toggleMedico(m.id)}>
                                {m.enabled ? <Lock className="w-4 h-4"/> : <Unlock className="w-4 h-4"/>}
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600" onClick={() => eliminarMedico(m.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </main>

      {/* ================= MODALES (Overlay Manual) ================= */}
      
      {/* Modal Editar Paciente */}
      {mostrarModalEditar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Editar Paciente</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setMostrarModalEditar(false)}><X className="w-4 h-4"/></Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><label>Nombre</label><Input value={pacienteAEditar.nombre} onChange={(e) => setPacienteAEditar({...pacienteAEditar, nombre: e.target.value})} /></div>
              <div className="space-y-2"><label>Apellido</label><Input value={pacienteAEditar.apellido} onChange={(e) => setPacienteAEditar({...pacienteAEditar, apellido: e.target.value})} /></div>
              <div className="space-y-2"><label>DNI</label><Input value={pacienteAEditar.dni} onChange={(e) => setPacienteAEditar({...pacienteAEditar, dni: e.target.value})} /></div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setMostrarModalEditar(false)}>Cancelar</Button>
                <Button onClick={actualizarPaciente}>Guardar Cambios</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Historia Clínica */}
      {mostrarModalHistoria && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl bg-white max-h-[90vh] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <div>
                <CardTitle>Historia Clínica</CardTitle>
                <p className="text-sm text-muted-foreground">{pacienteSeleccionado?.apellido}, {pacienteSeleccionado?.nombre}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMostrarModalHistoria(false)}><X className="w-4 h-4"/></Button>
            </CardHeader>
            
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {/* Formulario Nueva Evolución */}
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 space-y-3">
                <h4 className="font-semibold text-blue-900 flex items-center gap-2"><Plus className="w-4 h-4"/> Nueva Evolución</h4>
                <Input placeholder="Motivo de consulta" className="bg-white" value={nuevaConsulta.motivo} onChange={(e)=>setNuevaConsulta({...nuevaConsulta, motivo: e.target.value})} />
                <Input placeholder="Diagnóstico" className="bg-white" value={nuevaConsulta.diagnostico} onChange={(e)=>setNuevaConsulta({...nuevaConsulta, diagnostico: e.target.value})} />
                <textarea 
                  className="flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  rows={3}
                  placeholder="Tratamiento y notas..."
                  value={nuevaConsulta.tratamiento} 
                  onChange={(e)=>setNuevaConsulta({...nuevaConsulta, tratamiento: e.target.value})}
                />
                <Button className="w-full" onClick={guardarConsulta}>Guardar Evolución</Button>
              </div>

              {/* Historial */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Historial de Visitas</h4>
                {consultas.map((c) => (
                  <div key={c.id} className="p-4 rounded-lg border bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-primary">{c.motivo}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{c.fecha}</span>
                    </div>
                    <p className="text-sm text-gray-600"><span className="font-medium">Dx:</span> {c.diagnostico}</p>
                    {c.tratamiento && <p className="text-sm text-gray-500 mt-1 italic">{c.tratamiento}</p>}
                  </div>
                ))}
                {consultas.length === 0 && <p className="text-center text-sm text-gray-400 py-4">Sin registros previos.</p>}
              </div>
            </div>
          </Card>
        </div>
      )}

    </div>
  )
}
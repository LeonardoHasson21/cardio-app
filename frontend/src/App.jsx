import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  ChakraProvider, Box, Button, Input, VStack, Text, Heading, 
  Card, CardBody, Stack, Divider, Modal, ModalOverlay, 
  ModalContent, ModalHeader, ModalBody, ModalCloseButton, 
  useDisclosure, Textarea, Badge, Container, FormControl, FormLabel,
  Table, Thead, Tbody, Tr, Th, Td, IconButton, useToast, InputGroup, InputLeftElement
} from '@chakra-ui/react'
import { DeleteIcon, SearchIcon } from '@chakra-ui/icons'

// TU URL DE RAILWAY
const API_URL = 'https://cardio-app-production.up.railway.app/api';

function App() {
  const toast = useToast()
  
  // --- ESTADOS DE SEGURIDAD ---
  const [token, setToken] = useState(localStorage.getItem('jwt_token')); 
  const [role, setRole] = useState(localStorage.getItem('user_role')); 
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  // --- ESTADOS MEDICO (Pacientes) ---
  const [pacientes, setPacientes] = useState([])
  const [nuevoPaciente, setNuevoPaciente] = useState({ nombre: '', apellido: '', dni: '' })
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null)
  const [consultas, setConsultas] = useState([])
  const [nuevaConsulta, setNuevaConsulta] = useState({ motivo: '', diagnostico: '', tratamiento: '' })
  
  // --- ESTADOS ADMIN (Medicos) ---
  const [listaMedicos, setListaMedicos] = useState([])
  // Estado para el formulario de crear médico
  const [nuevoMedicoData, setNuevoMedicoData] = useState({ username: '', password: '' });

  const { isOpen, onOpen, onClose } = useDisclosure()

  const getConfig = () => ({ headers: { Authorization: `Bearer ${token}` } });

  // --- LOGIN ---
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, loginData);
      const newToken = res.data.token;
      const userRole = res.data.role;

      setToken(newToken);
      setRole(userRole);
      
      localStorage.setItem('jwt_token', newToken);
      localStorage.setItem('user_role', userRole);
      
      toast({ title: `Bienvenido ${userRole}`, status: 'success' })
    } catch (error) {
      toast({ title: 'Error de credenciales o cuenta bloqueada', status: 'error' })
    }
  }

  const cerrarSesion = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    setPacientes([]);
    setListaMedicos([]);
  }

  // --- EFECTOS DE CARGA ---
  useEffect(() => {
    if (token && role === 'MEDICO') cargarPacientes();
    if (token && role === 'ADMIN') cargarMedicos();
  }, [token, role])

  // ================= FUNCIONES MEDICO =================
  const cargarPacientes = async () => {
    try {
      const res = await axios.get(`${API_URL}/pacientes`, getConfig())
      setPacientes(res.data)
    } catch (error) { if(error.response?.status === 403) cerrarSesion() }
  }

  const guardarPaciente = async () => {
    try {
      await axios.post(`${API_URL}/pacientes`, nuevoPaciente, getConfig())
      toast({ title: 'Paciente guardado', status: 'success' })
      setNuevoPaciente({ nombre: '', apellido: '', dni: '' })
      cargarPacientes()
    } catch (error) { toast({ title: 'Error', status: 'error' }) }
  }

  const eliminarPaciente = async (id) => {
    if(!window.confirm("¿Seguro que quieres eliminar este paciente?")) return;
    try {
      await axios.delete(`${API_URL}/pacientes/${id}`, getConfig())
      toast({ title: 'Paciente eliminado', status: 'info' })
      cargarPacientes()
    } catch (error) { toast({ title: 'No puedes eliminar este paciente', status: 'error' }) }
  }

  const abrirHistoria = async (paciente) => {
    setPacienteSeleccionado(paciente)
    try {
      const res = await axios.get(`${API_URL}/consultas/paciente/${paciente.id}`, getConfig())
      setConsultas(res.data)
      onOpen()
    } catch (error) {}
  }

  const guardarConsulta = async () => {
    if (!pacienteSeleccionado) return;
    try {
      await axios.post(`${API_URL}/consultas/${pacienteSeleccionado.id}`, nuevaConsulta, getConfig())
      setNuevaConsulta({ motivo: '', diagnostico: '', tratamiento: '' })
      const res = await axios.get(`${API_URL}/consultas/paciente/${pacienteSeleccionado.id}`, getConfig())
      setConsultas(res.data)
      toast({ title: 'Evolución guardada', status: 'success' })
    } catch (error) { toast({ title: 'Error al guardar', status: 'error' }) }
  }

  // --- BUSCADOR ---
  const handleBusqueda = async (e) => {
    const termino = e.target.value;
    if (termino.length === 0) {
        cargarPacientes();
        return;
    }
    try {
        const res = await axios.get(`${API_URL}/pacientes/buscar?query=${termino}`, getConfig());
        setPacientes(res.data);
    } catch (error) { console.error("Error en búsqueda"); }
  }

  // ================= FUNCIONES ADMIN =================
  const cargarMedicos = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/medicos`, getConfig())
      setListaMedicos(res.data)
    } catch (error) { console.error(error) }
  }

  const eliminarMedico = async (id) => {
    if(!window.confirm("¡ATENCIÓN! Si eliminas al médico, se borrarán TODOS sus pacientes. ¿Confirmar?")) return;
    try {
      await axios.delete(`${API_URL}/admin/medicos/${id}`, getConfig())
      toast({ title: 'Médico eliminado', status: 'warning' })
      cargarMedicos()
    } catch (error) { toast({ title: 'Error eliminando médico', status: 'error' }) }
  }

  // Crear médico desde el admin
  const crearMedicoAdmin = async () => {
    try {
        await axios.post(`${API_URL}/admin/medicos`, nuevoMedicoData, getConfig());
        toast({ title: 'Médico creado exitosamente', status: 'success' });
        setNuevoMedicoData({ username: '', password: '' });
        cargarMedicos(); 
    } catch (error) {
        toast({ title: 'Error: El usuario ya existe o datos inválidos', status: 'error' });
    }
  }

  // Bloquear / Desbloquear acceso
  const toggleMedico = async (id) => {
    try {
        await axios.put(`${API_URL}/admin/medicos/${id}/toggle`, {}, getConfig());
        cargarMedicos(); 
        toast({ title: 'Estado actualizado', status: 'info' });
    } catch (error) { toast({ title: 'Error actualizando estado', status: 'error' }) }
  }


  // --- VISTA LOGIN ---
  if (!token) {
    return (
      <ChakraProvider>
        <Container maxW="sm" centerContent mt={20}>
          <Card w="100%" bg="white" boxShadow="lg">
            <CardBody>
              <VStack spacing={4}>
                <Heading size="md" color="blue.600">Acceso Sistema</Heading>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input onChange={(e) => setLoginData({...loginData, username: e.target.value})} />
                </FormControl>
                <FormControl>
                  <FormLabel>Contraseña</FormLabel>
                  <Input type="password" onChange={(e) => setLoginData({...loginData, password: e.target.value})} />
                </FormControl>
                <Button colorScheme="blue" w="full" onClick={handleLogin}>Ingresar</Button>
              </VStack>
            </CardBody>
          </Card>
        </Container>
      </ChakraProvider>
    );
  }

  // --- VISTA ADMIN (PANEL DE GESTIÓN) ---
  if (role === 'ADMIN') {
    return (
        <ChakraProvider>
            <Box p={8} maxW="1000px" mx="auto">
                <Stack direction="row" justifyContent="space-between" mb={6}>
                    <Heading color="purple.600">🛡️ Panel de Suscripciones</Heading>
                    <Button colorScheme="red" variant="outline" size="sm" onClick={cerrarSesion}>Salir</Button>
                </Stack>
                
                {/* FORMULARIO CREAR MÉDICO */}
                <Card mb={8} bg="purple.50">
                    <CardBody>
                        <Heading size="sm" mb={4}>Dar de Alta Nuevo Médico</Heading>
                        <Stack direction="row" spacing={4}>
                            <Input 
                                placeholder="Email del médico" 
                                bg="white" 
                                value={nuevoMedicoData.username} 
                                onChange={(e) => setNuevoMedicoData({...nuevoMedicoData, username: e.target.value})} 
                            />
                            <Input 
                                placeholder="Contraseña provisoria" 
                                type="password" 
                                bg="white" 
                                value={nuevoMedicoData.password} 
                                onChange={(e) => setNuevoMedicoData({...nuevoMedicoData, password: e.target.value})} 
                            />
                            <Button colorScheme="purple" onClick={crearMedicoAdmin}>Crear Cuenta</Button>
                        </Stack>
                    </CardBody>
                </Card>

                {/* TABLA DE MÉDICOS */}
                <Card variant="outline">
                    <CardBody>
                        <Heading size="md" mb={4}>Gestión de Accesos</Heading>
                        <Table variant="simple">
                            <Thead>
                                <Tr><Th>Estado</Th><Th>Médico (Email)</Th><Th>Acción</Th></Tr>
                            </Thead>
                            <Tbody>
                                {listaMedicos.map(medico => (
                                    <Tr key={medico.id}>
                                        <Td>
                                            <Badge colorScheme={medico.enabled ? "green" : "red"}>
                                                {medico.enabled ? "ACTIVO" : "BLOQUEADO"}
                                            </Badge>
                                        </Td>
                                        <Td fontWeight="bold">{medico.username}</Td>
                                        <Td>
                                            <Stack direction="row" spacing={2}>
                                                <Button 
                                                    size="sm" 
                                                    colorScheme={medico.enabled ? "orange" : "green"} 
                                                    variant="solid"
                                                    onClick={() => toggleMedico(medico.id)}
                                                >
                                                    {medico.enabled ? "Bloquear" : "Habilitar"}
                                                </Button>
                                                <IconButton 
                                                    aria-label="Borrar" 
                                                    icon={<DeleteIcon />} 
                                                    colorScheme="red" 
                                                    size="sm" 
                                                    onClick={() => eliminarMedico(medico.id)} 
                                                />
                                            </Stack>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </CardBody>
                </Card>
            </Box>
        </ChakraProvider>
    )
  }

  // --- VISTA MEDICO (PANEL DE PACIENTES) ---
  return (
    <ChakraProvider>
      <Box p={8} maxW="1000px" mx="auto">
        <Stack direction="row" justifyContent="space-between" mb={6}>
          <Heading color="blue.600">🏥 Consultorio Médico</Heading>
          <Button colorScheme="red" variant="outline" size="sm" onClick={cerrarSesion}>Cerrar Sesión</Button>
        </Stack>

        {/* REGISTRO DE PACIENTE */}
        <Card mb={8} bg="gray.50">
          <CardBody>
            <Heading size="md" mb={4}>Nuevo Paciente</Heading>
            <Stack direction="row" spacing={4}>
              <Input placeholder="Nombre" bg="white" value={nuevoPaciente.nombre} onChange={(e) => setNuevoPaciente({...nuevoPaciente, nombre: e.target.value})} />
              <Input placeholder="Apellido" bg="white" value={nuevoPaciente.apellido} onChange={(e) => setNuevoPaciente({...nuevoPaciente, apellido: e.target.value})} />
              <Input placeholder="DNI" bg="white" value={nuevoPaciente.dni} onChange={(e) => setNuevoPaciente({...nuevoPaciente, dni: e.target.value})} />
              <Button colorScheme="blue" onClick={guardarPaciente}>Registrar</Button>
            </Stack>
          </CardBody>
        </Card>

        {/* BUSCADOR Y TÍTULO */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
            <Heading size="md">Mis Pacientes</Heading>
            <Box w="300px">
                <InputGroup>
                    <InputLeftElement pointerEvents='none'>
                        <SearchIcon color='gray.300' />
                    </InputLeftElement>
                    <Input 
                        type='text' 
                        placeholder='Buscar por apellido...' 
                        bg="white" 
                        onChange={handleBusqueda} 
                    />
                </InputGroup>
            </Box>
        </Stack>
        
        {/* LISTA DE PACIENTES */}
        <VStack spacing={4} align="stretch">
          {pacientes.map(p => (
            <Card key={p.id} variant="outline">
              <CardBody display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Heading size="sm">{p.apellido}, {p.nombre}</Heading>
                  <Text fontSize="sm" color="gray.600">DNI: {p.dni}</Text>
                </Box>
                <Stack direction="row">
                    <Button colorScheme="teal" size="sm" onClick={() => abrirHistoria(p)}>📂 Historia</Button>
                    <IconButton icon={<DeleteIcon/>} colorScheme="red" size="sm" variant="ghost" onClick={() => eliminarPaciente(p.id)} />
                </Stack>
              </CardBody>
            </Card>
          ))}
        </VStack>

        {/* MODAL HISTORIA CLÍNICA */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Historia Clínica: {pacienteSeleccionado?.apellido}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box bg="blue.50" p={4} borderRadius="md" mb={6}>
                <Text fontWeight="bold" mb={2}>Nueva Evolución</Text>
                <VStack spacing={3}>
                  <Input placeholder="Motivo" bg="white" value={nuevaConsulta.motivo} onChange={(e)=>setNuevaConsulta({...nuevaConsulta, motivo: e.target.value})} />
                  <Input placeholder="Diagnóstico" bg="white" value={nuevaConsulta.diagnostico} onChange={(e)=>setNuevaConsulta({...nuevaConsulta, diagnostico: e.target.value})} />
                  <Textarea placeholder="Tratamiento" bg="white" value={nuevaConsulta.tratamiento} onChange={(e)=>setNuevaConsulta({...nuevaConsulta, tratamiento: e.target.value})} />
                  <Button colorScheme="blue" width="full" onClick={guardarConsulta}>Guardar</Button>
                </VStack>
              </Box>
              <Divider mb={4} />
              <Heading size="sm" mb={4}>Historial</Heading>
              {consultas.map(c => (
                 <Box key={c.id} p={3} borderWidth="1px" borderRadius="md" mb={2}>
                    <Badge colorScheme="green">{c.fecha}</Badge>
                    <Text fontWeight="bold">{c.motivo}</Text>
                    <Text fontSize="sm">Dx: {c.diagnostico}</Text>
                 </Box>
              ))}
            </ModalBody>
          </ModalContent>
        </Modal>

      </Box>
    </ChakraProvider>
  )
}

export default App
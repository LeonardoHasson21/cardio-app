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
  
  // ESTADOS DE SEGURIDAD
  const [token, setToken] = useState(localStorage.getItem('jwt_token')); 
  // Leemos el rol guardado, si no existe asumimos null
  const [role, setRole] = useState(localStorage.getItem('user_role')); 
  
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  // ESTADOS MEDICO (Pacientes)
  const [pacientes, setPacientes] = useState([])
  const [nuevoPaciente, setNuevoPaciente] = useState({ nombre: '', apellido: '', dni: '' })
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null)
  const [consultas, setConsultas] = useState([])
  const [nuevaConsulta, setNuevaConsulta] = useState({ motivo: '', diagnostico: '', tratamiento: '' })
  
  // ESTADOS ADMIN (Medicos)
  const [listaMedicos, setListaMedicos] = useState([])

  const { isOpen, onOpen, onClose } = useDisclosure()

  const getConfig = () => ({ headers: { Authorization: `Bearer ${token}` } });

  // --- LOGIN ---
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, loginData);
      const newToken = res.data.token;
      const userRole = res.data.role; // Ahora el backend nos manda el ROL

      setToken(newToken);
      setRole(userRole);
      
      localStorage.setItem('jwt_token', newToken);
      localStorage.setItem('user_role', userRole);
      
      toast({ title: `Bienvenido ${userRole}`, status: 'success' })
    } catch (error) {
      toast({ title: 'Error de credenciales', status: 'error' })
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
    } catch (error) { alert("Error") }
  }

  // --- BUSCADOR ---
  const handleBusqueda = async (e) => {
    const termino = e.target.value;
    
    // Si borró todo, volvemos a cargar la lista completa
    if (termino.length === 0) {
        cargarPacientes();
        return;
    }

    // Si escribió algo, buscamos en el servidor
    try {
        const res = await axios.get(`${API_URL}/pacientes/buscar?query=${termino}`, getConfig());
        setPacientes(res.data);
    } catch (error) {
        console.error("Error en búsqueda");
    }
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

  // --- VISTA ADMIN (PANEL DE MEDICOS) ---
  if (role === 'ADMIN') {
    return (
        <ChakraProvider>
            <Box p={8} maxW="1000px" mx="auto">
                <Stack direction="row" justifyContent="space-between" mb={6}>
                    <Heading color="purple.600">🛡️ Panel de Administrador</Heading>
                    <Button colorScheme="red" variant="outline" size="sm" onClick={cerrarSesion}>Salir</Button>
                </Stack>
                
                <Card variant="outline">
                    <CardBody>
                        <Heading size="md" mb={4}>Gestión de Médicos</Heading>
                        <Table variant="simple">
                            <Thead>
                                <Tr><Th>ID</Th><Th>Email</Th><Th>Rol</Th><Th>Acción</Th></Tr>
                            </Thead>
                            <Tbody>
                                {listaMedicos.map(medico => (
                                    <Tr key={medico.id}>
                                        <Td>{medico.id}</Td>
                                        <Td fontWeight="bold">{medico.username}</Td>
                                        <Td><Badge colorScheme="purple">{medico.role}</Badge></Td>
                                        <Td>
                                            <IconButton aria-label="Borrar" icon={<DeleteIcon />} colorScheme="red" size="sm" 
                                                onClick={() => eliminarMedico(medico.id)} 
                                            />
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

        <Card mb={8} bg="gray.50">
          <CardBody>
            <Heading size="md" mb={4}>Nuevo Paciente</Heading>
            <Stack direction="row" spacing={4}>
              <Input placeholder="Nombre" bg="white" onChange={(e) => setNuevoPaciente({...nuevoPaciente, nombre: e.target.value})} />
              <Input placeholder="Apellido" bg="white" onChange={(e) => setNuevoPaciente({...nuevoPaciente, apellido: e.target.value})} />
              <Input placeholder="DNI" bg="white" onChange={(e) => setNuevoPaciente({...nuevoPaciente, dni: e.target.value})} />
              <Button colorScheme="blue" onClick={guardarPaciente}>Registrar</Button>
            </Stack>
          </CardBody>
        </Card>

        <Heading size="md" mb={4}>Mis Pacientes</Heading>
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
                        onChange={handleBusqueda} // <--- Conecta con la función
                    />
                </InputGroup>
            </Box>
        </Stack>
        {/* Aquí abajo sigue tu <VStack> con la lista de pacientes... */}
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
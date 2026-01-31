import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  ChakraProvider, Box, Button, Input, VStack, Text, Heading, 
  Card, CardBody, Stack, Divider, Modal, ModalOverlay, 
  ModalContent, ModalHeader, ModalBody, ModalCloseButton, 
  useDisclosure, Textarea, Badge, FormControl, FormLabel,
  Table, Thead, Tbody, Tr, Th, Td, IconButton, useToast, 
  InputGroup, InputLeftElement, ModalFooter, Flex, Container, SimpleGrid
} from '@chakra-ui/react'
import { DeleteIcon, SearchIcon, EditIcon } from '@chakra-ui/icons'

const API_URL = 'https://cardio-app-production.up.railway.app/api';

function App() {
  const toast = useToast()
  
  // --- ESTADOS ---
  const [token, setToken] = useState(localStorage.getItem('jwt_token')); 
  const [role, setRole] = useState(localStorage.getItem('user_role')); 
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [pacientes, setPacientes] = useState([])
  const [nuevoPaciente, setNuevoPaciente] = useState({ nombre: '', apellido: '', dni: '' })
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null)
  const [consultas, setConsultas] = useState([])
  const [nuevaConsulta, setNuevaConsulta] = useState({ motivo: '', diagnostico: '', tratamiento: '' })
  const [pacienteAEditar, setPacienteAEditar] = useState({ id: '', nombre: '', apellido: '', dni: '' })
  const [listaMedicos, setListaMedicos] = useState([])
  const [nuevoMedicoData, setNuevoMedicoData] = useState({ username: '', password: '' });

  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure()

  const getConfig = () => ({ headers: { Authorization: `Bearer ${token}` } });

  // --- FUNCIONES (Login, Logout, Cargar datos) ---
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, loginData);
      setToken(res.data.token);
      setRole(res.data.role);
      localStorage.setItem('jwt_token', res.data.token);
      localStorage.setItem('user_role', res.data.role);
      toast({ title: `Bienvenido ${res.data.role}`, status: 'success' })
    } catch (error) { toast({ title: 'Error de credenciales', status: 'error' }) }
  }

  const cerrarSesion = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    setPacientes([]);
    setListaMedicos([]);
  }

  useEffect(() => {
    if (token && role === 'MEDICO') cargarPacientes();
    if (token && role === 'ADMIN') cargarMedicos();
  }, [token, role])

  // ... (TUS FUNCIONES DE LÓGICA: cargarPacientes, guardarPaciente, eliminar, etc. SE MANTIENEN IGUAL) ...
  // Para ahorrar espacio aquí, asumo que mantienes las mismas funciones de lógica que ya tenías.
  // Solo voy a poner las visuales corregidas abajo.

  const cargarPacientes = async () => {
    try { const res = await axios.get(`${API_URL}/pacientes`, getConfig()); setPacientes(res.data) } 
    catch (error) { if(error.response?.status === 403) cerrarSesion() }
  }
  const guardarPaciente = async () => {
    try { await axios.post(`${API_URL}/pacientes`, nuevoPaciente, getConfig()); toast({ title: 'Paciente guardado', status: 'success' }); setNuevoPaciente({ nombre: '', apellido: '', dni: '' }); cargarPacientes() } 
    catch (error) { toast({ title: 'Error', status: 'error' }) }
  }
  const eliminarPaciente = async (id) => {
    if(!window.confirm("¿Seguro?")) return;
    try { await axios.delete(`${API_URL}/pacientes/${id}`, getConfig()); toast({ title: 'Eliminado', status: 'info' }); cargarPacientes() } 
    catch (error) { toast({ title: 'Error', status: 'error' }) }
  }
  const abrirModalEdicion = (paciente) => { setPacienteAEditar(paciente); onOpenEdit(); }
  const actualizarPaciente = async () => {
    try { await axios.put(`${API_URL}/pacientes/${pacienteAEditar.id}`, pacienteAEditar, getConfig()); toast({ title: 'Actualizado', status: 'success' }); onCloseEdit(); cargarPacientes() } 
    catch (error) { toast({ title: 'Error', status: 'error' }) }
  }
  const abrirHistoria = async (paciente) => {
    setPacienteSeleccionado(paciente);
    try { const res = await axios.get(`${API_URL}/consultas/paciente/${paciente.id}`, getConfig()); setConsultas(res.data); onOpen(); } catch (error) {}
  }
  const guardarConsulta = async () => {
    if (!pacienteSeleccionado) return;
    try { await axios.post(`${API_URL}/consultas/${pacienteSeleccionado.id}`, nuevaConsulta, getConfig()); setNuevaConsulta({ motivo: '', diagnostico: '', tratamiento: '' }); const res = await axios.get(`${API_URL}/consultas/paciente/${pacienteSeleccionado.id}`, getConfig()); setConsultas(res.data); toast({ title: 'Guardado', status: 'success' }) } 
    catch (error) { toast({ title: 'Error', status: 'error' }) }
  }
  const handleBusqueda = async (e) => {
    const termino = e.target.value;
    if (termino.length === 0) { cargarPacientes(); return; }
    try { const res = await axios.get(`${API_URL}/pacientes/buscar?query=${termino}`, getConfig()); setPacientes(res.data); } catch (error) { }
  }
  const cargarMedicos = async () => { try { const res = await axios.get(`${API_URL}/admin/medicos`, getConfig()); setListaMedicos(res.data) } catch (error) { } }
  const eliminarMedico = async (id) => { if(!window.confirm("Se borrarán pacientes. ¿Confirmar?")) return; try { await axios.delete(`${API_URL}/admin/medicos/${id}`, getConfig()); cargarMedicos() } catch (error) { } }
  const crearMedicoAdmin = async () => { try { await axios.post(`${API_URL}/admin/medicos`, nuevoMedicoData, getConfig()); setNuevoMedicoData({ username: '', password: '' }); cargarMedicos(); toast({status:'success', title:'Creado'}) } catch (error) { toast({status:'error', title:'Error'}) } }
  const toggleMedico = async (id) => { try { await axios.put(`${API_URL}/admin/medicos/${id}/toggle`, {}, getConfig()); cargarMedicos(); } catch (error) { } }


  // ==================== VISTA LOGIN (CENTRADA) ====================
  if (!token) {
    return (
      <ChakraProvider>
        {/* Usamos Flex con height 100vh para centrar vertical y horizontalmente */}
        <Flex minH="100vh" align="center" justify="center" bg="gray.100">
          <Container maxW="sm">
            <Card boxShadow="xl" borderRadius="lg">
              <CardBody>
                <VStack spacing={6}>
                  <Heading size="lg" color="blue.600" textAlign="center">Acceso Sistema</Heading>
                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input size="lg" onChange={(e) => setLoginData({...loginData, username: e.target.value})} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Contraseña</FormLabel>
                    <Input size="lg" type="password" onChange={(e) => setLoginData({...loginData, password: e.target.value})} />
                  </FormControl>
                  <Button size="lg" colorScheme="blue" w="full" onClick={handleLogin}>
                    Ingresar
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </Container>
        </Flex>
      </ChakraProvider>
    );
  }

  // ==================== VISTA ADMIN (RESPONSIVE) ====================
  if (role === 'ADMIN') {
    return (
        <ChakraProvider>
            {/* Box que ocupa toda la pantalla con fondo gris suave */}
            <Box minH="100vh" bg="gray.50" py={10}>
                {/* Container centra el contenido horizontalmente y limita el ancho máximo */}
                <Container maxW="container.xl">
                    <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between" mb={8} align="center">
                        <Heading color="purple.600">🛡️ Panel de Suscripciones</Heading>
                        <Button colorScheme="red" variant="outline" onClick={cerrarSesion}>Cerrar Sesión</Button>
                    </Stack>
                    
                    <Card mb={8} bg="white" shadow="md">
                        <CardBody>
                            <Heading size="md" mb={4}>Dar de Alta Nuevo Médico</Heading>
                            {/* SimpleGrid hace que sea responsive: 1 columna en movil, 3 en PC */}
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                <Input placeholder="Email del médico" value={nuevoMedicoData.username} onChange={(e) => setNuevoMedicoData({...nuevoMedicoData, username: e.target.value})} />
                                <Input placeholder="Contraseña" type="password" value={nuevoMedicoData.password} onChange={(e) => setNuevoMedicoData({...nuevoMedicoData, password: e.target.value})} />
                                {/* w="full" para que ocupe el ancho de su columna */}
                                <Button colorScheme="purple" w="full" onClick={crearMedicoAdmin}>Crear Cuenta</Button>
                            </SimpleGrid>
                        </CardBody>
                    </Card>

                    <Card shadow="md">
                        <CardBody>
                            <Heading size="md" mb={4}>Gestión de Accesos</Heading>
                            <Box overflowX="auto"> {/* Permite scroll horizontal en tablas grandes en móvil */}
                                <Table variant="simple">
                                    <Thead><Tr><Th>Estado</Th><Th>Médico</Th><Th>Acción</Th></Tr></Thead>
                                    <Tbody>
                                        {listaMedicos.map(medico => (
                                            <Tr key={medico.id}>
                                                <Td><Badge colorScheme={medico.enabled ? "green" : "red"}>{medico.enabled ? "ACTIVO" : "BLOQUEADO"}</Badge></Td>
                                                <Td fontWeight="bold">{medico.username}</Td>
                                                <Td>
                                                    <Stack direction="row" spacing={2}>
                                                        <Button size="sm" colorScheme={medico.enabled ? "orange" : "green"} onClick={() => toggleMedico(medico.id)}>
                                                            {medico.enabled ? "Bloquear" : "Habilitar"}
                                                        </Button>
                                                        <IconButton aria-label="Borrar" icon={<DeleteIcon />} colorScheme="red" size="sm" onClick={() => eliminarMedico(medico.id)} />
                                                    </Stack>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
                        </CardBody>
                    </Card>
                </Container>
            </Box>
        </ChakraProvider>
    )
  }

  // ==================== VISTA MEDICO (RESPONSIVE) ====================
  return (
    <ChakraProvider>
      <Box minH="100vh" bg="gray.50" py={10}>
        <Container maxW="container.xl">
            <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between" mb={8} align="center">
                <Heading color="blue.600">🏥 Consultorio Médico</Heading>
                <Button colorScheme="red" variant="outline" onClick={cerrarSesion}>Cerrar Sesión</Button>
            </Stack>

            <Card mb={8} shadow="md">
                <CardBody>
                    <Heading size="md" mb={4}>Nuevo Paciente</Heading>
                    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                        <Input placeholder="Nombre" value={nuevoPaciente.nombre} onChange={(e) => setNuevoPaciente({...nuevoPaciente, nombre: e.target.value})} />
                        <Input placeholder="Apellido" value={nuevoPaciente.apellido} onChange={(e) => setNuevoPaciente({...nuevoPaciente, apellido: e.target.value})} />
                        <Input placeholder="DNI" value={nuevoPaciente.dni} onChange={(e) => setNuevoPaciente({...nuevoPaciente, dni: e.target.value})} />
                        <Button colorScheme="blue" w="full" onClick={guardarPaciente}>Registrar Paciente</Button>
                    </SimpleGrid>
                </CardBody>
            </Card>

            <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mb={6} spacing={4}>
                <Heading size="md">Mis Pacientes</Heading>
                <InputGroup maxW={{ base: '100%', md: '300px' }}>
                    <InputLeftElement pointerEvents='none'><SearchIcon color='gray.300' /></InputLeftElement>
                    <Input placeholder='Buscar por apellido...' bg="white" onChange={handleBusqueda} />
                </InputGroup>
            </Stack>
            
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {pacientes.map(p => (
                    <Card key={p.id} shadow="sm" _hover={{ shadow: 'md' }}>
                        <CardBody>
                            <Stack direction="row" justify="space-between" align="center" mb={2}>
                                <Heading size="md">{p.apellido}</Heading>
                                <Badge colorScheme="blue">DNI: {p.dni}</Badge>
                            </Stack>
                            <Text fontSize="lg" mb={4}>{p.nombre}</Text>
                            
                            <Divider mb={4} />
                            
                            <Stack direction="row" spacing={2} justify="end">
                                <Button leftIcon={<EditIcon/>} colorScheme="gray" size="sm" onClick={() => abrirModalEdicion(p)}>Editar</Button>
                                <Button colorScheme="teal" size="sm" onClick={() => abrirHistoria(p)}>Historia</Button>
                                <IconButton icon={<DeleteIcon/>} colorScheme="red" size="sm" variant="ghost" onClick={() => eliminarPaciente(p.id)} />
                            </Stack>
                        </CardBody>
                    </Card>
                ))}
            </SimpleGrid>

            {/* MODALES (IGUAL QUE ANTES) */}
            <Modal isOpen={isOpenEdit} onClose={onCloseEdit}>
                <ModalOverlay />
                <ModalContent mx={4}> {/* mx=4 para que no pegue a los bordes en movil */}
                    <ModalHeader>Editar Paciente</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl><FormLabel>Nombre</FormLabel><Input value={pacienteAEditar.nombre} onChange={(e) => setPacienteAEditar({...pacienteAEditar, nombre: e.target.value})} /></FormControl>
                            <FormControl><FormLabel>Apellido</FormLabel><Input value={pacienteAEditar.apellido} onChange={(e) => setPacienteAEditar({...pacienteAEditar, apellido: e.target.value})} /></FormControl>
                            <FormControl><FormLabel>DNI</FormLabel><Input value={pacienteAEditar.dni} onChange={(e) => setPacienteAEditar({...pacienteAEditar, dni: e.target.value})} /></FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onCloseEdit}>Cancelar</Button>
                        <Button colorScheme="blue" onClick={actualizarPaciente}>Guardar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent mx={4}>
                    <ModalHeader>Historia Clínica</ModalHeader>
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
                        <Stack spacing={3} maxH="300px" overflowY="auto">
                            {consultas.map(c => (
                                <Box key={c.id} p={3} borderWidth="1px" borderRadius="md" bg="white">
                                    <Badge colorScheme="green" mb={1}>{c.fecha}</Badge>
                                    <Text fontWeight="bold">{c.motivo}</Text>
                                    <Text fontSize="sm">Dx: {c.diagnostico}</Text>
                                </Box>
                            ))}
                        </Stack>
                    </ModalBody>
                </ModalContent>
            </Modal>

        </Container>
      </Box>
    </ChakraProvider>
  )
}

export default App
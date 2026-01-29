import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  ChakraProvider, Box, Button, Input, VStack, Text, Heading, 
  Card, CardBody, Stack, Divider, Modal, ModalOverlay, 
  ModalContent, ModalHeader, ModalBody, ModalCloseButton, 
  useDisclosure, Textarea, Badge, Container, FormControl, FormLabel
} from '@chakra-ui/react'

// TU URL REAL DE RAILWAY
const API_URL = 'https://cardio-app-production.up.railway.app/api';

function App() {
  // --- ESTADOS DE SEGURIDAD ---
  // Intentamos leer el token de la memoria al iniciar
  const [token, setToken] = useState(localStorage.getItem('jwt_token')); 
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  // --- ESTADOS DEL SISTEMA MÉDICO ---
  const [pacientes, setPacientes] = useState([])
  const [nuevoPaciente, setNuevoPaciente] = useState({ nombre: '', apellido: '', dni: '' })
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null)
  const [consultas, setConsultas] = useState([])
  const [nuevaConsulta, setNuevaConsulta] = useState({ motivo: '', diagnostico: '', tratamiento: '' })
  
  const { isOpen, onOpen, onClose } = useDisclosure()

  // --- HELPER: CABECERAS CON TOKEN ---
  // Esto crea el "pase de seguridad" para cada petición
  const getConfig = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  // --- FUNCIÓN DE LOGIN ---
  const handleLogin = async () => {
    try {
      // 1. Pedimos el token al backend (Esta ruta es PUBLICA)
      const res = await axios.post(`${API_URL}/auth/login`, loginData);
      const newToken = res.data.token;
      
      // 2. Guardamos el token en memoria y en el navegador
      setToken(newToken);
      localStorage.setItem('jwt_token', newToken);
      alert("¡Bienvenido Doctor!");
    } catch (error) {
      alert("Error: Usuario o contraseña incorrectos");
      console.error(error);
    }
  }

  const cerrarSesion = () => {
    setToken(null);
    localStorage.removeItem('jwt_token');
    setPacientes([]);
  }

  // --- CARGAR PACIENTES ---
  const cargarPacientes = async () => {
    if (!token) return; // Si no hay token, no intentamos cargar nada
    try {
      // AHORA ENVIAMOS EL CONFIG (TOKEN) EN LA PETICIÓN
      const res = await axios.get(`${API_URL}/pacientes`, getConfig())
      setPacientes(res.data)
    } catch (error) { 
      console.error("Error cargando pacientes", error);
      if(error.response?.status === 403) cerrarSesion(); // Si el token venció, salimos
    }
  }

  // Recargar pacientes cuando obtenemos el token
  useEffect(() => { cargarPacientes() }, [token])

  // --- GUARDAR PACIENTE ---
  const guardarPaciente = async () => {
    try {
      await axios.post(`${API_URL}/pacientes`, nuevoPaciente, getConfig())
      alert("Paciente guardado")
      setNuevoPaciente({ nombre: '', apellido: '', dni: '' })
      cargarPacientes()
    } catch (error) { alert("Error al guardar paciente") }
  }

  // --- ABRIR HISTORIA ---
  const abrirHistoria = async (paciente) => {
    setPacienteSeleccionado(paciente)
    try {
      const res = await axios.get(`${API_URL}/consultas/paciente/${paciente.id}`, getConfig())
      setConsultas(res.data)
      onOpen()
    } catch (error) { console.error("Error cargando historia", error) }
  }

  // --- GUARDAR CONSULTA ---
  const guardarConsulta = async () => {
    if (!pacienteSeleccionado) return;
    try {
      await axios.post(`${API_URL}/consultas/${pacienteSeleccionado.id}`, nuevaConsulta, getConfig())
      alert("Evolución guardada")
      setNuevaConsulta({ motivo: '', diagnostico: '', tratamiento: '' })
      
      const res = await axios.get(`${API_URL}/consultas/paciente/${pacienteSeleccionado.id}`, getConfig())
      setConsultas(res.data)
    } catch (error) { alert("Error guardando consulta") }
  }

  // --- VISTA: SI NO HAY TOKEN, MOSTRAMOS LOGIN ---
  if (!token) {
    return (
      <ChakraProvider>
        <Container maxW="sm" centerContent mt={20}>
          <Card w="100%" bg="white" boxShadow="lg">
            <CardBody>
              <VStack spacing={4}>
                <Heading size="md" color="blue.600">Acceso Médico</Heading>
                <Text fontSize="sm" color="gray.500">Sistema Seguro Cordio</Text>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input 
                    placeholder="medico@gmail.com" 
                    onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Contraseña</FormLabel>
                  <Input 
                    type="password" 
                    placeholder="••••••" 
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  />
                </FormControl>
                <Button colorScheme="blue" w="full" onClick={handleLogin}>Ingresar</Button>
              </VStack>
            </CardBody>
          </Card>
        </Container>
      </ChakraProvider>
    );
  }

  // --- VISTA: SI HAY TOKEN, MOSTRAMOS EL SISTEMA ---
  return (
    <ChakraProvider>
      <Box p={8} maxW="1000px" mx="auto">
        <Stack direction="row" justifyContent="space-between" mb={6}>
          <Heading textAlign="center">🏥 Sistema Cardiológico</Heading>
          <Button colorScheme="red" variant="outline" size="sm" onClick={cerrarSesion}>Cerrar Sesión</Button>
        </Stack>

        {/* FORMULARIO NUEVO PACIENTE */}
        <Card mb={8} bg="gray.50">
          <CardBody>
            <Heading size="md" mb={4}>Nuevo Ingreso</Heading>
            <Stack direction="row" spacing={4}>
              <Input placeholder="Nombre" bg="white" value={nuevoPaciente.nombre} onChange={(e) => setNuevoPaciente({...nuevoPaciente, nombre: e.target.value})} />
              <Input placeholder="Apellido" bg="white" value={nuevoPaciente.apellido} onChange={(e) => setNuevoPaciente({...nuevoPaciente, apellido: e.target.value})} />
              <Input placeholder="DNI" bg="white" value={nuevoPaciente.dni} onChange={(e) => setNuevoPaciente({...nuevoPaciente, dni: e.target.value})} />
              <Button colorScheme="blue" onClick={guardarPaciente}>Registrar</Button>
            </Stack>
          </CardBody>
        </Card>

        {/* LISTA DE PACIENTES */}
        <Heading size="md" mb={4}>Pacientes en Sistema</Heading>
        <VStack spacing={4} align="stretch">
          {pacientes.map(p => (
            <Card key={p.id} variant="outline">
              <CardBody display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Heading size="sm">{p.apellido}, {p.nombre}</Heading>
                  <Text fontSize="sm" color="gray.600">DNI: {p.dni}</Text>
                </Box>
                <Button colorScheme="teal" size="sm" onClick={() => abrirHistoria(p)}>
                  📂 Ver Historia Clínica
                </Button>
              </CardBody>
            </Card>
          ))}
        </VStack>

        {/* MODAL DE HISTORIA CLÍNICA */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Historia Clínica: {pacienteSeleccionado?.apellido}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              
              <Box bg="blue.50" p={4} borderRadius="md" mb={6}>
                <Text fontWeight="bold" mb={2}>Nueva Evolución (Hoy)</Text>
                <VStack spacing={3}>
                  <Input placeholder="Motivo de consulta" bg="white" value={nuevaConsulta.motivo} onChange={(e)=>setNuevaConsulta({...nuevaConsulta, motivo: e.target.value})} />
                  <Input placeholder="Diagnóstico Presuntivo" bg="white" value={nuevaConsulta.diagnostico} onChange={(e)=>setNuevaConsulta({...nuevaConsulta, diagnostico: e.target.value})} />
                  <Textarea placeholder="Tratamiento / Observaciones" bg="white" value={nuevaConsulta.tratamiento} onChange={(e)=>setNuevaConsulta({...nuevaConsulta, tratamiento: e.target.value})} />
                  <Button colorScheme="blue" width="full" onClick={guardarConsulta}>Guardar Evolución</Button>
                </VStack>
              </Box>

              <Divider mb={4} />

              <Heading size="sm" mb={4}>Evoluciones Anteriores</Heading>
              {consultas.length === 0 ? <Text>Sin antecedentes cargados.</Text> : (
                <VStack spacing={3} align="stretch">
                  {consultas.map(c => (
                    <Box key={c.id} p={3} borderWidth="1px" borderRadius="md">
                      <Stack direction="row" justify="space-between">
                        <Badge colorScheme="green">{c.fecha}</Badge>
                        <Text fontWeight="bold">{c.motivo}</Text>
                      </Stack>
                      <Text mt={2} fontSize="sm"><strong>Dx:</strong> {c.diagnostico}</Text>
                      <Text fontSize="sm"><strong>Tx:</strong> {c.tratamiento}</Text>
                    </Box>
                  ))}
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>

      </Box>
    </ChakraProvider>
  )
}

export default App
import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  ChakraProvider, Box, Button, Input, VStack, Text, Heading, 
  Card, CardBody, Stack, Divider, Modal, ModalOverlay, 
  ModalContent, ModalHeader, ModalBody, ModalCloseButton, 
  useDisclosure, Textarea, Badge 
} from '@chakra-ui/react'

function App() {
  // Estados para Pacientes
  const [pacientes, setPacientes] = useState([])
  const [nuevoPaciente, setNuevoPaciente] = useState({ nombre: '', apellido: '', dni: '' })

  // Estados para Historia Clínica (Consultas)
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null)
  const [consultas, setConsultas] = useState([])
  const [nuevaConsulta, setNuevaConsulta] = useState({ motivo: '', diagnostico: '', tratamiento: '' })
  
  // Control del Modal (Ventana emergente)
  const { isOpen, onOpen, onClose } = useDisclosure()

  // --- CARGA INICIAL ---
  const cargarPacientes = async () => {
    try {
      const res = await axios.get('http://localhost:8081/api/pacientes')
      setPacientes(res.data)
    } catch (error) { console.error("Error cargando pacientes", error) }
  }

  useEffect(() => { cargarPacientes() }, [])

  // --- GUARDAR PACIENTE ---
  const guardarPaciente = async () => {
    try {
      await axios.post('http://localhost:8081/api/pacientes', nuevoPaciente)
      alert("Paciente guardado")
      setNuevoPaciente({ nombre: '', apellido: '', dni: '' })
      cargarPacientes()
    } catch (error) { alert("Error al guardar paciente") }
  }

  // --- ABRIR HISTORIA CLÍNICA ---
  const abrirHistoria = async (paciente) => {
    setPacienteSeleccionado(paciente)
    try {
      // 1. Cargamos las consultas de ESTE paciente
      // Nota: Aunque el paciente ya trae las consultas en el array, es buena práctica refrescarlas
      const res = await axios.get(`http://localhost:8081/api/consultas/paciente/${paciente.id}`)
      setConsultas(res.data)
      onOpen() // Abrimos la ventana
    } catch (error) { console.error("Error cargando historia", error) }
  }

  // --- GUARDAR CONSULTA (NUEVA EVOLUCIÓN) ---
  const guardarConsulta = async () => {
    if (!pacienteSeleccionado) return;
    try {
      await axios.post(`http://localhost:8081/api/consultas/${pacienteSeleccionado.id}`, nuevaConsulta)
      alert("Evolución guardada")
      setNuevaConsulta({ motivo: '', diagnostico: '', tratamiento: '' })
      // Recargamos las consultas para ver la nueva
      const res = await axios.get(`http://localhost:8081/api/consultas/paciente/${pacienteSeleccionado.id}`)
      setConsultas(res.data)
    } catch (error) { alert("Error guardando consulta") }
  }

  return (
    <ChakraProvider>
      <Box p={8} maxW="1000px" mx="auto">
        <Heading mb={6} textAlign="center">🏥 Sistema de Gestión Cardiológica</Heading>

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
              
              {/* FORMULARIO NUEVA CONSULTA */}
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

              {/* HISTORIAL */}
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
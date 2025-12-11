<template>
  <div class="q-pa-md flex flex-center column">
    <h4>Registrar Usuario (Facial)</h4>
    <div style="max-width: 500px; width: 100%" class="column items-center">
      <q-input v-model="name" label="Nombre Completo" outlined class="q-mb-md full-width" />
      <q-input v-model="userId" label="ID / Cédula" outlined class="q-mb-md full-width" />
      
      <div class="relative-position q-mb-md" style="width: 100%; height: 300px; background: #000; border-radius: 8px; overflow: hidden;">
        <video ref="video" autoplay muted playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
        <div v-if="!modelsLoaded" class="absolute-full flex flex-center bg-dark text-white" style="opacity: 0.8">
            <q-spinner size="3em" />
            <div class="q-ml-sm">Cargando Modelos...</div>
        </div>
      </div>

      <q-btn 
        color="primary" 
        label="Capturar Rostro y Registrar" 
        class="full-width" 
        icon="camera_alt" 
        @click="registerUser" 
        :loading="loading"
        :disable="!name || !userId || !modelsLoaded"
      />

      <!-- User Management Section -->
      <q-separator class="q-my-lg full-width" />
      <div class="full-width">
        <div class="text-h6 q-mb-sm flex justify-between items-center">
            Usuarios Registrados ({{ users.length }})
            <q-btn flat color="negative" label="Eliminar Todos" size="sm" @click="confirmClearAll" v-if="users.length > 0"/>
        </div>
        
        <q-list bordered separator>
            <q-item v-for="user in users" :key="user.id">
                <q-item-section>
                    <q-item-label>{{ user.name }}</q-item-label>
                    <q-item-label caption>ID: {{ user.id }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-btn flat round color="negative" icon="delete" size="sm" @click="deleteUser(user.id)" />
                </q-item-section>
            </q-item>
            <q-item v-if="users.length === 0">
                <q-item-section class="text-center text-grey">No hay usuarios registrados</q-item-section>
            </q-item>
        </q-list>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { StorageService } from '../services/StorageService'
import * as faceapi from 'face-api.js'

const $q = useQuasar()
const name = ref('')
const userId = ref('')
const loading = ref(false)
const modelsLoaded = ref(false)
const video = ref(null)
const users = ref([])
let stream = null

onMounted(async () => {
  refreshUsers()
  await loadModels()
  startCamera()
})

onBeforeUnmount(() => {
  stopCamera()
})

function refreshUsers() {
    users.value = StorageService.getUsers()
}

async function loadModels() {
  try {
    const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models'
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ])
    modelsLoaded.value = true
  } catch (err) {
    console.error("Error loading models", err)
    $q.notify({ type: 'negative', message: 'Error cargando modelos de IA' })
  }
}

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
    if (video.value) {
      video.value.srcObject = stream
    }
  } catch (err) {
    console.error("Error starting camera", err)
    $q.notify({ type: 'negative', message: 'No se pudo acceder a la cámara' })
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }
}

async function registerUser() {
  loading.value = true
  try {
    if (!video.value) return

    // Detect face
    const detection = await faceapi.detectSingleFace(video.value).withFaceLandmarks().withFaceDescriptor()
    
    if (!detection) {
      throw new Error("No se detectó ningún rostro. Asegúrate de estar frente a la cámara.")
    }

    const faceDescriptor = Array.from(detection.descriptor)
    
    // Check for duplicates
    if (StorageService.isFaceRegistered(faceDescriptor)) {
        throw new Error("Este rostro ya está registrado en el sistema.")
    }

    // Save user
    const user = {
      id: userId.value,
      name: name.value,
      faceDescriptor: faceDescriptor
    }
    
    StorageService.saveUser(user)
    refreshUsers()
    
    $q.notify({ user: 'positive', message: 'Usuario registrado correctamente con rostro', icon: 'check' })
    
    name.value = ''
    userId.value = ''

  } catch (err) {
    console.error(err)
    $q.notify({ color: 'negative', message: 'Error: ' + err.message, icon: 'report_problem' })
  } finally {
    loading.value = false
  }
}

function deleteUser(id) {
    $q.dialog({
        title: 'Confirmar',
        message: '¿Estás seguro de eliminar este usuario?',
        cancel: true,
        persistent: true
    }).onOk(() => {
        StorageService.deleteUser(id)
        refreshUsers()
        $q.notify({ message: 'Usuario eliminado', color: 'info' })
    })
}

function confirmClearAll() {
    $q.dialog({
        title: '¡Peligro!',
        message: '¿Eliminar TODOS los usuarios? Esta acción no se puede deshacer.',
        cancel: true,
        persistent: true,
        color: 'negative'
    }).onOk(() => {
        StorageService.clearAllUsers()
        refreshUsers()
        $q.notify({ message: 'Todos los usuarios han sido eliminados', color: 'negative' })
    })
}
</script>

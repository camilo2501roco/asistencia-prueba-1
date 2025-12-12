<template>
  <div class="q-pa-md flex flex-center column">
    <h3>Tomar Asistencia (Facial)</h3>
    
    <div class="column items-center q-gutter-y-lg" style="width: 100%; max-width: 500px">
      
      <div class="relative-position video-container" style="width: 100%; max-height: 80vh; aspect-ratio: 3/4; background: #000; border-radius: 8px; overflow: hidden;">
        <video ref="video" autoplay muted playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
        
        <div v-if="!modelsLoaded" class="absolute-full flex flex-center bg-dark text-white" style="opacity: 0.8">
            <q-spinner size="3em" />
            <div class="q-ml-sm">Cargando Modelos...</div>
        </div>

        <div v-if="scanning" class="absolute-bottom text-center text-white bg-primary q-py-xs" style="opacity: 0.8">
           Escaneando...
        </div>
      </div>
      
      <div class="text-h6 text-grey text-center" v-if="!lastLog">Mira a la cámara para registrarte</div>
    </div>

    <!-- Last Log Display -->
    <q-card v-if="lastLog" class="q-mt-xl bg-green-1 fade-in-out" style="width: 100%; max-width: 400px">
      <q-card-section>
        <div class="text-h6 text-green-9">¡Bienvenido!</div>
        <div class="text-subtitle1">{{ lastLog.userName }}</div>
        <div class="text-caption">{{ new Date(lastLog.timestamp).toLocaleString() }}</div>
        <q-chip :color="lastLog.type === 'ENTRADA' ? 'green' : 'orange'" text-color="white">
          {{ lastLog.type }}
        </q-chip>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { StorageService } from '../services/StorageService'
import * as faceapi from 'face-api.js'

const $q = useQuasar()
const lastLog = ref(null)
const modelsLoaded = ref(false)
const video = ref(null)
const scanning = ref(false)
let stream = null
let intervalId = null
let isProcessing = false

onMounted(async () => {
  await loadModels()
  startCamera()
})

onBeforeUnmount(() => {
  stopCamera()
})

async function loadModels() {
  try {
    const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models'
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL), // Lighter model
      faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL), // Lighter landmarks
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
    // Constraint resolution to VGA (640x480) for mobile performance
    stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
        } 
    })
    if (video.value) {
      video.value.srcObject = stream
      // Start detection loop once video is playing
      video.value.onloadedmetadata = () => {
          video.value.play()
          startDetection()
      }
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
  if (intervalId) {
    clearInterval(intervalId)
  }
}

function startDetection() {
    scanning.value = true
    const options = new faceapi.TinyFaceDetectorOptions() // Use Tiny options

    intervalId = setInterval(async () => {
        if (!video.value || isProcessing || !modelsLoaded.value) return
        
        isProcessing = true
        try {
             // Use tinyFaceDetector for faster performance
             const detection = await faceapi.detectSingleFace(video.value, options)
                .withFaceLandmarks(true) // Use tiny landmarks
                .withFaceDescriptor()
             
             if (detection) {
                 const bestMatch = StorageService.findUserByFace(Array.from(detection.descriptor))
                 
                 if (bestMatch) {
                     handleMatch(bestMatch)
                 }
             }
        } catch (e) {
            console.error(e)
        } finally {
            isProcessing = false
        }
    }, 500)
}

function handleMatch(user) {
  
   
    if (lastLog.value && lastLog.value.userId === user.id && (new Date() - new Date(lastLog.value.timestamp) < 5000)) {
        return 
    }

    const log = {
         userName: user.name,
         userId: user.id,
         timestamp: new Date().toISOString(),
         type: 'ENTRADA' 
    }
       
    StorageService.saveLog(log)
    lastLog.value = log
    
    $q.notify({
         color: 'positive',
         message: `Bienvenido, ${user.name}!`,
         icon: 'verified',
         position: 'top',
         timeout: 2000
    })
}
</script>

<style scoped>
.fade-in-out {
  animation: fadeIn 0.5s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

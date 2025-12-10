<template>
  <div class="q-pa-md flex flex-center column">
    <h3>Tomar Asistencia</h3>
    
    <div class="column items-center q-gutter-y-lg">
      <q-icon name="fingerprint" size="100px" color="primary" class="cursor-pointer" @click="takeAttendance_Manual"/>
      
      <div class="text-h6 text-grey">Toca el icono para escanear</div>
      
      <q-btn 
        color="secondary" 
        size="lg"
        label="Registrar Entrada/Salida" 
        @click="takeAttendance" 
        :loading="loading"
        class="q-mt-md"
      />
    </div>

    <!-- Last Log Display -->
    <q-card v-if="lastLog" class="q-mt-xl bg-grey-2" style="width: 100%; max-width: 400px">
      <q-card-section>
        <div class="text-h6">Último Registro</div>
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
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { StorageService } from '../services/StorageService'
import { bufferToBase64URL } from '../utils/webauthn'

const $q = useQuasar()
const loading = ref(false)
const lastLog = ref(null)

async function takeAttendance() {
  loading.value = true
  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const publicKeyCredentialRequestOptions = {
        challenge: challenge,
        rpId: window.location.hostname,
        userVerification: "required",
    };

    const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
    });
    
    const credentialId = bufferToBase64URL(assertion.rawId);
    
    // Find user
    const user = StorageService.findUserByCredentialId(credentialId);
    
    if (user) {
       // Log attendance
       const log = {
         userName: user.name,
         userId: user.id,
         timestamp: new Date().toISOString(),
         type: 'ENTRADA' // Simplified logic, could toggle based on last log
       }
       
       StorageService.saveLog(log)
       lastLog.value = log
       
       $q.notify({
         color: 'positive',
         message: `Bienvenido, ${user.name}!`,
         icon: 'verified',
         position: 'center',
         timeout: 2000
       })
    } else {
       throw new Error("Usuario no encontrado")
    }

  } catch (err) {
    console.error(err)
    $q.notify({
      color: 'negative',
      message: 'No se reconoció la huella o error de lectura.',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Just an alias for the icon click
function takeAttendance_Manual() {
  takeAttendance()
}
</script>

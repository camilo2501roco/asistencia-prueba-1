<template>
  <div class="q-pa-md flex flex-center column">
    <h4>Registrar Usuario</h4>
    <div style="max-width: 400px; width: 100%">
      <q-input v-model="name" label="Nombre Completo" outlined class="q-mb-md" />
      <q-input v-model="userId" label="ID / Cédula" outlined class="q-mb-md" />
      
      <q-btn 
        color="primary" 
        label="Registrar Huella" 
        class="full-width" 
        icon="fingerprint" 
        @click="registerUser" 
        :loading="loading"
        :disable="!name || !userId"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { StorageService } from '../services/StorageService'
import { bufferToBase64URL } from '../utils/webauthn'

const $q = useQuasar()
const name = ref('')
const userId = ref('')
const loading = ref(false)

async function registerUser() {
  loading.value = true
  try {
    // Challenge for security (usually from server, but local here)
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const publicKeyCredentialCreationOptions = {
        challenge: challenge,
        rp: {
            name: "Sistema Asistencia",
            id: window.location.hostname,
        },
        user: {
            id: Uint8Array.from(userId.value, c => c.charCodeAt(0)),
            name: userId.value,
            displayName: name.value,
        },
        pubKeyCredParams: [{alg: -7, type: "public-key"}],
        authenticatorSelection: {
            authenticatorAttachment: "platform", // Force platform authenticator (TouchID/Windows Hello)
            userVerification: "required"
        },
        timeout: 60000,
        attestation: "direct"
    };

    const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
    });

    const credentialId = bufferToBase64URL(credential.rawId);

    // Save user
    const user = {
      id: userId.value,
      name: name.value,
      credentialId: credentialId
    }
    
    StorageService.saveUser(user)
    
    $q.notify({
      color: 'positive',
      message: 'Usuario registrado correctamente',
      icon: 'check'
    })
    
    name.value = ''
    userId.value = ''

  } catch (err) {
    console.error(err)
    $q.notify({
      color: 'negative',
      message: 'Error al registrar huella: ' + err.message,
      icon: 'report_problem'
    })
  } finally {
    loading.value = false
  }
}
</script>

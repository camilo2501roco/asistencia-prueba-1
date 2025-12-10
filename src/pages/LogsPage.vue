<template>
  <div class="q-pa-md">
    <h4>Registros</h4>
    <q-list bordered separator>
      <q-item v-for="(log, index) in logs" :key="index">
        <q-item-section>
          <q-item-label>{{ log.userName }}</q-item-label>
          <q-item-label caption>{{ log.userId }}</q-item-label>
        </q-item-section>
        
        <q-item-section side top>
          <q-item-label caption>{{ new Date(log.timestamp).toLocaleString() }}</q-item-label>
          <q-badge :color="log.type === 'ENTRADA' ? 'green' : 'orange'">
            {{ log.type }}
          </q-badge>
        </q-item-section>
      </q-item>
      
      <q-item v-if="logs.length === 0">
        <q-item-section class="text-center text-grey">
          No hay registros aún.
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { StorageService } from '../services/StorageService'

const logs = ref([])

onMounted(() => {
  logs.value = StorageService.getLogs()
})
</script>

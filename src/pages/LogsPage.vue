<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Calendar Section -->
      <div class="col-12 col-md-4">
        <q-date
          v-model="selectedDate"
          mask="YYYY-MM-DD"
          class="full-width"
          today-btn
        />
        <div class="q-mt-md text-center">
            <q-btn color="negative" label="Borrar Historial Completo" @click="confirmClearLogs" outline size="sm" />
        </div>
      </div>

      <!-- Logs List Section -->
      <div class="col-12 col-md-8">
        <div class="text-h6 q-mb-md flex justify-between">
            Registros del {{ selectedDate || 'Total' }}
            <span class="text-caption text-grey">{{ filteredLogs.length }} registros</span>
        </div>

        <q-list bordered separator>
          <q-item v-for="log in filteredLogs" :key="log.timestamp">
            <q-item-section avatar>
              <q-icon 
                :name="log.type === 'ENTRADA' ? 'login' : 'logout'" 
                :color="log.type === 'ENTRADA' ? 'green' : 'orange'" 
              />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold">{{ log.userName }}</q-item-label>
              <q-item-label caption>ID: {{ log.userId }}</q-item-label>
            </q-item-section>
            
            <q-item-section side>
              <q-item-label caption>{{ formatTime(log.timestamp) }}</q-item-label>
              <q-btn flat round icon="delete" color="grey" size="sm" @click="deleteLog(log)" />
            </q-item-section>
          </q-item>
          
          <q-item v-if="filteredLogs.length === 0">
            <q-item-section class="text-center text-grey q-pa-lg">
              <q-icon name="event_busy" size="48px" class="q-mb-sm" />
              No hay registros para esta fecha.
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { StorageService } from '../services/StorageService'

const $q = useQuasar()
const logs = ref([])
// Default to today
const today = new Date()
const selectedDate = ref(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`)

onMounted(() => {
  refreshLogs()
})

function refreshLogs() {
  logs.value = StorageService.getLogs()
}

const filteredLogs = computed(() => {
    if (!selectedDate.value) return logs.value
    
    return logs.value.filter(log => {
        const logDate = new Date(log.timestamp)
        const dateStr = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}-${String(logDate.getDate()).padStart(2, '0')}`
        return dateStr === selectedDate.value
    })
})

function formatTime(isoString) {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function deleteLog(log) {
    $q.dialog({
        title: 'Confirmar',
        message: '¿Eliminar este registro?',
        cancel: true,
        persistent: true
    }).onOk(() => {
        StorageService.deleteLog(log.timestamp)
        refreshLogs()
        $q.notify('Registro eliminado')
    })
}

function confirmClearLogs() {
    $q.dialog({
        title: '¡Peligro!',
        message: '¿Borrar TODO el historial de asistencia? No se puede deshacer.',
        cancel: true,
        persistent: true,
        color: 'negative'
    }).onOk(() => {
        StorageService.clearLogs()
        refreshLogs()
        $q.notify({ type: 'negative', message: 'Historial eliminado' })
    })
}
</script>

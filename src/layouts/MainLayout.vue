<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Asistencia Biometrica
        </q-toolbar-title>

        <div>v1.0</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label header>
          Menú
        </q-item-label>

        <q-item clickable @click="currentView = 'attendance'">
          <q-item-section avatar>
            <q-icon name="fingerprint" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Tomar Asistencia</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable @click="currentView = 'register'">
          <q-item-section avatar>
            <q-icon name="person_add" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Registrar Usuario</q-item-label>
          </q-item-section>
        </q-item>
        
        <q-item clickable @click="currentView = 'logs'">
          <q-item-section avatar>
            <q-icon name="list" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Ver Registros</q-item-label>
          </q-item-section>
        </q-item>

      </q-list>
    </q-drawer>

    <q-page-container>
      <component :is="activeComponent" />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import AttendancePage from '../pages/AttendancePage.vue'
import RegisterPage from '../pages/RegisterPage.vue'
import LogsPage from '../pages/LogsPage.vue'

const leftDrawerOpen = ref(false)
const currentView = ref('attendance')

const activeComponent = computed(() => {
  switch (currentView.value) {
    case 'register': return RegisterPage
    case 'logs': return LogsPage
    case 'attendance': 
    default: return AttendancePage
  }
})

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<template>
  <header class="bg-white px-4 py-4 flex items-center shadow-sm sticky top-0 z-10">
    <button 
      v-if="showBack"
      class="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
      @click="$router.back()"
    >
      <ChevronLeftIcon class="w-5 h-5 text-gray-500" />
    </button>
    <h1 class="text-lg font-medium text-gray-900 flex-1" :class="{ 'text-center': showBack }">
      {{ title }}
    </h1>
    <slot name="right"></slot>
  </header>
</template>

<script setup>
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'

defineProps({
  title: {
    type: String,
    required: true
  },
  showBack: {
    type: Boolean,
    default: false
  }
})
</script> 
<script setup>
import { ref } from 'vue'
import { ChartBarIcon, ClockIcon, ClipboardIcon, UserIcon } from '@heroicons/vue/24/outline'

const active = ref(0)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    
    <nav class="fixed bottom-0 w-full bg-white border-t border-gray-100 shadow-lg z-50">
      <div class="grid grid-cols-4 h-16">
        <router-link 
          to="/workout" 
          class="flex flex-col items-center justify-center transition-colors duration-200"
          :class="[$route.path === '/workout' ? 'text-primary' : 'text-gray-500']"
        >
          <ChartBarIcon 
            class="w-6 h-6 transition-transform duration-200" 
            :class="{ 'transform scale-110': $route.path === '/workout' }"
          />
          <span class="text-xs mt-1 font-medium">训练</span>
        </router-link>

        <router-link 
          to="/timer" 
          class="flex flex-col items-center justify-center transition-colors duration-200"
          :class="[$route.path === '/timer' ? 'text-primary' : 'text-gray-500']"
        >
          <ClockIcon 
            class="w-6 h-6 transition-transform duration-200"
            :class="{ 'transform scale-110': $route.path === '/timer' }"
          />
          <span class="text-xs mt-1 font-medium">计时</span>
        </router-link>

        <router-link 
          to="/time-record" 
          class="flex flex-col items-center justify-center transition-colors duration-200"
          :class="[$route.path === '/time-record' ? 'text-primary' : 'text-gray-500']"
        >
          <ClipboardIcon 
            class="w-6 h-6 transition-transform duration-200"
            :class="{ 'transform scale-110': $route.path === '/time-record' }"
          />
          <span class="text-xs mt-1 font-medium">打卡</span>
        </router-link>

        <router-link 
          to="/profile" 
          class="flex flex-col items-center justify-center transition-colors duration-200"
          :class="[$route.path === '/profile' ? 'text-primary' : 'text-gray-500']"
        >
          <UserIcon 
            class="w-6 h-6 transition-transform duration-200"
            :class="{ 'transform scale-110': $route.path === '/profile' }"
          />
          <span class="text-xs mt-1 font-medium">我的</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<style scoped>
/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 图标点击涟漪效果 */
@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 0.4;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.router-link-active::after {
  content: '';
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: currentColor;
  opacity: 0;
  transform-origin: center;
  animation: ripple 0.6s ease-out;
}

/* 激活状态下的图标微弹效果 */
.router-link-active svg {
  animation: bounce 0.3s cubic-bezier(0.36, 0, 0.66, -0.56) forwards;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
</style>

<script setup lang="ts">
import { useTheme } from 'vuetify';
import type { ThemeSwitcherTheme } from '@layouts/types';

const themes: ThemeSwitcherTheme[] = [
  {
    name: 'light',
    icon: 'ri-sun-line',
  },
  {
    name: 'dark',
    icon: 'ri-moon-clear-line',
  },
];

const { name: themeName, global: globalTheme } = useTheme();
const {
  state: currentThemeName,
  next: getNextThemeName,
  index: currentThemeIndex,
} = useCycleList(
  themes.map((t) => t.name),
  { initialValue: themeName },
);

const changeTheme = () => {
  globalTheme.name.value = getNextThemeName();
};

// Update icon if theme is changed from other sources
watch(
  () => globalTheme.name.value,
  (val) => {
    currentThemeName.value = val;
  },
);
</script>

<template>
  <VListItem @click="changeTheme">
    <template #prepend>
      <VIcon :icon="themes[currentThemeIndex].icon" class="me-2" size="22" />
    </template>
    <VListItemTitle>{{ currentThemeName === 'light' ? 'Light Theme' : 'Dark Theme' }}</VListItemTitle>
  </VListItem>
</template>

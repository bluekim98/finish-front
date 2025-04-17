<script setup lang="ts">
defineProps({
  src: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['file-changed', 'file-removed']);

const handleFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];

  if (!file) {
    return;
  }

  emit('file-changed', file);
  (event.target as HTMLInputElement).value = '';
};
</script>

<template>
  <VCol cols="12" md="8" class="d-flex align-center justify-center">
    <VImg v-if="src" :src="src" height="100">
      <IconBtn class="close-icon" style="width: 24px; height: 24px" @click="emit('file-removed')">
        <VIcon icon="ri-close-line" />
      </IconBtn>
    </VImg>
    <input :id="id" type="file" accept=".jpg, .jpeg, .png" class="d-none" @change="handleFileChange" />
    <VLabel v-if="!src" :for="id" class="file-upload-btn">파일 선택</VLabel>
  </VCol>
</template>

<style scoped>
.close-icon {
  position: absolute;
  right: 0;
  background-color: rgba(0, 0, 0, 0.2);
}

.file-upload-btn {
  border: 1px solid rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-primary));
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;

  padding-left: 14px;
  padding-right: 14px;
  padding-top: 8px;
  padding-bottom: 8px;
}

.file-upload-btn:hover {
  background-color: rgba(var(--v-theme-primary), 0.1);
}
</style>

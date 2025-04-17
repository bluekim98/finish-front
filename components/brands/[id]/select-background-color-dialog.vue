<script setup lang="ts">
const props = defineProps({
  bgColor: {
    type: String,
    default: undefined,
  },
  initialBgColor: {
    type: String,
    default: undefined,
  },
});

const emit = defineEmits(['update:bgColor']);

const dialog = ref(false);
const dialogPassed = ref(false);
const localBgColor = ref(props.bgColor);
const lastBgColor = ref(props.bgColor);

// 부모로부터 받은 값 변경되면 localBgColor 변경
watch(
  () => props.bgColor,
  (newValue) => {
    localBgColor.value = newValue;
  },
);

// localBgColor 변경되면 부모에게 알림
watch(localBgColor, (newValue) => {
  emit('update:bgColor', newValue);
});

const colorCodeRule = (value: any) => {
  const passedTest = /^#([0-9A-F]{6}([0-9A-F]{2})?)$/i.test(value);

  if (passedTest) {
    dialogPassed.value = true;
    return true;
  } else {
    dialogPassed.value = false;
    return '컬러코드가 올바르지 않습니다';
  }
};

const handleRemoveButtonClick = () => {
  localBgColor.value = '';
};

const handleCancelButtonClick = () => {
  localBgColor.value = lastBgColor.value;
  dialog.value = false;
};

const handleDialogOpen = () => {
  lastBgColor.value = localBgColor.value;
  dialog.value = true;
};
</script>

<template>
  <VCol cols="12" md="8" class="d-flex align-center justify-center dp__relative">
    <div v-if="localBgColor" class="d-flex align-center gap-2 justify-center">
      <div
        class="d-flex align-center gap-2 justify-center cursor-pointer"
        style="width: 120px; height: 38px"
        @click="handleDialogOpen"
      >
        <VSheet
          :color="localBgColor"
          width="20"
          height="20"
          rounded="sm"
          :style="localBgColor === '#FFFFFF' ? { border: '1px solid #000' } : {}"
        />
        {{ localBgColor }}
      </div>
      <IconBtn class="close-icon" style="width: 24px; height: 24px" @click="handleRemoveButtonClick">
        <VIcon icon="ri-close-line" />
      </IconBtn>
    </div>
    <VBtn v-else variant="outlined" @click="handleDialogOpen">선택</VBtn>

    <VDialog v-model="dialog" width="auto" @click:outside="handleCancelButtonClick">
      <VCard title="BG Color 선택">
        <v-color-picker v-model="localBgColor" elevation="0" />
        <div style="padding-top: 8px; padding-left: 32px; padding-right: 32px; padding-bottom: 8px">
          <VTextField v-model="localBgColor" :rules="[colorCodeRule]" />
        </div>
        <template v-slot:actions>
          <VBtn text="취소" color="secondary" @click="handleCancelButtonClick" />
          <VBtn text="확인" @click="dialog = false" :disabled="!dialogPassed" />
        </template>
      </VCard>
    </VDialog>
  </VCol>
</template>

<style scoped>
.close-icon {
  position: absolute;
  right: 0;
  background-color: rgba(0, 0, 0, 0.2);
}
</style>

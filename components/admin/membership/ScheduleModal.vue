<template #footer>
  <div class="flex justify-end gap-2">
    <VBtn
      color="secondary"
      variant="text"
      class="bg-secondary-50"
      @click="close"
    >
      취소
    </VBtn>
    <VBtn
      color="primary"
      variant="text"
      class="bg-primary-50"
      :loading="isLoading"
      @click="handleSubmit"
    >
      {{ isEdit ? '수정' : '등록' }}
    </VBtn>
  </div>
</template>

<style scoped>
/* 버튼 스타일 개선 */
.v-btn {
  font-weight: 500;
}

.v-btn--text {
  border: none !important;
}
</style>

<VDialog
  :model-value="isOpen"
  max-width="95vw"
  persistent
  @update:model-value="close"
>
  <VCard class="d-flex flex-column" style="max-height: 95vh;">
    <!-- 모달 헤더 -->
    <VCardTitle class="d-flex align-center pa-6 pb-4 bg-grey-50">
      <VIcon
        :icon="isEdit ? 'ri-edit-line' : 'ri-add-line'"
        class="mr-3"
      />
      {{ isEdit ? '일정 수정' : '일정 등록' }}
    </VCardTitle>

    <!-- 모달 내용 -->
    <VCardText class="pa-6 pt-4 flex-grow-1 overflow-y-auto">
      <div class="space-y-4">
        <!-- 일정 선택 -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">일정 선택</label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="schedule in availableSchedules"
              :key="schedule.id"
              class="relative"
            >
              <div
                class="p-4 border rounded-lg cursor-pointer transition-all duration-200"
                :class="[
                  selectedScheduleIds.includes(schedule.id)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                ]"
                @click="toggleSchedule(schedule.id)"
              >
                <div class="flex items-start justify-between">
                  <div class="space-y-1">
                    <h4 class="font-medium text-gray-900">{{ schedule.name }}</h4>
                    <p class="text-sm text-gray-500">
                      {{ formatDate(schedule.startDate) }} ~ {{ formatDate(schedule.endDate) }}
                    </p>
                    <p class="text-sm text-gray-500">
                      {{ schedule.startTime }} ~ {{ schedule.endTime }}
                    </p>
                  </div>
                  <div
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    :class="[
                      selectedScheduleIds.includes(schedule.id)
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300'
                    ]"
                  >
                    <VIcon
                      v-if="selectedScheduleIds.includes(schedule.id)"
                      name="i-heroicons-check"
                      class="w-3 h-3 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 수량 입력 -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">수량</label>
          <VTextField
            v-model="quantity"
            type="number"
            min="1"
            variant="outlined"
          />
        </div>

        <!-- 가격 입력 -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">가격</label>
          <VTextField
            v-model="price"
            type="number"
            min="0"
            variant="outlined"
          />
        </div>
      </div>
    </VCardText>

    <!-- 모달 액션 -->
    <VCardActions class="pa-6 pt-4 border-t bg-grey-50">
      <VSpacer />
      <VBtn
        @click="close"
        :disabled="isLoading"
        color="secondary"
        variant="text"
        class="bg-secondary-50"
      >
        취소
      </VBtn>
      <VBtn
        color="primary"
        :loading="isLoading"
        @click="handleSubmit"
        variant="text"
        class="bg-primary-25"
      >
        {{ isEdit ? '수정' : '등록' }}
      </VBtn>
    </VCardActions>
  </VCard>
</VDialog>

<style scoped>
.v-card {
  overflow: hidden;
}

/* 버튼 스타일 개선 */
.v-btn {
  font-weight: 500;
}

.v-btn--text {
  border: none !important;
}

/* 스크롤 스타일 */
.v-card-text {
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-border-color), var(--v-border-opacity)) transparent;
}

.v-card-text::-webkit-scrollbar {
  width: 6px;
}

.v-card-text::-webkit-scrollbar-track {
  background: transparent;
}

.v-card-text::-webkit-scrollbar-thumb {
  background-color: rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 3px;
}
</style> 
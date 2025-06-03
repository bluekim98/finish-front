<template>
  <VDialog
    :model-value="modal.show"
    max-width="600"
    persistent
    @update:model-value="handleClose"
  >
    <VCard>
      <!-- 모달 헤더 -->
      <VCardTitle class="d-flex align-center pa-6 pb-4">
        <VIcon
          :icon="isEditMode ? 'ri-edit-line' : 'ri-add-line'"
          class="mr-3"
        />
        {{ isEditMode ? '고유번호 수정' : '고유번호 추가' }}
      </VCardTitle>

      <!-- 모달 내용 -->
      <VCardText class="pa-6 pt-0">
        <VForm ref="formRef" @submit.prevent="handleSubmit">
          <VRow>
            <!-- 타이틀 (필수) -->
            <VCol cols="12">
              <VTextField
                v-model="form.title"
                label="타이틀*"
                variant="outlined"
                :rules="titleRules"
                required
                :error-messages="errors.title"
              />
            </VCol>

            <!-- 비고 (선택) -->
            <VCol cols="12">
              <VTextarea
                v-model="form.description"
                label="비고"
                variant="outlined"
                rows="3"
                :error-messages="errors.description"
                placeholder="고유번호에 대한 추가 설명을 입력하세요. (선택사항)"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <!-- 모달 액션 -->
      <VCardActions class="pa-6 pt-0">
        <VSpacer />
        <VBtn
          @click="handleClose"
          :disabled="loading"
          variant="outlined"
        >
          취소
        </VBtn>
        <VBtn
          color="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ isEditMode ? '수정' : '생성' }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import type { CreateUniqueCodeRequest, UpdateUniqueCodeRequest } from '~/types/membership'

// Composables
const { 
  uniqueCodeModal: modal,
  createUniqueCode,
  updateUniqueCode,
  closeUniqueCodeModal
} = useMembership()

const { $toast } = useNuxtApp()

// 폼 ref
const formRef = ref()

// 상태
const loading = ref(false)
const form = ref({
  title: '',
  description: ''
})

const errors = ref({
  title: [] as string[],
  description: [] as string[]
})

// 계산된 속성
const isEditMode = computed(() => modal.value.mode === 'edit')

// 검증 규칙
const titleRules = [
  (v: string) => !!v || '타이틀은 필수 입력 항목입니다.',
  (v: string) => (v && v.length >= 2) || '타이틀은 최소 2자 이상이어야 합니다.',
  (v: string) => (v && v.length <= 50) || '타이틀은 50자를 초과할 수 없습니다.'
]

// 메서드
const resetForm = () => {
  form.value = {
    title: '',
    description: ''
  }
  errors.value = {
    title: [],
    description: []
  }
  formRef.value?.resetValidation()
}

const loadFormData = () => {
  if (isEditMode.value && modal.value.item) {
    form.value = {
      title: modal.value.item.title,
      description: modal.value.item.description || ''
    }
  } else {
    resetForm()
  }
}

const validateForm = async (): Promise<boolean> => {
  const { valid } = await formRef.value.validate()
  return valid
}

const handleSubmit = async () => {
  if (!(await validateForm())) {
    return
  }

  try {
    loading.value = true
    errors.value = { title: [], description: [] }

    if (isEditMode.value && modal.value.item) {
      // 수정 모드
      const updateData: UpdateUniqueCodeRequest = {
        id: modal.value.item.id,
        title: form.value.title.trim(),
        description: form.value.description.trim() || undefined
      }
      
      await updateUniqueCode(updateData)
      $toast?.success('고유번호가 수정되었습니다.')
    } else {
      // 생성 모드
      const createData: CreateUniqueCodeRequest = {
        title: form.value.title.trim(),
        description: form.value.description.trim() || undefined
      }
      
      await createUniqueCode(createData)
      $toast?.success('고유번호가 생성되었습니다.')
    }

    handleClose()
  } catch (error) {
    console.error('저장 실패:', error)
    
    if (error instanceof Error) {
      $toast?.error(error.message)
      
      // 서버 검증 에러 처리 (향후 API 연동 시 사용)
      if (error.message.includes('title')) {
        errors.value.title = [error.message]
      }
    } else {
      $toast?.error('저장에 실패했습니다.')
    }
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  if (loading.value) return
  
  resetForm()
  closeUniqueCodeModal()
}

// 모달 열릴 때 폼 데이터 로드
watch(
  () => modal.value.show,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        loadFormData()
      })
    }
  },
  { immediate: true }
)
</script>

<style scoped>
/* 모달 전체 스타일 정리 */
.v-card {
  overflow: hidden;
}

.v-form {
  width: 100%;
}

/* 취소 버튼 스타일 개선 */
.v-btn--outlined {
  border-color: rgba(var(--v-border-color), var(--v-border-opacity));
}
</style> 
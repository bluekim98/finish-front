<template>
  <VDialog
    :model-value="modal.show"
    max-width="95vw"
    persistent
    @update:model-value="handleClose"
  >
    <VCard class="d-flex flex-column" style="max-height: 95vh;">
      <!-- 모달 헤더 -->
      <VCardTitle class="d-flex align-center pa-6 pb-4 bg-grey-50">
        <VIcon
          :icon="isEditMode ? 'ri-edit-line' : 'ri-add-line'"
          class="mr-3"
        />
        {{ isEditMode ? '티켓 수정' : '티켓 추가' }}
      </VCardTitle>

      <!-- 모달 내용 -->
      <VCardText class="pa-6 pt-4 flex-grow-1 overflow-y-auto">
        <VForm ref="formRef" @submit.prevent="handleSubmit">
          <VRow>
            <!-- 기본 정보 섹션 -->
            <VCol cols="12">
              <h4 class="text-h6 mb-4">기본 정보</h4>
            </VCol>

            <!-- 티켓 타입 (필수) -->
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.type"
                label="티켓 타입*"
                :items="ticketTypeOptions"
                variant="outlined"
                :rules="typeRules"
                required
                :error-messages="errors.type"
              />
            </VCol>

            <!-- 고유번호 (필수) -->
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.uniqueCodeId"
                label="고유번호*"
                :items="uniqueCodeOptions"
                variant="outlined"
                :rules="uniqueCodeRules"
                required
                :error-messages="errors.uniqueCodeId"
              />
            </VCol>

            <!-- 티켓명 (필수) -->
            <VCol cols="12">
              <VTextField
                v-model="form.title"
                label="티켓명*"
                variant="outlined"
                :rules="titleRules"
                required
                :error-messages="errors.title"
                placeholder="예: 프리미엄 스크린골프 10회권"
              />
            </VCol>

            <!-- 이용횟수 (횟수제인 경우에만) -->
            <template v-if="form.type === '횟수제'">
              <VCol cols="12">
                <h4 class="text-h6 mb-4">이용횟수 설정</h4>
              </VCol>
              
              <VCol cols="12" md="6">
                <VTextField
                  v-model.number="form.usageCount.total"
                  label="총 이용횟수*"
                  type="number"
                  variant="outlined"
                  :rules="usageCountRules"
                  :error-messages="errors.usageCount"
                  suffix="회"
                  min="1"
                />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField
                  v-model.number="form.usageCount.cancellable"
                  label="취소 가능 횟수"
                  type="number"
                  variant="outlined"
                  suffix="회"
                  min="0"
                  :max="form.usageCount.total || undefined"
                  placeholder="선택사항"
                />
              </VCol>
            </template>

            <!-- 유효기간 설정 -->
            <VCol cols="12">
              <h4 class="text-h6 mb-4">유효기간 설정</h4>
            </VCol>

            <VCol cols="12" md="6">
              <VSelect
                v-model="form.validityPeriod.type"
                label="유효기간 타입*"
                :items="validityPeriodOptions"
                variant="outlined"
                :rules="validityPeriodRules"
                required
                :error-messages="errors.validityPeriod"
              />
            </VCol>

            <VCol cols="12" md="6" v-if="form.validityPeriod.type === '기타'">
              <VTextField
                v-model.number="form.validityPeriod.days"
                label="사용자 지정 기간*"
                type="number"
                variant="outlined"
                suffix="일"
                min="1"
                :rules="customDaysRules"
              />
            </VCol>

            <!-- 가격 및 인원 -->
            <VCol cols="12">
              <h4 class="text-h6 mb-4">가격 및 인원 설정</h4>
            </VCol>

            <VCol cols="12" md="6">
              <VTextField
                v-model.number="form.price"
                label="판매 가격*"
                type="number"
                variant="outlined"
                :rules="priceRules"
                required
                :error-messages="errors.price"
                suffix="원"
                min="0"
              />
            </VCol>

            <VCol cols="12">
              <VTextField
                v-model.number="form.maxParticipantsNumber"
                label="최대 수강 인원*"
                type="number"
                variant="outlined"
                :rules="maxParticipantsRules"
                required
                :error-messages="errors.maxParticipants"
                suffix="명"
                min="1"
                density="compact"
                class="w-50 mb-2"
                :disabled="form.isUnlimitedParticipants"
              />
              <div class="d-flex align-center">
                <VSwitch
                  v-model="form.isUnlimitedParticipants"
                  color="primary"
                  hide-details
                  class="mr-2"
                />
                <span class="text-body-1">최대 수강 인원 무제한</span>
              </div>
            </VCol>

            <!-- 이용 제한 설정 -->
            <VCol cols="12">
              <h4 class="text-h6 mb-4">이용 제한 설정</h4>
            </VCol>

            <!-- 주간 제한 -->
            <VCol cols="12">
              <VRow>
                <VCol cols="12" md="6">
                  <VSelect
                    v-model="form.usageLimit.weekly.type"
                    label="주간 이용 제한*"
                    :items="weeklyLimitOptions"
                    variant="outlined"
                    required
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField
                    v-model.number="form.usageLimit.weekly.value"
                    label="주간 제한 횟수*"
                    type="number"
                    variant="outlined"
                    suffix="회"
                    min="1"
                    :disabled="form.usageLimit.weekly.type !== '직접입력'"
                  />
                </VCol>
              </VRow>
            </VCol>

            <!-- 월간 제한 -->
            <VCol cols="12">
              <VRow>
                <VCol cols="12" md="6">
                  <VSelect
                    v-model="form.usageLimit.monthly.type"
                    label="월간 이용 제한*"
                    :items="monthlyLimitOptions"
                    variant="outlined"
                    required
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField
                    v-model.number="form.usageLimit.monthly.value"
                    label="월간 제한 횟수*"
                    type="number"
                    variant="outlined"
                    suffix="회"
                    min="1"
                    :disabled="form.usageLimit.monthly.type !== '직접입력'"
                  />
                </VCol>
              </VRow>
            </VCol>

            <!-- 예약 시간 설정 -->
            <VCol cols="12">
              <h4 class="text-h6 mb-4">예약 시간 설정</h4>
            </VCol>

            <VCol cols="12" md="4">
              <VSelect
                v-model="form.reservationTime.type"
                label="예약 시간 타입*"
                :items="reservationTimeOptions"
                variant="outlined"
                required
              />
            </VCol>

            <VCol cols="12" md="4" v-if="form.reservationTime.type === '시간대지정'">
              <VTextField
                v-model="form.reservationTime.startTime"
                label="시작 시간*"
                type="time"
                variant="outlined"
                :rules="startTimeRules"
              />
            </VCol>

            <VCol cols="12" md="4" v-if="form.reservationTime.type === '시간대지정'">
              <VTextField
                v-model="form.reservationTime.endTime"
                label="종료 시간*"
                type="time"
                variant="outlined"
                :rules="endTimeRules"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <!-- 모달 액션 -->
      <VCardActions class="pa-6 pt-4 border-t bg-grey-50">
        <VSpacer />
        <VBtn
          @click="handleClose"
          :disabled="loading"
          color="secondary"
          variant="text"
          class="bg-secondary-50"
        >
          취소
        </VBtn>
        <VBtn
          color="primary"
          :loading="loading"
          @click="handleSubmit"
          variant="text"
          class="bg-primary-25"
        >
          {{ isEditMode ? '수정' : '생성' }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import type { CreateTicketRequest, UpdateTicketRequest, TicketType, ValidityPeriod } from '~/types/membership'

// Composables
const { 
  ticketModal: modal,
  uniqueCodes,
  createTicket,
  updateTicket,
  closeTicketModal
} = useMembership()

const { $toast } = useNuxtApp()

// 폼 ref
const formRef = ref()

// 상태
const loading = ref(false)

// 기본 폼 데이터
const getDefaultForm = () => ({
  type: '' as TicketType,
  title: '',
  usageCount: {
    total: undefined as number | undefined,
    cancellable: undefined as number | undefined
  },
  validityPeriod: {
    type: '1개월' as ValidityPeriod['type'],
    days: 30
  },
  isUnlimitedParticipants: false,
  maxParticipantsNumber: undefined as number | undefined,
  price: undefined as number | undefined,
  usageLimit: {
    weekly: {
      type: '제한없음' as any,
      value: undefined as number | undefined
    },
    monthly: {
      type: '제한없음' as any,
      value: undefined as number | undefined
    }
  },
  reservationTime: {
    type: '하루종일' as any,
    startTime: undefined as string | undefined,
    endTime: undefined as string | undefined
  },
  uniqueCodeId: undefined as number | undefined
})

const form = ref(getDefaultForm())

const errors = ref({
  type: [] as string[],
  title: [] as string[],
  usageCount: [] as string[],
  validityPeriod: [] as string[],
  price: [] as string[],
  maxParticipants: [] as string[],
  uniqueCodeId: [] as string[]
})

// 계산된 속성
const isEditMode = computed(() => modal.value.mode === 'edit')

// 옵션들
const ticketTypeOptions = [
  { title: '횟수제', value: '횟수제' },
  { title: '기간제', value: '기간제' }
]

const uniqueCodeOptions = computed(() => 
  uniqueCodes.value.map(code => ({
    title: code.title,
    value: code.id
  }))
)

const validityPeriodOptions = [
  { title: '1개월', value: '1개월' },
  { title: '2개월', value: '2개월' },
  { title: '3개월', value: '3개월' },
  { title: '6개월', value: '6개월' },
  { title: '1년', value: '1년' },
  { title: '기타', value: '기타' }
]

const weeklyLimitOptions = [
  { title: '제한없음', value: '제한없음' },
  { title: '1회', value: '1회' },
  { title: '2회', value: '2회' },
  { title: '3회', value: '3회' },
  { title: '4회', value: '4회' },
  { title: '직접입력', value: '직접입력' }
]

const monthlyLimitOptions = [
  { title: '제한없음', value: '제한없음' },
  { title: '5회', value: '5회' },
  { title: '10회', value: '10회' },
  { title: '15회', value: '15회' },
  { title: '20회', value: '20회' },
  { title: '직접입력', value: '직접입력' }
]

const reservationTimeOptions = [
  { title: '하루종일', value: '하루종일' },
  { title: '시간대지정', value: '시간대지정' }
]

// 검증 규칙
const typeRules = [
  (v: string) => !!v || '티켓 타입은 필수입니다.'
]

const titleRules = [
  (v: string) => !!v || '티켓명은 필수입니다.',
  (v: string) => (v && v.length >= 2) || '티켓명은 최소 2자 이상이어야 합니다.',
  (v: string) => (v && v.length <= 100) || '티켓명은 100자를 초과할 수 없습니다.'
]

const uniqueCodeRules = [
  (v: number) => !!v || '고유번호는 필수입니다.'
]

const usageCountRules = [
  (v: number) => v > 0 || '이용횟수는 1 이상이어야 합니다.'
]

const validityPeriodRules = [
  (v: string) => !!v || '유효기간은 필수입니다.'
]

const customDaysRules = [
  (v: number) => v > 0 || '기간은 1일 이상이어야 합니다.'
]

const priceRules = [
  (v: number) => v >= 0 || '가격은 0 이상이어야 합니다.'
]

const maxParticipantsRules = [
  (v: number) => !!v || '최대 인원은 필수입니다.',
  (v: number) => v > 0 || '최대 인원은 1명 이상이어야 합니다.'
]

const startTimeRules = [
  (v: string) => !!v || '시작 시간은 필수입니다.'
]

const endTimeRules = [
  (v: string) => !!v || '종료 시간은 필수입니다.',
  (v: string) => {
    if (form.value.reservationTime.startTime && v) {
      return v > form.value.reservationTime.startTime || '종료 시간은 시작 시간보다 늦어야 합니다.'
    }
    return true
  }
]

// 메서드
const resetForm = () => {
  form.value = getDefaultForm()
  errors.value = {
    type: [],
    title: [],
    usageCount: [],
    validityPeriod: [],
    price: [],
    maxParticipants: [],
    uniqueCodeId: []
  }
  formRef.value?.resetValidation()
}

const loadFormData = () => {
  if (isEditMode.value && modal.value.item) {
    const item = modal.value.item
    form.value = {
      type: item.type,
      title: item.title,
      usageCount: {
        total: item.usageCount?.total,
        cancellable: item.usageCount?.cancellable
      },
      validityPeriod: { ...item.validityPeriod },
      isUnlimitedParticipants: item.maxParticipants === 'unlimited',
      maxParticipantsNumber: item.maxParticipants === 'unlimited' ? undefined : item.maxParticipants as number,
      price: item.price,
      usageLimit: { ...item.usageLimit },
      reservationTime: { ...item.reservationTime },
      uniqueCodeId: item.uniqueCodeId
    }
  } else {
    resetForm()
  }
}

const validateForm = async (): Promise<boolean> => {
  const { valid } = await formRef.value.validate()
  return valid
}

const prepareFormData = () => {
  const maxParticipants = form.value.isUnlimitedParticipants 
    ? 'unlimited' as const
    : form.value.maxParticipantsNumber!

  const validityPeriod: ValidityPeriod = {
    type: form.value.validityPeriod.type,
    days: form.value.validityPeriod.type === '기타' 
      ? form.value.validityPeriod.days 
      : getDefaultDaysForPeriod(form.value.validityPeriod.type)
  }

  const baseData = {
    type: form.value.type,
    title: form.value.title.trim(),
    validityPeriod,
    maxParticipants,
    price: form.value.price!,
    usageLimit: {
      weekly: {
        type: form.value.usageLimit.weekly.type,
        value: form.value.usageLimit.weekly.type === '직접입력' ? form.value.usageLimit.weekly.value : undefined
      },
      monthly: {
        type: form.value.usageLimit.monthly.type,
        value: form.value.usageLimit.monthly.type === '직접입력' ? form.value.usageLimit.monthly.value : undefined
      }
    },
    reservationTime: {
      type: form.value.reservationTime.type,
      startTime: form.value.reservationTime.type === '시간대지정' ? form.value.reservationTime.startTime : undefined,
      endTime: form.value.reservationTime.type === '시간대지정' ? form.value.reservationTime.endTime : undefined
    },
    uniqueCodeId: form.value.uniqueCodeId!
  }

  if (form.value.type === '횟수제') {
    return {
      ...baseData,
      usageCount: {
        total: form.value.usageCount.total,
        cancellable: form.value.usageCount.cancellable
      }
    }
  }

  return baseData
}

const getDefaultDaysForPeriod = (type: ValidityPeriod['type']): number => {
  const mapping = {
    '1개월': 30,
    '2개월': 60,
    '3개월': 90,
    '6개월': 180,
    '1년': 365,
    '기타': 30
  }
  return mapping[type]
}

const handleSubmit = async () => {
  if (!(await validateForm())) {
    return
  }

  try {
    loading.value = true
    errors.value = {
      type: [],
      title: [],
      usageCount: [],
      validityPeriod: [],
      price: [],
      maxParticipants: [],
      uniqueCodeId: []
    }

    const formData = prepareFormData()

    if (isEditMode.value && modal.value.item) {
      // 수정 모드
      const updateData: UpdateTicketRequest = {
        id: modal.value.item.id,
        ...formData
      } as UpdateTicketRequest
      
      await updateTicket(updateData)
      $toast?.success('티켓이 수정되었습니다.')
    } else {
      // 생성 모드
      const createData = formData as CreateTicketRequest
      await createTicket(createData)
      $toast?.success('티켓이 생성되었습니다.')
    }

    handleClose()
  } catch (error) {
    console.error('저장 실패:', error)
    
    if (error instanceof Error) {
      $toast?.error(error.message)
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
  closeTicketModal()
}

// 유효기간 타입 변경 시 days 업데이트
watch(() => form.value.validityPeriod.type, (newType) => {
  if (newType !== '기타') {
    form.value.validityPeriod.days = getDefaultDaysForPeriod(newType)
  }
})

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
.v-card {
  overflow: hidden;
}

.v-form {
  width: 100%;
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
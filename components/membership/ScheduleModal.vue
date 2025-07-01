<template>
  <VDialog
    :model-value="show"
    @update:model-value="$emit('update:show', $event)"
    max-width="800"
    persistent
  >
    <VCard class="d-flex flex-column" style="max-height:95vh">
      <!-- 모달 헤더 -->
      <VCardTitle class="d-flex align-center pa-6 pb-4 bg-grey-50">
        <VIcon
          :icon="isEdit ? 'ri-edit-line' : 'ri-add-line'"
          class="mr-3"
        />
        {{ isEdit ? '일정 수정' : '새 일정 추가' }}
      </VCardTitle>

      <!-- 모달 내용 -->
      <VCardText class="pa-6 pt-4 flex-grow-1 overflow-y-auto">
        <VForm ref="formRef" @submit.prevent="handleSubmit">
          <!-- 기본 정보 -->
          <h4 class="text-h6 mb-4">기본 정보</h4>
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="form.title"
                label="일정명*"
                variant="outlined"
                :rules="[v => !!v || '일정명은 필수입니다']"
              />
            </VCol>

            <VCol cols="12" md="6">
              <VTextField
                v-model="form.instructor"
                label="담당 강사"
                variant="outlined"
                clearable
              />
            </VCol>

            <VCol cols="12">
              <VTextarea
                v-model="form.description"
                label="일정 설명*"
                variant="outlined"
                rows="3"
                :rules="[v => !!v || '일정 설명은 필수입니다']"
              />
            </VCol>
          </VRow>

          <!-- 기간 & 요일 -->
          <h4 class="text-h6 mb-4 mt-6">기간</h4>
          <VRow>
            <VCol cols="12" md="6">
              <vue-date-picker
                v-model="form.dateRange"
                range
                :enable-time-picker="false"
                locale="ko"
              >
                <template #trigger>
                  <VTextField
                    :model-value="displayDateRange"
                    label="기간*"
                    variant="outlined"
                    readonly
                    :rules="[v => !!v || '기간은 필수입니다']"
                  >
                    <template #append-inner>
                      <VIcon icon="ri-calendar-line" />
                    </template>
                  </VTextField>
                </template>
              </vue-date-picker>
            </VCol>
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.weekdays"
                :items="weekdayOptions"
                label="요일(선택)"
                multiple
                chips
                variant="outlined"
              />
            </VCol>
          </VRow>

          <!-- 시간 -->
          <h4 class="text-h6 mb-4 mt-6">시간</h4>
          <VRow>
            <VCol cols="12" md="4">
              <VSelect
                v-model="form.timeType"
                :items="timeTypeOptions"
                label="시간 설정"
                variant="outlined"
              />
            </VCol>
            <VCol v-if="form.timeType === 'custom'" cols="12" md="4">
              <VTextField
                v-model="form.startTime"
                type="time"
                label="시작 시간*"
                variant="outlined"
                :rules="timeRules"
              />
            </VCol>
            <VCol v-if="form.timeType === 'custom'" cols="12" md="4">
              <VTextField
                v-model="form.endTime"
                type="time"
                label="종료 시간*"
                variant="outlined"
                :rules="timeRules"
              />
            </VCol>
          </VRow>

          <!-- 인원 & 장소 -->
          <h4 class="text-h6 mb-4 mt-6">인원 및 장소</h4>
          <VRow>
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.maxParticipantsType"
                :items="maxParticipantsTypeOptions"
                label="최대 인원*"
                variant="outlined"
              />
            </VCol>
            <VCol v-if="form.maxParticipantsType === 'custom'" cols="12" md="6">
              <VTextField
                v-model.number="form.maxParticipants"
                type="number"
                label="인원 수*"
                variant="outlined"
                suffix="명"
                :rules="participantRules"
              />
            </VCol>
            <VCol cols="12" class="mt-4">
              <VTextField
                v-model="form.location"
                label="장소"
                variant="outlined"
                clearable
              />
            </VCol>
          </VRow>

          <!-- 예약/취소 마감 -->
          <h4 class="text-h6 mb-4 mt-6">예약 / 취소 마감</h4>
          <VRow>
            <VCol cols="12" md="6">
              <VSwitch v-model="form.hasReservationDeadline" label="예약 마감 사용" hide-details />
              <VTextField
                v-if="form.hasReservationDeadline"
                v-model.number="form.reservationDeadlineHours"
                type="number"
                label="예약 마감 (시간 전)"
                variant="outlined"
                :rules="deadlineRules(form.hasReservationDeadline)"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VSwitch v-model="form.hasCancellationDeadline" label="취소 마감 사용" hide-details />
              <VTextField
                v-if="form.hasCancellationDeadline"
                v-model.number="form.cancellationDeadlineHours"
                type="number"
                label="취소 마감 (시간 전)"
                variant="outlined"
                :rules="deadlineRules(form.hasCancellationDeadline)"
              />
            </VCol>
          </VRow>

          <!-- 고유번호 연결 -->
          <h4 class="text-h6 mb-4 mt-6">연결 고유번호</h4>
          <VSelect
            v-model="form.uniqueCodeIds"
            :items="uniqueCodeOptions"
            label="고유번호*"
            multiple
            chips
            closable-chips
            variant="outlined"
            :rules="[v => (v as number[]).length > 0 || '최소 1개 이상 선택']"
          />
        </VForm>
      </VCardText>

      <!-- 모달 액션 -->
      <VCardActions class="pa-6 pt-4 border-t bg-grey-50">
        <VSpacer />
        <VBtn
          variant="text"
          color="secondary"
          @click="$emit('update:show', false)"
        >
          취소
        </VBtn>
        <VBtn
          color="primary"
          @click="handleSubmit"
          :loading="isSubmitting"
          variant="text"
        >
          {{ isEdit ? '수정' : '추가' }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import type { Schedule } from '~/types/membership'
import dayjs from 'dayjs'

// Props
interface Props {
  show: boolean
  editData?: Schedule
}

const props = withDefaults(defineProps<Props>(), {
  show: false
})

// Emits
const emit = defineEmits<{
  'update:show': [boolean]
  submit: [Partial<Schedule>]
}>()

// Composables
const { uniqueCodes } = useMembership()

// Refs
const formRef = ref()
const isSubmitting = ref(false)

// 계산된 속성
const isEdit = computed(() => !!props.editData)

const uniqueCodeOptions = computed(() => {
  return uniqueCodes.value.map(code => ({
    title: code.title,
    value: code.id
  }))
})

const displayDateRange = computed(() => {
  if (!props.editData?.period) return ''
  return `${dayjs(props.editData.period.startDate).format('YYYY.MM.DD')} ~ ${dayjs(props.editData.period.endDate).format('YYYY.MM.DD')}`
})

// 폼 상태
const form = ref({
  title: '',
  instructor: '',
  description: '',
  maxParticipantsType: 'unlimited' as 'unlimited' | 'custom',
  maxParticipants: null as number | null,
  location: '',
  dateRange: null as [Date, Date] | null,
  timeType: 'allday' as 'allday' | 'custom',
  startTime: '',
  endTime: '',
  uniqueCodeIds: [] as number[],
  hasReservationDeadline: false,
  reservationDeadlineHours: null as number | null,
  hasCancellationDeadline: false,
  cancellationDeadlineHours: null as number | null,
  weekdays: [] as string[]
})

// 유효성 검사 규칙
const timeRules = [
  (v: string) => form.value.timeType === 'allday' || !!v || '시간을 입력하세요'
]

const participantRules = [
  (v: number) => form.value.maxParticipantsType === 'unlimited' || !!v || '인원 수 입력',
  (v: number) => form.value.maxParticipantsType === 'unlimited' || v > 0 || '1명 이상'
]

const deadlineRules = (enabled: boolean) => [
  (v: number) => !enabled || !!v || '필수 입력',
  (v: number) => !enabled || v > 0 || '1이상'
]

// 옵션 상수들 (템플릿에서 사용)
const weekdayOptions = ['월', '화', '수', '목', '금', '토', '일']
const timeTypeOptions = [
  { title: '하루종일', value: 'allday' },
  { title: '시간 지정', value: 'custom' }
]
const maxParticipantsTypeOptions = [
  { title: '무제한', value: 'unlimited' },
  { title: '직접 입력', value: 'custom' }
]

// Methods
const resetForm = () => {
  form.value = {
    title: '',
    instructor: '',
    description: '',
    maxParticipantsType: 'unlimited',
    maxParticipants: null,
    location: '',
    dateRange: null,
    timeType: 'allday',
    startTime: '',
    endTime: '',
    uniqueCodeIds: [],
    hasReservationDeadline: false,
    reservationDeadlineHours: null,
    hasCancellationDeadline: false,
    cancellationDeadlineHours: null,
    weekdays: []
  }
}

const initFormFromEditData = () => {
  if (!props.editData) return
  const { 
    title, 
    instructor, 
    description, 
    maxParticipants,
    location,
    period,
    time,
    reservationCancelPolicy,
    uniqueCodeIds,
    ...rest 
  } = props.editData
  
  form.value = {
    ...rest,
    title,
    instructor: instructor ?? '',
    description,
    maxParticipantsType: maxParticipants === 'unlimited' ? 'unlimited' : 'custom',
    maxParticipants: maxParticipants === 'unlimited' ? null : Number(maxParticipants),
    location: location ?? '',
    dateRange: [new Date(period.startDate), new Date(period.endDate)],
    timeType: time ? 'custom' : 'allday',
    startTime: time?.startTime ?? '',
    endTime: time?.endTime ?? '',
    uniqueCodeIds: [...uniqueCodeIds],
    hasReservationDeadline: !!reservationCancelPolicy?.absolute?.hours,
    reservationDeadlineHours: reservationCancelPolicy?.absolute?.hours ?? null,
    hasCancellationDeadline: false,
    cancellationDeadlineHours: null,
    weekdays: period.weekdays ?? []
  }
}

const handleSubmit = async () => {
  const { valid } = await formRef.value?.validate()
  if (!valid) return

  isSubmitting.value = true
  try {
    const payload: Partial<Schedule> = {
      title: form.value.title.trim(),
      instructor: form.value.instructor.trim() || undefined,
      description: form.value.description.trim(),
      maxParticipants: form.value.maxParticipantsType === 'unlimited' ? 'unlimited' : (form.value.maxParticipants ?? 0),
      location: form.value.location || undefined,
      period: {
        startDate: form.value.dateRange![0].toISOString().substring(0,10),
        endDate: form.value.dateRange![1].toISOString().substring(0,10),
        weekdays: form.value.weekdays.length ? form.value.weekdays : undefined
      },
      time: form.value.timeType === 'custom' ? { startTime: form.value.startTime, endTime: form.value.endTime } : undefined,
      reservationCancelPolicy: form.value.hasReservationDeadline ? { enabled: true, absolute: { hours: form.value.reservationDeadlineHours! } } : undefined,
      uniqueCodeIds: [...form.value.uniqueCodeIds]
    }

    emit('submit', payload)
    emit('update:show', false)
    resetForm()
  } finally {
    isSubmitting.value = false
  }
}

// Watchers
watch(() => props.show, (show) => {
  if (show && props.editData) {
    initFormFromEditData()
  } else if (!show) {
    resetForm()
  }
})

// 초기화
onMounted(() => {
  if (props.editData) {
    initFormFromEditData()
  }
})
</script>

<style scoped>
.v-card {
  overflow: hidden;
}
.v-card-text {
  scrollbar-width: thin;
}
</style> 
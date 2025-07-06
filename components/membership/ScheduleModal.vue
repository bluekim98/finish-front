<template>
  <VDialog
    :model-value="show"
    max-width="95vw"
    persistent
    @update:model-value="$emit('update:show', $event)"
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

          <!-- 시간 (요일별 슬롯) -->
          <h4 class="text-h6 mb-4 mt-6">시간</h4>
          <VRow>
            <VCol cols="12" v-for="day in weekdayOptions" :key="day">
              <VCard variant="outlined" class="mb-2">
                <VCardText class="pb-4">
                  <div class="d-flex align-center mb-2">
                    <strong class="mr-3" style="width:40px">{{ day }}</strong>
                    <VBtn icon size="small" variant="text" @click="addTimeSlot(day as Weekday)">
                      <VIcon icon="ri-add-line" />
                    </VBtn>
                  </div>

                  <div v-if="form.timeSlots[day as Weekday] && form.timeSlots[day as Weekday]!.length">
                    <div
                      v-for="(slot, idx) in form.timeSlots[day as Weekday]"
                      :key="idx"
                      class="d-flex align-center mb-2"
                    >
                      <VTextField
                        v-model="slot.start"
                        type="time"
                        label="시작"
                        density="compact"
                        variant="outlined"
                        class="mr-2"
                        style="max-width:120px"
                      />
                      <span class="mx-1">~</span>
                      <VTextField
                        v-model="slot.end"
                        type="time"
                        label="종료"
                        density="compact"
                        variant="outlined"
                        class="ml-2 mr-2"
                        style="max-width:120px"
                      />
                      <VBtn icon size="small" variant="text" color="secondary" @click="removeTimeSlot(day as Weekday, idx)">
                        <VIcon icon="ri-close-line" />
                      </VBtn>
                    </div>
                  </div>
                  <div v-else class="text-grey text-caption ml-2">하루종일</div>
                </VCardText>
              </VCard>
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

          <!-- 예약 / 취소 설정 -->
          <h4 class="text-h6 mb-4 mt-6">예약 / 취소 설정</h4>
          <VRow>
            <!-- 예약 정책 -->
            <VCol cols="12" md="6">
              <VCard variant="outlined">
                <VCardText>
                  <div class="d-flex align-center mb-3">
                    <strong class="mr-2">예약 설정</strong>
                    <VSwitch v-model="form.hasReservationDeadline" inset hide-details />
                  </div>
                  <div v-if="form.hasReservationDeadline">
                    <h6 class="text-body-2 mb-2">시작</h6>
                    <VRow class="mb-3" dense>
                      <VCol cols="4">
                        <VTextField v-model.number="form.reservationPolicy.open.value" type="number" label="값" density="compact" variant="outlined" />
                      </VCol>
                      <VCol cols="4">
                        <VSelect v-model="form.reservationPolicy.open.unit" :items="unitOptions" label="단위" density="compact" variant="outlined" />
                      </VCol>
                      <VCol cols="4">
                        <VSelect v-model="form.reservationPolicy.open.from" :items="baseOptions" label="기준" density="compact" variant="outlined" />
                      </VCol>
                    </VRow>
                    <h6 class="text-body-2 mb-2">마감</h6>
                    <VRow dense>
                      <VCol cols="4">
                        <VTextField v-model.number="form.reservationPolicy.close.value" type="number" label="값" density="compact" variant="outlined" />
                      </VCol>
                      <VCol cols="4">
                        <VSelect v-model="form.reservationPolicy.close.unit" :items="unitOptions" label="단위" density="compact" variant="outlined" />
                      </VCol>
                      <VCol cols="4">
                        <VSelect v-model="form.reservationPolicy.close.from" :items="baseOptions" label="기준" density="compact" variant="outlined" />
                      </VCol>
                    </VRow>
                  </div>
                </VCardText>
              </VCard>
            </VCol>

            <!-- 취소 정책 -->
            <VCol cols="12" md="6">
              <VCard variant="outlined">
                <VCardText>
                  <div class="d-flex align-center mb-3">
                    <strong class="mr-2">취소 설정</strong>
                    <VSwitch v-model="form.hasCancellationDeadline" inset hide-details />
                  </div>
                  <div v-if="form.hasCancellationDeadline">
                    <h6 class="text-body-2 mb-2">시작</h6>
                    <VRow class="mb-3" dense>
                      <VCol cols="4">
                        <VTextField v-model.number="form.cancellationPolicy.open.value" type="number" label="값" density="compact" variant="outlined" />
                      </VCol>
                      <VCol cols="4">
                        <VSelect v-model="form.cancellationPolicy.open.unit" :items="unitOptions" label="단위" density="compact" variant="outlined" />
                      </VCol>
                      <VCol cols="4">
                        <VSelect v-model="form.cancellationPolicy.open.from" :items="baseOptions" label="기준" density="compact" variant="outlined" />
                      </VCol>
                    </VRow>
                    <h6 class="text-body-2 mb-2">마감</h6>
                    <VRow dense>
                      <VCol cols="4">
                        <VTextField v-model.number="form.cancellationPolicy.close.value" type="number" label="값" density="compact" variant="outlined" />
                      </VCol>
                      <VCol cols="4">
                        <VSelect v-model="form.cancellationPolicy.close.unit" :items="unitOptions" label="단위" density="compact" variant="outlined" />
                      </VCol>
                      <VCol cols="4">
                        <VSelect v-model="form.cancellationPolicy.close.from" :items="baseOptions" label="기준" density="compact" variant="outlined" />
                      </VCol>
                    </VRow>
                  </div>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>

          <!-- 예약대기 설정 -->
          <h4 class="text-h6 mb-4 mt-6">예약대기 설정</h4>
          <VRow>
            <VCol cols="12" md="6">
              <VSwitch v-model="form.waitlistPolicy.enabled" label="예약대기 사용" />
            </VCol>
            <VCol v-if="form.waitlistPolicy.enabled" cols="12" md="6">
              <VTextField
                v-model.number="form.waitlistPolicy.autoReserveBefore.value"
                type="number"
                label="자동 예약 (분 전)"
                suffix="분"
                variant="outlined"
                :rules="waitlistRules(form.waitlistPolicy.enabled)"
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
import type { Schedule, Weekday, TimeSlot, ReservationPolicy, CancellationPolicy } from '~/types/membership'
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
  if (!form.value.dateRange) return ''
  return `${dayjs(form.value.dateRange[0]).format('YYYY.MM.DD')} ~ ${dayjs(form.value.dateRange[1]).format('YYYY.MM.DD')}`
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
  timeSlots: {} as Partial<Record<Weekday, TimeSlot[]>>,
  uniqueCodeIds: [] as number[],
  reservationPolicy: {
    open: { value: 0, unit: 'hours', from: 'classTime' },
    close: { value: 0, unit: 'hours', from: 'classTime' }
  } as ReservationPolicy,
  cancellationPolicy: {
    open: { value: 0, unit: 'hours', from: 'classTime' },
    close: { value: 0, unit: 'hours', from: 'classTime' }
  } as CancellationPolicy,
  waitlistPolicy: {
    enabled: false,
    autoReserveBefore: { value: 0, unit: 'minutes' as const }
  },
  hasReservationDeadline: false,
  hasCancellationDeadline: false,
  weekdays: [] as string[]
})

// 유효성 검사 규칙
const hasAtLeastOneTimeSlot = () => Object.values(form.value.timeSlots).some(a => a && a.length)

const participantRules = [
  (v: number) => form.value.maxParticipantsType === 'unlimited' || !!v || '인원 수 입력',
  (v: number) => form.value.maxParticipantsType === 'unlimited' || v > 0 || '1명 이상'
]

// 옵션 상수들 (템플릿에서 사용)
const weekdayOptions = ['월', '화', '수', '목', '금', '토', '일']
const maxParticipantsTypeOptions = [
  { title: '무제한', value: 'unlimited' },
  { title: '직접 입력', value: 'custom' }
]

// 정책 입력용 옵션
const unitOptions = [
  { title: '분', value: 'minutes' },
  { title: '시간', value: 'hours' },
  { title: '일', value: 'days' }
]

const baseOptions = [
  { title: '수업시간', value: 'classTime' },
  { title: '수업일', value: 'classDate' }
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
    timeSlots: {},
    uniqueCodeIds: [],
    reservationPolicy: {
      open: { value: 0, unit: 'hours', from: 'classTime' },
      close: { value: 0, unit: 'hours', from: 'classTime' }
    } as ReservationPolicy,
    cancellationPolicy: {
      open: { value: 0, unit: 'hours', from: 'classTime' },
      close: { value: 0, unit: 'hours', from: 'classTime' }
    } as CancellationPolicy,
    waitlistPolicy: {
      enabled: false,
      autoReserveBefore: { value: 0, unit: 'minutes' }
    },
    hasReservationDeadline: false,
    hasCancellationDeadline: false,
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
    timeSlots,
    reservationPolicy,
    cancellationPolicy,
    waitlistPolicy,
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
    timeSlots: timeSlots ?? {},
    uniqueCodeIds: [...uniqueCodeIds],
    reservationPolicy: reservationPolicy ?? ({
      open: { value: 0, unit: 'hours', from: 'classTime' },
      close: { value: 0, unit: 'hours', from: 'classTime' }
    } as ReservationPolicy),
    cancellationPolicy: cancellationPolicy ?? ({
      open: { value: 0, unit: 'hours', from: 'classTime' },
      close: { value: 0, unit: 'hours', from: 'classTime' }
    } as CancellationPolicy),
    waitlistPolicy: waitlistPolicy ?? {
      enabled: false,
      autoReserveBefore: { value: 0, unit: 'minutes' }
    },
    hasReservationDeadline: false,
    hasCancellationDeadline: false,
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
      timeSlots: Object.keys(form.value.timeSlots).length ? form.value.timeSlots : undefined,
      reservationPolicy: form.value.hasReservationDeadline ? form.value.reservationPolicy : undefined,
      cancellationPolicy: form.value.hasCancellationDeadline ? form.value.cancellationPolicy : undefined,
      waitlistPolicy: form.value.waitlistPolicy.enabled ? form.value.waitlistPolicy : undefined,
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

// -----------------
// 시간 슬롯 조작 helpers
// -----------------
const addTimeSlot = (day: Weekday) => {
  if (!form.value.timeSlots[day]) {
    form.value.timeSlots[day] = []
  }
  form.value.timeSlots[day]!.push({ start: '', end: '' })
}

const removeTimeSlot = (day: Weekday, idx: number) => {
  const arr = form.value.timeSlots[day]
  if (arr) arr.splice(idx, 1)
}

const waitlistRules = (enabled: boolean) => {
  return [
    (v: number) => !enabled || !!v || '필수 입력',
    (v: number) => !enabled || v > 0 || '1 이상'
  ]
}
</script>

<style scoped>
.v-card {
  overflow: hidden;
}
.v-card-text {
  scrollbar-width: thin;
}
</style> 
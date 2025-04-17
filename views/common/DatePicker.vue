<template>
  <Datepicker
    v-model="selectedDate"
    locale="ko-KR"
    text-input
    auto-apply
    week-start="0"
    calendar-size="large"
    :teleport="true"
    :format="format"
    :enable-time-picker="enableTimePicker"
    :enable-minutes="enableMinutes"
    :min-date="minDate"
    :disabled="disabled"
  />
</template>

<script setup>
import { ref } from 'vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import dayjs from 'dayjs';

const props = defineProps({
  defaultDate: {
    type: Date,
    default: null,
  },
  enableTimePicker: {
    type: Boolean,
    default: false,
  },
  enableMinutes: {
    type: Boolean,
    default: true,
  },
  format: {
    type: String,
    default: 'yyyy-MM-dd',
  },
  minDate: {
    type: Date,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

// props.defaultDate가 없으면 오늘 날짜로 설정
const selectedDate = ref(props.defaultDate || dayjs().toDate());
</script>

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import 'dayjs/locale/ko' // Import Korean locale

dayjs.extend(utc)
dayjs.extend(timezone)

export default defineNuxtPlugin(() => {
  // Set default timezone to Korea Standard Time (KST)
  dayjs.tz.setDefault('Asia/Seoul')
  dayjs.locale('ko') // Set default locale to Korean

  // Optionally, you can make dayjs available globally or through provide
  return {
    provide: {
      dayjs
    }
  }
}) 
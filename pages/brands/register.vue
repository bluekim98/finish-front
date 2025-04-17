<script setup lang="ts">
import { type VForm } from 'vuetify/components';
import DatePicker from '@/views/common/DatePicker.vue';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import RegisterMiddleCategorySearchForm from '@/components/brands/register-middle-category-search-form.vue';

const defaultBody: CaribbeanApiPostRequestBody['/brand'] = {
  brandName: '',
  largeGbn: '',
  upperEstCd: '',
  serviceYn: 'N',
  openDateTime: dayjs().add(4, 'day').hour(9).minute(0).second(0).toISOString(),
  phoneCollectionDateTimeStart: dayjs().hour(9).minute(0).second(0).toISOString(),
  phoneCollectionDateTimeEnd: dayjs().add(3, 'day').hour(23).minute(59).second(59).toISOString(),
  brandPath: undefined,
};

const body = reactive({
  ...defaultBody,
});

const showMiddleCategorySearch = ref(false);

const formRef = ref<VForm | null>(null);
const brandPathRef = ref<any>(null);

const showExtra = computed(() => showMiddleCategorySearch.value);

const router = useRouter();

const { snacks, showSnackbar } = useSnackbar();

const closeSearchForm = () => {
  showMiddleCategorySearch.value = false;
};

const selectMiddleCategoryItem = (item: CaribbeanApiResponseBody['/brand/convertible']['get']['items'][number]) => {
  if (item.estCd) {
    body.largeGbn = item.estCd;
    body.upperEstCd = item.estCd;
  }

  closeSearchForm();
};

const register = async () => {
  const isFormValid = await formRef.value?.validate();

  const isValidOpenDateTime = body.openDateTime != null;
  const isValidPhoneCollectionDateTimeStart = body.phoneCollectionDateTimeStart != null;
  const isValidPhoneCollectionDateTimeEnd = body.phoneCollectionDateTimeEnd != null;

  if (!isFormValid?.valid) {
    return;
  }

  if (!isValidOpenDateTime) {
    Swal.fire({
      icon: 'warning',
      html: `<div style="white-space: pre-wrap;">오픈 일시를 입력하세요</div>`,
      buttonsStyling: false,
      confirmButtonText: `<div style="background-color: #179860; color: white; padding: 8px 18px; border-radius: 5px;">확인</div>`,
    });
    return;
  }

  if (!isValidPhoneCollectionDateTimeStart) {
    Swal.fire({
      icon: 'warning',
      html: `<div style="white-space: pre-wrap;">전화번호 수집 시작 일시를 입력하세요</div>`,
      buttonsStyling: false,
      confirmButtonText: `<div style="background-color: #179860; color: white; padding: 8px 18px; border-radius: 5px;">확인</div>`,
    });
    return;
  }

  if (!isValidPhoneCollectionDateTimeEnd) {
    Swal.fire({
      icon: 'warning',
      html: `<div style="white-space: pre-wrap;">전화번호 수집 종료 일시를 입력하세요</div>`,
      buttonsStyling: false,
      confirmButtonText: `<div style="background-color: #179860; color: white; padding: 8px 18px; border-radius: 5px;">확인</div>`,
    });
    return;
  }

  if (dayjs(body.phoneCollectionDateTimeStart).diff(dayjs(body.phoneCollectionDateTimeEnd), 'day') > 0) {
    Swal.fire({
      icon: 'warning',
      html: `<div style="white-space: pre-wrap;">전화번호 수집 종료 일시는 시작 일시 이후만 가능합니다</div>`,
      buttonsStyling: false,
      confirmButtonText: `<div style="background-color: #179860; color: white; padding: 8px 18px; border-radius: 5px;">확인</div>`,
    });
    return;
  }

  Swal.fire({
    icon: 'question',
    html: `<div style="white-space: pre-wrap;"><div>FC본사 신규등록 시  가맹점 운영자전화번호를 일괄 등록합니다</div><br /><div style="display: flex; justify-content: flex-start;"> - 전화번호 원본</div><div>: [FreshOn]고객기준정보>기본정보>전화번호1,전화번호2</div><br /><div style="display: flex; justify-content: flex-start;">계속 등록을 진행하시겠습니까?</div></div>`,
    showCancelButton: true,
    buttonsStyling: false,
    confirmButtonText: `<div style="background-color: #179860; color: white; padding: 8px 18px; border-radius: 5px; margin-right: 16px ">예</div>`,
    cancelButtonText: `<div style="background-color: grey; color: white; padding: 8px 18px; border-radius: 5px; margin-right: 16px ">아니오</div>`,
  }).then(async (result) => {
    if (result.isConfirmed) {
      registerBasicInfo();
    }
  });
};

const registerBasicInfo = async () => {
  const { response, error } = await makeCaribbeanClient().POST('/brand', {
    body: {
      ...body,
      brandPath: body.brandPath === '' || body.brandPath == null ? undefined : body.brandPath,
      openDateTime: dayjs(body.openDateTime).toISOString(),
      phoneCollectionDateTimeStart: dayjs(body.phoneCollectionDateTimeStart).toISOString(),
      phoneCollectionDateTimeEnd: dayjs(body.phoneCollectionDateTimeEnd).toISOString(),
    },
  });

  if (response.ok) {
    Swal.fire({
      icon: 'success',
      title: '등록 완료',
      buttonsStyling: false,
      confirmButtonText: `<div style="background-color: #179860; color: white; padding: 8px 18px; border-radius: 5px;">확인</div>`,
    });
    router.push('/brands');
  } else {
    const errorInfo = error as unknown as { code: string; message: string };
    Swal.fire({
      icon: 'error',
      title: '등록 실패',
      html: `<div style="white-space: pre-wrap;">code: ${errorInfo.code}\nmessage: ${errorInfo.message}</div>`,
      buttonsStyling: false,
      confirmButtonText: `<div style="background-color: #179860; color: white; padding: 8px 18px; border-radius: 5px;">확인</div>`,
    });
  }
};

// TODO: [id].vue 에서 동일한 함수 사용 리팩토링 필요
// TODO: 동일한 함수 리팩토링 필요
const removeSpecialChars = (input: string) => {
  const regex = /(?:[\/&<\^~\?%>\[\:# \{\]\*\;\\\=\u201D\|']|\.{2})/g;

  if (regex.test(input)) {
    showSnackbar({
      text: '사용할 수 없는 특수문자 입니다.',
      color: 'error',
      timeout: 2000,
      closeOnContentClick: true,
    });
  }

  return input.replace(regex, '');
};

const handleBrandPathInput = async (value: string) => {
  const cleanedValue = removeSpecialChars(value);

  if (cleanedValue !== value) {
    body.brandPath = cleanedValue;
    await nextTick();

    if (brandPathRef.value) {
      const inputElement = brandPathRef.value.$el.querySelector('input');
      if (inputElement) {
        inputElement.value = cleanedValue;
      }
    }
  }
};

watch(
  () => [body.openDateTime],
  () => {
    body.phoneCollectionDateTimeEnd = dayjs(body.openDateTime)
      .subtract(1, 'day')
      .hour(23)
      .minute(59)
      .second(59)
      .toISOString();
  },
);
</script>

<template>
  <p class="text-2xl">기본정보 등록</p>
  <VRow>
    <VCol cols="12" :md="showExtra ? 6 : 12">
      <VCard>
        <VForm class="my-6 mx-6" ref="formRef" @submit.prevent="register">
          <VRow>
            <VCol md="12">
              <div class="d-flex align-center" style="height: 70px">
                <VRow no-gutters>
                  <VCol cols="12" md="3" class="d-flex align-center">
                    <label for="brandName" class="font-weight-bold d-flex align-center gap-2">
                      <span>브랜드명</span>
                      <span class="text-necessary pt-1">*</span>
                    </label>
                  </VCol>
                  <VCol cols="12" md="9">
                    <VTextField
                      id="brandName"
                      v-model="body.brandName"
                      placeholder="브랜드명"
                      persistent-placeholder
                      clearable
                      :rules="[(value: string) => !!value?.trim() || '브랜드명을 입력하세요']"
                    />
                  </VCol>
                </VRow>
              </div>
            </VCol>

            <VCol md="12">
              <VRow no-gutters>
                <VCol cols="12" md="3" class="d-flex align-center">
                  <label for="largeGbn" class="font-weight-bold">
                    <div>본사고객코드</div>
                    <div>대분류</div>
                  </label>
                </VCol>
                <VCol cols="12" md="9">
                  <div class="d-flex align-center gap-2">
                    <VTextField
                      id="largeGbn"
                      v-model="body.largeGbn"
                      placeholder="본사고객코드 - 대분류"
                      persistent-placeholder
                      disabled
                    />
                  </div>
                </VCol>
              </VRow>
            </VCol>

            <VCol md="12">
              <div class="d-flex align-center" style="height: 70px">
                <VRow no-gutters>
                  <VCol cols="12" md="3" class="d-flex align-center">
                    <label for="upperEstCd" class="font-weight-bold d-flex align-center gap-2">
                      <div>
                        <div>본사고객코드</div>
                        <div>본점고객코드</div>
                      </div>
                      <span class="text-necessary pt-1">*</span>
                    </label>
                  </VCol>
                  <VCol cols="12" md="9">
                    <VTextField
                      id="upperEstCd"
                      v-model="body.upperEstCd"
                      placeholder="본사고객코드 - 본점고객코드"
                      persistent-placeholder
                      @click="showMiddleCategorySearch = true"
                      readonly
                      clearable
                      :rules="[(value: string) => !!value?.trim() || '본사고객코드 본점고객코드를 입력하세요']"
                    />
                  </VCol>
                </VRow>
              </div>
            </VCol>

            <VCol md="12">
              <VRow no-gutters>
                <VCol cols="12" md="3" class="d-flex align-center">
                  <label for="serviceYn" class="font-weight-bold">서비스 대상 여부</label>
                </VCol>
                <VCol cols="12" md="9">
                  <VSelect label="서비스 대상 여부" v-model="body.serviceYn" :items="['Y', 'N']" placeholder="선택" />
                </VCol>
              </VRow>
            </VCol>

            <VCol v-if="body.serviceYn === 'Y'" md="12" class="pt-0">
              <VRow no-gutters>
                <VCol cols="3" />
                <VCol>
                  <div class="text-necessary">
                    * 서비스대상여부가 ‘Y’로 설정할 경우, FreshOn 및 외식UP에 실시간 반영됩니다. 모든 정보가
                    정상등록되었는지 꼭 확인해 주세요.
                  </div>
                </VCol>
              </VRow>
            </VCol>

            <VCol md="12" class="d-flex flex-column gap-2">
              <div class="d-flex align-center" style="height: 70px">
                <VRow no-gutters>
                  <VCol cols="12" md="3" class="d-flex align-center">
                    <label for="openDate" class="font-weight-bold d-flex align-center gap-2">
                      오픈 일시
                      <span class="text-necessary pt-1">*</span>
                    </label>
                  </VCol>
                  <VCol cols="12" md="9">
                    <DatePicker
                      id="openDate"
                      v-model="body.openDateTime"
                      :format="'yyyy-MM-dd HH:mm'"
                      :min-date="dayjs(defaultBody.openDateTime).toDate()"
                      enable-time-picker
                      enable-minutes
                    />
                  </VCol>
                </VRow>
              </div>
            </VCol>

            <VCol md="12">
              <div class="d-flex align-center" style="height: 70px">
                <VRow no-gutters>
                  <VCol md="3" class="d-flex align-center">
                    <label class="font-weight-bold d-flex align-center gap-2">
                      전화번호 수집 기간
                      <span class="text-necessary pt-1">*</span>
                    </label>
                  </VCol>
                  <VCol class="d-flex align-center">
                    <DatePicker
                      v-model="body.phoneCollectionDateTimeStart"
                      :format="'yyyy-MM-dd HH:mm'"
                      :min-date="dayjs(defaultBody.phoneCollectionDateTimeStart).toDate()"
                      enable-time-picker
                      enable-minutes
                    />
                  </VCol>
                  <VCol md="auto" class="d-flex align-center px-2">
                    <span>~</span>
                  </VCol>
                  <VCol class="d-flex align-center">
                    <DatePicker
                      v-model="body.phoneCollectionDateTimeEnd"
                      :format="'yyyy-MM-dd HH:mm'"
                      :min-date="dayjs(body.phoneCollectionDateTimeStart).toDate()"
                      enable-time-picker
                      enable-minutes
                    />
                  </VCol>
                </VRow>
              </div>
            </VCol>

            <VCol md="12">
              <VRow no-gutters>
                <VCol cols="12" md="3" class="d-flex align-center">
                  <label for="brandPath" class="font-weight-bold d-flex align-center gap-2">Path</label>
                </VCol>
                <VCol cols="12" md="9">
                  <VTextField
                    ref="brandPathRef"
                    id="brandPath"
                    v-model="body.brandPath"
                    placeholder="브랜드 Path"
                    persistent-placeholder
                    clearable
                    @update:model-value="handleBrandPathInput"
                  />
                </VCol>
                <VSnackbarQueue v-model="snacks" />
              </VRow>
            </VCol>

            <VCol md="12" class="pt-0">
              <VRow no-gutters>
                <VCol cols="3" />
                <VCol>
                  <div class="text-secondary">
                    path 생성 시 고객사 전용 주소로 제공합니다.
                    <br />
                    ex&#41; sfood 입력 시 -> www.oesikup.com/@sfood 로 제공
                  </div>
                </VCol>
              </VRow>
            </VCol>
          </VRow>

          <VCol cols="12" class="d-flex justify-end pr-0">
            <VBtn type="submit">등록</VBtn>
          </VCol>
        </VForm>
      </VCard>
    </VCol>

    <VCol cols="6" v-if="showExtra">
      <VCard class="d-flex flex-column h-100">
        <RegisterMiddleCategorySearchForm
          :show-middle-category-search="showMiddleCategorySearch"
          :select-middle-category-item="selectMiddleCategoryItem"
          :closeSearchForm="closeSearchForm"
        />
      </VCard>
    </VCol>
  </VRow>
</template>

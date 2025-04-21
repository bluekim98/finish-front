<script setup lang="ts">
import { type VForm } from 'vuetify/components';
import DatePicker from '@/views/common/DatePicker.vue';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import RegisterMiddleCategorySearchForm from '@/components/brands/register-middle-category-search-form.vue';

const defaultBody: ApiPostRequestBody['/brand'] = {
  membershipName: '',
  branchNameList: [],
  largeGbn: '',
  upperEstCd: '',
  serviceYn: 'N',
  openDateTime: dayjs().add(4, 'day').hour(9).minute(0).second(0).toISOString(),
  phoneCollectionDateTimeStart: dayjs().hour(9).minute(0).second(0).toISOString(),
  phoneCollectionDateTimeEnd: dayjs().add(3, 'day').hour(23).minute(59).second(59).toISOString(),
  brandPath: undefined,
};

const selectedBranchNameList = ref<string[]>([]);

const body = reactive({
  ...defaultBody,
});

const showMiddleCategorySearch = ref(false);

const formRef = ref<VForm | null>(null);
const brandPathRef = ref<any>(null);
const branchNameRef = ref<any>(null);

const showExtra = computed(() => showMiddleCategorySearch.value);

const router = useRouter();

const { snacks, showSnackbar } = useSnackbar();

const closeSearchForm = () => {
  showMiddleCategorySearch.value = false;
};

const selectMiddleCategoryItem = (item: ApiResponseBody['/brand/convertible']['get']['items'][number]) => {
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
  const { response, error } = await makeApiClient().POST('/brand', {
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
  showSnackbar({
    text: '사용할 수 없는 특수문자 입니다.',
    color: 'error',
    timeout: 2000,
    closeOnContentClick: true,
  });
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

const deleteSelectedBranch = (branch: string) => {
  const index = selectedBranchNameList.value.findIndex((item) => item === branch);
  if (index !== -1) {
    selectedBranchNameList.value = selectedBranchNameList.value.filter((item) => item !== branch);
    body.branchNameList = [...selectedBranchNameList.value];
    branchNameRef.value = null;
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

watch(
  branchNameRef,
  (newValue) => {
    if (newValue) {
      if (selectedBranchNameList.value.includes(newValue)) {
        showSnackbar({
          text: '이미 선택된 지점입니다.',
          color: 'error',
          timeout: 2000,
          closeOnContentClick: true,
        });
        return;
      }
      selectedBranchNameList.value.push(newValue);
      branchNameRef.value = null;
      body.branchNameList = [...selectedBranchNameList.value];
    }
  },
  { immediate: true },
);
</script>

<template>
  <p class="text-2xl">강사 등록</p>
  <VRow>
    <VCol cols="12" :md="showExtra ? 6 : 12">
      <VCard>
        <VForm class="my-6 mx-6" ref="formRef" @submit.prevent="register">
          <VRow>
            <VCol md="12">
              <div class="d-flex align-center" style="height: 70px">
                <VRow no-gutters>
                  <VCol cols="12" md="3" class="d-flex align-center">
                    <label for="membershipName" class="font-weight-bold d-flex align-center gap-2">
                      <span>강사명</span>
                      <span class="text-necessary pt-1">*</span>
                    </label>
                  </VCol>
                  <VCol cols="12" md="9">
                    <VTextField
                      id="membershipName"
                      v-model="body.membershipName"
                      placeholder="강사명"
                      persistent-placeholder
                      clearable
                      :rules="[(value: string) => !!value?.trim() || '강사명을 입력하세요']"
                    />
                  </VCol>
                </VRow>
              </div>
            </VCol>
            <VCol md="12">
              <div class="d-flex align-center" style="height: 70px">
                <VRow no-gutters>
                  <VCol cols="12" md="3" class="d-flex align-center">
                    <label for="membershipName" class="font-weight-bold d-flex align-center gap-2">
                      <span>휴대전화번호</span>
                      <span class="text-necessary pt-1">*</span>
                    </label>
                  </VCol>
                  <VCol cols="12" md="9">
                    <VTextField
                      id="membershipName"
                      v-model="body.membershipName"
                      placeholder="휴대전화번호"
                      persistent-placeholder
                      clearable
                      :rules="[(value: string) => !!value?.trim() || '휴대전화번호를 입력하세요']"
                    />
                  </VCol>
                </VRow>
              </div>
            </VCol>

            <VCol md="12">
              <VRow no-gutters>
                <VCol cols="12" md="3" class="d-flex align-center">
                  <label for="membershipName" class="font-weight-bold d-flex align-center gap-2">
                    <span>지점</span>
                    <span class="text-necessary pt-1">*</span>
                  </label>
                </VCol>
                <VCol cols="12" md="9">
                  <div class="d-flex align-center gap-2">
                    <VSelect v-model="branchNameRef" :items="['인덕원점', '호계점']" placeholder="선택" />
                  </div>
                  <div class="d-flex align-center">
                    <span class="text-necessary pt-1">*</span>
                    <span class="mr-1">선택된 지점 ::</span>
                    <VChip
                      v-for="(branch, index) in selectedBranchNameList"
                      :key="branch"
                      class="ma-1"
                      closable
                      @click:close="deleteSelectedBranch(branch)"
                      size="small"
                      color="primary"
                      variant="outlined"
                    >
                      {{ branch }}
                    </VChip>
                  </div>
                  <VSnackbarQueue v-model="snacks" />
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

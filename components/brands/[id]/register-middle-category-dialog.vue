<script setup lang="ts">
import type { UploadFileTypes } from '@/pages/brands/[id].vue';
import Swal from 'sweetalert2';
import LogoUploader from './logo-uploader.vue';
import SelectBackgroundColorDialog from './select-background-color-dialog.vue';
import { v4 as uuid4 } from 'uuid';
import type { VForm } from 'vuetify/components';
import SelectAppLauncherIconKeyDialog from './select-app-launcher-icon-key-dialog.vue';

const props = defineProps({
  dialog: {
    type: Boolean,
    required: true,
  },
  brandId: {
    type: Number,
    required: true,
  },
  brandName: {
    type: String,
    required: true,
  },
  middleCategoryName: {
    type: String,
    required: true,
  },
  middleCategoryCode: {
    type: String,
    required: true,
  },
  headquarterBrandPath: {
    type: String,
    default: undefined,
  },
});

const emit = defineEmits(['update:dialog', 'close-dialog', 'refetch']);

const defaultBody: CaribbeanApiPostRequestBody['/brand/{brandId}/middle-category'] = {
  middleGbn: props.middleCategoryCode,
  brandName: '',
  brandPath: undefined,
  pcLogoAttachSeqId: undefined,
  pcBackgroundColor: undefined,
  mobileLogoAttachSeqId: undefined,
  mobileBackgroundColor: undefined,
  faviconAttachSeqId: undefined,
  appLauncherIconKey: undefined,
  sameHeadquarterPathYn: 'Y',
};

const body = reactive({
  ...defaultBody,
});

const logoInfo = ref({
  pcLogoUri: '',
  pcLogoAttachSeqId: undefined as CaribbeanApiPostRequestBody['/brand/{brandId}/middle-category']['pcLogoAttachSeqId'],
  mobileLogoUri: '',
  mobileLogoAttachSeqId:
    undefined as CaribbeanApiPostRequestBody['/brand/{brandId}/middle-category']['mobileLogoAttachSeqId'],
  faviconUri: '',
  faviconAttachSeqId:
    undefined as CaribbeanApiPostRequestBody['/brand/{brandId}/middle-category']['faviconAttachSeqId'],
});

const isBrandNameOrBrandPathEmpty = computed(() => {
  const info = body;
  if (!info) return true;

  const isNameEmpty = !info.brandName?.trim();
  const isPathEmpty = info.sameHeadquarterPathYn !== 'Y' && !info.brandPath?.trim();

  return isNameEmpty || isPathEmpty;
});

const { snacks, showSnackbar } = useSnackbar();

const appIconDialog = ref(false);
const localDialog = ref(props.dialog);

const formRef = ref<VForm | null>(null);

const brandPathFieldRef = ref<any>(null);

const isBrandPathSame = ref(true);

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

    if (brandPathFieldRef.value) {
      const inputElement = brandPathFieldRef.value.$el.querySelector('input');
      if (inputElement) {
        inputElement.value = cleanedValue;
      }
    }
  }
};

const handleRemoveInfo = (type: UploadFileTypes) => {
  if (type === 'pcLogo') {
    logoInfo.value.pcLogoUri = '';
    logoInfo.value.pcLogoAttachSeqId = undefined;
  } else if (type === 'mobileLogo') {
    logoInfo.value.mobileLogoUri = '';
    logoInfo.value.mobileLogoAttachSeqId = undefined;
  } else if (type === 'favicon') {
    logoInfo.value.faviconUri = '';
    logoInfo.value.faviconAttachSeqId = undefined;
  } else if (type === 'appLauncher') {
    body.appLauncherIconKey = '';
  }
};

const uploadImage = async (file: File, type: UploadFileTypes) => {
  const { data, error } = await makeCaribbeanClient().POST('/files/upload', {
    body: {
      file: '',
    },
    bodySerializer: () => {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        return formData;
      }
    },
  });

  if (data) {
    if (type === 'pcLogo') {
      logoInfo.value.pcLogoUri = data.fileUri;
      logoInfo.value.pcLogoAttachSeqId = data.sysAttachInfoSeqId;
    } else if (type === 'mobileLogo') {
      logoInfo.value.mobileLogoUri = data.fileUri;
      logoInfo.value.mobileLogoAttachSeqId = data.sysAttachInfoSeqId;
    } else {
      logoInfo.value.faviconUri = data.fileUri;
      logoInfo.value.faviconAttachSeqId = data.sysAttachInfoSeqId;
    }
  } else {
    const errorInfo = error as unknown as { code: string; message: string };
    Swal.fire({
      icon: 'error',
      html: `<div style="white-space: pre-wrap;">업로드 실패\n\ncode: ${errorInfo.code}\n\nmessage: ${errorInfo.message}</div>`,
      buttonsStyling: false,
      confirmButtonText: `<div style="background-color: #179860; color: white; padding: 8px 18px; border-radius: 5px;">확인</div>`,
    });
  }
};

// TODO: undefined를 보내도록 wrapper 만드는 게 나을 듯
const save = async () => {
  const isFormValid = await formRef.value?.validate();

  if (!isFormValid?.valid) {
    return;
  }

  const { response, error } = await makeCaribbeanClient().POST('/brand/{brandId}/middle-category', {
    params: {
      path: {
        brandId: props.brandId,
      },
    },
    body: {
      ...body,
      pcBackgroundColor:
        body.pcBackgroundColor === '' || body.pcBackgroundColor == null ? undefined : body.pcBackgroundColor,
      mobileBackgroundColor:
        body.mobileBackgroundColor === '' || body.mobileBackgroundColor == null
          ? undefined
          : body.mobileBackgroundColor,
      appLauncherIconKey:
        body.appLauncherIconKey === '' || body.appLauncherIconKey == null ? undefined : body.appLauncherIconKey,
      pcLogoAttachSeqId: logoInfo.value.pcLogoAttachSeqId,
      mobileLogoAttachSeqId: logoInfo.value.mobileLogoAttachSeqId,
      faviconAttachSeqId: logoInfo.value.faviconAttachSeqId,
    },
  });

  if (response.ok) {
    Swal.fire({
      icon: 'success',
      title: '저장 완료',
      buttonsStyling: false,
      confirmButtonText: `<div style="background-color: #179860; color: white; padding: 8px 18px; border-radius: 5px;">확인</div>`,
    });
    emit('refetch');
  } else {
    const errorInfo = error as unknown as { code: string; message: string };
    Swal.fire({
      icon: 'error',
      title: '저장 실패',
      html: `<div style="white-space: pre-wrap;">code: ${errorInfo.code}\nmessage: ${errorInfo.message}</div>`,
      buttonsStyling: false,
      confirmButtonText: `<div style="background-color: #179860; color: white; padding: 8px 18px; border-radius: 5px;">확인</div>`,
    });
  }
  emit('close-dialog');
};

watch(
  () => props.dialog,
  (newValue) => {
    localDialog.value = newValue;
  },
);

watch(localDialog, (newValue) => {
  emit('update:dialog', newValue);
});
</script>

<template>
  <VDialog v-model="localDialog" width="1024">
    <VCard class="pa-12 d-flex flex-column gap-11">
      <div class="text-h4 font-weight-bold">
        <span class="text-primary">{{ props.brandName }}</span>
        브랜드 BI 분리
      </div>

      <div class="text-h5 font-weight-bold">
        <span class="text-primary">{{ `${props.middleCategoryName}(${props.middleCategoryCode})` }}</span>
        BI 정보 입력
      </div>

      <VForm ref="formRef" @submit.prevent="save">
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
              <label for="brandPath" class="font-weight-bold d-flex align-center gap-2">
                <span>Path</span>
                <span class="text-necessary pt-1">*</span>
              </label>
            </VCol>

            <VCol cols="12" md="6">
              <VTextField
                ref="brandPathFieldRef"
                id="brandPath"
                v-model="body.brandPath"
                placeholder="브랜드 Path"
                class="no-details-padding"
                persistent-placeholder
                clearable
                :disabled="body.sameHeadquarterPathYn === 'Y'"
                @update:model-value="handleBrandPathInput"
                :rules="[
                  (value: string) => body.sameHeadquarterPathYn === 'Y' || !!value?.trim() || '* Path를 입력해주세요.',
                ]"
              />
            </VCol>
            <VCol cols="auto">
              <VCheckbox
                label="대분류와동일"
                v-model="body.sameHeadquarterPathYn"
                :true-value="'Y'"
                :false-value="'N'"
                @update:model-value="
                  (checked) => {
                    if (checked) body.brandPath = undefined;
                  }
                "
              ></VCheckbox>
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

        <VCol cols="12">
          <div class="font-weight-bold">로그인지면 및 PC 홈</div>
          <VCol cols="12" class="pl-10 pb-0">
            <div class="d-flex align-center" style="height: 100px">
              <VRow no-gutters>
                <VCol cols="12" md="4" class="d-flex align-center">
                  <label>로고이미지</label>
                </VCol>
                <LogoUploader
                  :id="uuid4()"
                  :src="logoInfo.pcLogoUri"
                  @file-changed="(file) => uploadImage(file, 'pcLogo')"
                  @file-removed="handleRemoveInfo('pcLogo')"
                />
              </VRow>
            </div>
          </VCol>

          <VCol cols="12" class="pl-10 pt-3">
            <div class="d-flex align-center">
              <VRow no-gutters>
                <VCol cols="12" md="4" class="d-flex align-center">
                  <label>배경색</label>
                </VCol>
                <SelectBackgroundColorDialog
                  v-model:bgColor="body.pcBackgroundColor"
                  :initialBgColor="body.pcBackgroundColor"
                />
              </VRow>
            </div>
          </VCol>

          <div class="font-weight-bold pt-8">모바일 홈</div>
          <VCol cols="12" class="pl-10 pb-0">
            <div class="d-flex align-center">
              <VRow no-gutters>
                <VCol cols="12" md="4" class="d-flex align-center" style="height: 100px">
                  <label>로고이미지</label>
                </VCol>
                <LogoUploader
                  :id="uuid4()"
                  :src="logoInfo.mobileLogoUri"
                  @file-changed="(file) => uploadImage(file, 'mobileLogo')"
                  @file-removed="handleRemoveInfo('mobileLogo')"
                />
              </VRow>
            </div>
          </VCol>

          <VCol cols="12" class="pl-10 pt-3">
            <div class="d-flex align-center">
              <VRow no-gutters>
                <VCol cols="12" md="4" class="d-flex align-center">
                  <label>배경색</label>
                </VCol>
                <SelectBackgroundColorDialog
                  v-model:bgColor="body.mobileBackgroundColor"
                  :initialBgColor="body.mobileBackgroundColor"
                />
              </VRow>
            </div>
          </VCol>

          <div class="font-weight-bold pt-8">파비콘</div>
          <VCol cols="12" class="pl-10 pb-0">
            <div class="d-flex align-center">
              <VRow no-gutters>
                <VCol cols="12" md="4" class="d-flex align-center" style="height: 100px">
                  <label>로고이미지</label>
                </VCol>
                <LogoUploader
                  :id="uuid4()"
                  :src="logoInfo.faviconUri"
                  @file-changed="(file) => uploadImage(file, 'favicon')"
                  @file-removed="handleRemoveInfo('favicon')"
                />
              </VRow>
            </div>
          </VCol>

          <div class="d-flex align-center pt-8" style="height: 60px">
            <VRow no-gutters class="d-flex gap-40">
              <div class="font-weight-bold d-flex align-center">앱 런쳐 아이콘 식별정보</div>
              <SelectAppLauncherIconKeyDialog
                :custom-class="'flex-grow-1 mr-3'"
                v-model:dialog="appIconDialog"
                v-model:appLauncherIconKey="body.appLauncherIconKey"
                @file-removed="handleRemoveInfo('appLauncher')"
              />
            </VRow>
          </div>
        </VCol>

        <VCol cols="auto" class="d-flex flex-wrap gap-4 justify-end align-center pt-11">
          <VBtn color="secondary" variant="outlined" @click.prevent="emit('close-dialog')">닫기</VBtn>
          <VBtn type="submit" :disabled="isBrandNameOrBrandPathEmpty">저장</VBtn>
        </VCol>
      </VForm>
    </VCard>
  </VDialog>
</template>

<style scoped>
.no-details-padding ::v-deep(.v-input__details) {
  padding-left: 0;
}
</style>

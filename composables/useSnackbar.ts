import type { VSnackbarQueue } from 'vuetify/labs/components';

type Snackbar = InstanceType<typeof VSnackbarQueue> | {};

export const useSnackbar = () => {
  const snacks = ref<Snackbar[]>([]);

  const showSnackbar = (snack: Snackbar) => {
    snacks.value.push(snack);
  };

  return {
    snacks,
    showSnackbar,
  };
};

import { ref } from "vue";
import { Args, SubmitPayload } from "./types/vue-use-formspark";

const BASE_URL = "https://submit-form.com";

export const useFormspark = (args: Args) => {
  const submitting = ref(false);

  const submit = async (payload: SubmitPayload): Promise<unknown> => {
    submitting.value = true;
    try {
      const response = await fetch(
        `${BASE_URL}/${encodeURIComponent(args.formId)}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      return await response.json();
    } finally {
      submitting.value = false;
    }
  };

  return [submit, submitting] as const;
};

export * from "./types/vue-use-formspark";

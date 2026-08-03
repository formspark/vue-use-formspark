<p align="center">
    <a href="https://formspark.io">
        <img width="64" src="https://cdn.formspark.io/images/formspark/logos/formspark.svg" alt="Formspark logo">
    </a>
</p>

<h1 align="center">vue-use-formspark</h1>

<p align="center">
    Vue composition API functions for <a href="https://formspark.io">Formspark</a>.
</p>

## Installation

```bash
# NPM
npm install @formspark/vue-use-formspark

# PNPM
pnpm add @formspark/vue-use-formspark

# Yarn
yarn add @formspark/vue-use-formspark
```

## Usage

`useFormspark` returns a `[submit, submitting]` tuple: `submit` posts a payload to your form and resolves with the JSON response, and `submitting` is a ref that is `true` while a submission is in flight.

```vue
<template>
  <form @submit.prevent="onSubmit">
    <textarea v-model="message" />
    <button type="submit" :disabled="submitting">Send</button>
  </form>
</template>

<script setup>
import { ref } from "vue";
import { useFormspark } from "@formspark/vue-use-formspark";

const [submit, submitting] = useFormspark({
  formId: "your-form-id",
});

const message = ref("");

const onSubmit = async () => {
  await submit({ message: message.value });
  message.value = "";
};
</script>
```

**Note:** do not confuse the action URL (e.g. `https://submit-form.com/capybara`) with the form ID (e.g. `capybara`); this package only uses the latter.

## License

[MIT](https://opensource.org/licenses/MIT)

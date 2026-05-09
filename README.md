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

# Yarn 
yarn add @formspark/vue-use-formspark
```

## Usage

```vue
<template>
  <form @submit="onSubmit">
    <textarea v-model="message" @input="onInput"/>
    <button type="submit" :disabled="submitting">Send</button>
  </form>
</template>

<script>
import { ref } from "vue";
import { useFormspark } from "@formspark/vue-use-formspark";
export default {
  setup() {
    const message = ref("");
    
    const [submit, submitting] = useFormspark({
      formId: "your-form-id"
    });

    const onInput = e => {
      message.value = e.target.value;
    };
    
    const onSubmit = async e => {
      e.preventDefault();
      await submit({ message: message.value })
      message.value = "";
    };
    
    return {
      message,
      onInput,
      onSubmit,
      submitting,
    };
  }
};
</script>
```

**Note:** do not confuse the action URL (e.g. `https://submit-form.com/capybara`) with the form ID (e.g. `capybara`); this package only uses the latter.

## License

[MIT](https://opensource.org/licenses/MIT)